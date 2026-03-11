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

// Translated error messages so non-English users understand API failures
const ERROR_MESSAGES: Record<ChatLanguage, { quota: string; config: string; general: string }> = {
  en: {
    quota: 'The AI assistant is temporarily unavailable due to high demand. Please try again later or contact UIA directly at +256-414-301000.',
    config: 'The AI assistant is not properly configured. Please contact support.',
    general: 'The AI assistant encountered an error. Please try again or contact UIA at +256-414-301000.',
  },
  fr: {
    quota: "L'assistant IA est temporairement indisponible en raison d'une forte demande. Veuillez r\u00e9essayer plus tard ou contacter l'UIA au +256-414-301000.",
    config: "L'assistant IA n'est pas correctement configur\u00e9. Veuillez contacter le support.",
    general: "L'assistant IA a rencontr\u00e9 une erreur. Veuillez r\u00e9essayer ou contacter l'UIA au +256-414-301000.",
  },
  ar: {
    quota: '\u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u0645\u0624\u0642\u062a\u0627\u064b \u0628\u0633\u0628\u0628 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0643\u0628\u064a\u0631. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0644\u0627\u062d\u0642\u0627\u064b \u0623\u0648 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0640 UIA \u0639\u0644\u0649 +256-414-301000.',
    config: '\u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a \u063a\u064a\u0631 \u0645\u0647\u064a\u0623 \u0628\u0634\u0643\u0644 \u0635\u062d\u064a\u062d. \u064a\u0631\u062c\u0649 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u062f\u0639\u0645.',
    general: '\u0648\u0627\u062c\u0647 \u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a \u062e\u0637\u0623. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0623\u0648 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0640 UIA \u0639\u0644\u0649 +256-414-301000.',
  },
  zh: {
    quota: 'AI\u52a9\u624b\u56e0\u9700\u6c42\u91cf\u5927\u6682\u65f6\u4e0d\u53ef\u7528\u3002\u8bf7\u7a0d\u540e\u91cd\u8bd5\u6216\u76f4\u63a5\u8054\u7cfbUIA\uff0c\u7535\u8bdd\uff1a+256-414-301000\u3002',
    config: 'AI\u52a9\u624b\u672a\u6b63\u786e\u914d\u7f6e\u3002\u8bf7\u8054\u7cfb\u6280\u672f\u652f\u6301\u3002',
    general: 'AI\u52a9\u624b\u9047\u5230\u9519\u8bef\u3002\u8bf7\u91cd\u8bd5\u6216\u8054\u7cfbUIA\uff0c\u7535\u8bdd\uff1a+256-414-301000\u3002',
  },
  sw: {
    quota: 'Msaidizi wa AI hapatikani kwa muda kutokana na mahitaji makubwa. Tafadhali jaribu tena baadaye au wasiliana na UIA kwa +256-414-301000.',
    config: 'Msaidizi wa AI hajaundwa vizuri. Tafadhali wasiliana na msaada.',
    general: 'Msaidizi wa AI amekutana na hitilafu. Tafadhali jaribu tena au wasiliana na UIA kwa +256-414-301000.',
  },
};

