import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatKnowledgeBase } from '@/data/mock/chat-kb';
import { apiError, validateBody, sanitizeString } from '@/lib/api-utils';
import { chatbotMessageSchema } from '@/lib/validations';
import type { ChatLanguage } from '@/types';

// --- Rate Limiting (in-memory, per-IP) ---
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Periodic cleanup to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

// --- Helpers ---
const LANGUAGE_NAMES: Record<ChatLanguage, string> = {
  en: 'English',
  fr: 'French',
  ar: 'Arabic',
  zh: 'Chinese',
  sw: 'Swahili',
};

function findRelevantKBEntries(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const matches: string[] = [];

  for (const item of chatKnowledgeBase) {
    const keywordMatch = item.keywords.some(keyword =>
      lowerQuery.includes(keyword.toLowerCase())
    );

    if (keywordMatch || lowerQuery.includes(item.question.toLowerCase())) {
      matches.push(`Q: ${item.question}\nA: ${item.answer}`);
    }
  }

  return matches;
}

function buildSystemPrompt(language: ChatLanguage, kbContext: string[]): string {
  const langName = LANGUAGE_NAMES[language] || 'English';

  let prompt =
    `You are the official AI assistant for the Uganda Investment Authority (UIA) One-Stop Centre. ` +
    `Your role is to help potential investors with information about investing in Uganda.\n\n` +

    `## SCOPE RESTRICTION — STRICTLY ENFORCED\n` +
    `You ONLY answer questions about these topics:\n` +
    `- Investment procedures, requirements, and timelines in Uganda\n` +
    `- Business registration and licensing (URSB, UIA, sector-specific)\n` +
    `- Tax incentives, rates, exemptions, and URA registration\n` +
    `- Sector opportunities: agriculture, tourism, ICT, manufacturing, mining, energy, health, real estate\n` +
    `- Work permits, visas, and immigration for investors\n` +
    `- Industrial parks, free zones, and special economic zones\n` +
    `- Land acquisition for foreign investors\n` +
    `- Environmental approvals (NEMA/EIA)\n` +
    `- Financing and banking for investors\n` +
    `- Regional market access (EAC, COMESA, AfCFTA)\n` +
    `- UIA contact information, office locations, and services\n` +
    `- Uganda economic overview and investment climate\n` +
    `- Investment dispute resolution\n` +
    `- Product standards and certifications (UNBS)\n\n` +

    `For ANY question outside these topics, respond ONLY with:\n` +
    `"I'm specifically designed to help with investment-related inquiries about Uganda. ` +
    `I can assist you with business registration, tax incentives, sector opportunities, work permits, ` +
    `and other investment topics. How can I help you with your investment journey?"\n\n` +

    `## RESPONSE GUIDELINES\n` +
    `- Respond in ${langName}.\n` +
    `- Be professional, helpful, and concise.\n` +
    `- Use bullet points for lists.\n` +
    `- Keep responses under 200 words when possible.\n` +
    `- End with a relevant follow-up question to guide the conversation.\n` +
    `- Provide specific contact details, costs, and timelines when available.\n` +
    `- When you don't have specific UIA information, use your general knowledge but note that ` +
    `the user should verify with UIA directly at +256-414-301000 or info@ugandainvest.go.ug.\n` +
    `- Never fabricate specific UIA procedures, fees, or contact details that aren't in the provided context.\n\n` +

    `## SENTIMENT TAG — MANDATORY\n` +
    `At the very end of EVERY response, append exactly one of these tags on a new line:\n` +
    `[SENTIMENT:positive] — if the user seems satisfied, interested, or enthusiastic\n` +
    `[SENTIMENT:neutral] — if the user is asking informational questions without strong emotion\n` +
    `[SENTIMENT:negative] — if the user seems frustrated, confused, disappointed, or is reporting a problem\n` +
    `This tag must be the last line. Do not explain it.\n`;

  if (kbContext.length > 0) {
    prompt +=
      `\nThe following verified UIA knowledge base entries are relevant to this conversation. ` +
      `Use them as your primary source of truth:\n\n` +
      kbContext.join('\n\n');
  }

  return prompt;
}

function parseSentiment(text: string): { response: string; sentiment?: 'positive' | 'neutral' | 'negative' } {
  const sentimentRegex = /\[SENTIMENT:(positive|neutral|negative)\]\s*$/;
  const match = text.match(sentimentRegex);

  if (match) {
    return {
      response: text.replace(sentimentRegex, '').trimEnd(),
      sentiment: match[1] as 'positive' | 'neutral' | 'negative',
    };
  }

  return { response: text };
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return apiError('Too many requests. Please wait a moment before trying again.', 429, 'RATE_LIMITED');
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return apiError('Chatbot service is not configured', 500, 'NOT_CONFIGURED');
  }

  const [data, err] = await validateBody(request, chatbotMessageSchema);
  if (err) return err;

  const sanitizedMessage = sanitizeString(data.message);

  try {
    const kbEntries = findRelevantKBEntries(sanitizedMessage);
    const systemPrompt = buildSystemPrompt(data.language, kbEntries);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const chatHistory = data.history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(sanitizedMessage);
    const rawResponse = result.response.text();

    const { response, sentiment } = parseSentiment(rawResponse);

    return NextResponse.json({ success: true, response, sentiment });
  } catch (error) {
    console.error('Gemini API error:', error);
    return apiError('Failed to generate response');
  }
}