// Maps non-English investment terms to English KB keywords.
// Enables KB lookup when user queries in French, Swahili, Arabic, or Chinese.
const MULTILINGUAL_TERMS: Record<string, string[]> = {
  // French
  entreprise: ['business', 'company'], enregistrer: ['register'], enregistrement: ['registration'],
  investir: ['invest'], investissement: ['investment'], licence: ['license'],
  taxe: ['tax'], impot: ['tax'], tva: ['VAT'], agriculture: ['agriculture'],
  tourisme: ['tourism'], fabrication: ['manufacturing'], energie: ['energy'],
  minier: ['mining'], terrain: ['land'], financement: ['finance'],
  travail: ['work'], visa: ['visa'], environnement: ['environmental'],
  commerce: ['trade'], economie: ['economy'],
  // Swahili
  biashara: ['business'], usajili: ['registration'], uwekezaji: ['investment'],
  leseni: ['license'], kodi: ['tax'], kilimo: ['agriculture'], utalii: ['tourism'],
  viwanda: ['manufacturing'], nishati: ['energy'], madini: ['mining'],
  ardhi: ['land'], benki: ['bank'], kazi: ['work'], mazingira: ['environmental'],
  // Arabic
  '\u0634\u0631\u0643\u0629': ['company'], '\u0627\u0633\u062a\u062b\u0645\u0627\u0631': ['investment'],
  '\u062a\u0633\u062c\u064a\u0644': ['register'], '\u0636\u0631\u064a\u0628\u0629': ['tax'],
  '\u0632\u0631\u0627\u0639\u0629': ['agriculture'], '\u0633\u064a\u0627\u062d\u0629': ['tourism'],
  '\u0635\u0646\u0627\u0639\u0629': ['manufacturing'], '\u0637\u0627\u0642\u0629': ['energy'],
  '\u062a\u0639\u062f\u064a\u0646': ['mining'], '\u0623\u0631\u0636': ['land'],
  '\u062a\u0645\u0648\u064a\u0644': ['finance'], '\u062a\u062c\u0627\u0631\u0629': ['trade'],
  // Chinese
  '\u6295\u8d44': ['investment'], '\u516c\u53f8': ['company'], '\u6ce8\u518c': ['register'],
  '\u7a0e': ['tax'], '\u519c\u4e1a': ['agriculture'], '\u65c5\u6e38': ['tourism'],
  '\u5236\u9020\u4e1a': ['manufacturing'], '\u80fd\u6e90': ['energy'],
  '\u77ff\u4e1a': ['mining'], '\u571f\u5730': ['land'], '\u878d\u8d44': ['finance'],
  '\u8d38\u6613': ['trade'], '\u5de5\u4f5c': ['work'], '\u7b7e\u8bc1': ['visa'],
};

function findRelevantKBEntries(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const matches: string[] = [];

  // Expand query with English equivalents of non-English terms
  // Uses substring scan so Chinese (no spaces) and Arabic (attached particles) work
  const expandedTerms: string[] = [];
  for (const [foreign, english] of Object.entries(MULTILINGUAL_TERMS)) {
    if (lowerQuery.includes(foreign)) {
      expandedTerms.push(...english);
    }
  }

  for (const item of chatKnowledgeBase) {
    // Match against original query (works for English)
    const keywordMatch = item.keywords.some(keyword =>
      lowerQuery.includes(keyword.toLowerCase())
    );

    // Match against expanded English terms (works for non-English)
    const expandedMatch = expandedTerms.some(term =>
      item.keywords.some(kw => kw.toLowerCase().includes(term))
    );

    if (keywordMatch || expandedMatch || lowerQuery.includes(item.question.toLowerCase())) {
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

    `## LANGUAGE — CRITICAL\n` +
    `The user's selected language is **${langName}**.\n` +
    `You MUST respond entirely in ${langName}. This includes greetings, explanations, ` +
    `follow-up questions, and the out-of-scope rejection message.\n` +
    `If the user writes in a different language, still respond in ${langName} ` +
    `(they chose it as their preferred language).\n` +
    `The knowledge base entries below are in English — translate them naturally into ${langName} in your response.\n\n` +

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

    `For ANY question outside these topics, politely decline in ${langName} ` +
    `and suggest investment-related topics you can help with.\n\n` +

    `## RESPONSE GUIDELINES\n` +
    `- Respond in ${langName}.\n` +
    `- Be professional, helpful, and concise.\n` +
    `- Use bullet points for lists.\n` +
    `- Keep responses under 200 words when possible.\n` +
    `- End with a relevant follow-up question in ${langName} to guide the conversation.\n` +
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
      `Use them as your primary source of truth. Translate the content into ${langName} when responding:\n\n` +
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
  const lang = data.language;
  const errMsgs = ERROR_MESSAGES[lang] || ERROR_MESSAGES.en;

  try {
    const kbEntries = findRelevantKBEntries(sanitizedMessage);
    const systemPrompt = buildSystemPrompt(lang, kbEntries);

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
  } catch (error: unknown) {
    console.error('Gemini API error:', error);

    const errMsg = error instanceof Error ? error.message : String(error);

    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      return apiError(errMsgs.quota, 503, 'QUOTA_EXCEEDED');
    }

    if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('API key')) {
      return apiError(errMsgs.config, 503, 'API_KEY_INVALID');
    }

    return apiError(errMsgs.general, 500, 'GENERATION_FAILED');
  }
}
