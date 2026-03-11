import { chatKnowledgeBase } from '@/data/mock/chat-kb';
import type { ChatLanguage, ChatKBEntry } from '@/types';

function getChatbotBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || '';
}

// Common words to ignore when scoring matches
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'he', 'she',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'can', 'may', 'might', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
  'through', 'after', 'before', 'above', 'below', 'and', 'but', 'or',
  'not', 'no', 'so', 'if', 'then', 'than', 'that', 'this', 'these',
  'those', 'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
  'am', 'up', 'out', 'all', 'some', 'any', 'each', 'just', 'also',
  'very', 'much', 'many', 'more', 'most', 'get', 'want', 'need', 'tell',
  'know', 'please', 'help', 'hi', 'hello', 'hey', 'thanks', 'thank',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function scoreEntry(queryTokens: string[], entry: ChatKBEntry): number {
  let score = 0;
  const lowerQuery = queryTokens.join(' ');

  // Exact keyword phrase match (highest signal)
  for (const keyword of entry.keywords) {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerQuery.includes(lowerKeyword)) {
      score += 10;
    }
  }

  // Token-level matching against keywords
  for (const token of queryTokens) {
    for (const keyword of entry.keywords) {
      const kwWords = keyword.toLowerCase().split(/\s+/);
      for (const kwWord of kwWords) {
        if (kwWord === token) {
          score += 3;
        } else if (kwWord.startsWith(token) || token.startsWith(kwWord)) {
          // Stem-like partial match: "invest" matches "investing", "investor"
          score += 2;
        }
      }
    }
  }

  // Token match against question text
  const questionTokens = tokenize(entry.question);
  for (const token of queryTokens) {
    if (questionTokens.includes(token)) {
      score += 1;
    }
  }

  return score;
}

function findKBAnswer(query: string): string | null {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return null;

  let bestScore = 0;
  let bestEntry: ChatKBEntry | null = null;

  for (const entry of chatKnowledgeBase) {
    const score = scoreEntry(queryTokens, entry);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Require minimum score to avoid irrelevant matches
  if (bestEntry && bestScore >= 3) {
    return bestEntry.answer;
  }

  return null;
}

const TOPIC_SUGGESTIONS =
  "I can help you with investing in Uganda! Here are some topics I know about:\n\n" +
  "- **Business registration** — How to register a company in Uganda\n" +
  "- **Investment licenses** — UIA license requirements and application\n" +
  "- **Tax rates & incentives** — Corporate tax, VAT, tax holidays\n" +
  "- **Sector opportunities** — Agriculture, tourism, ICT, manufacturing, mining, energy\n" +
  "- **Work permits & visas** — Requirements for foreign workers\n" +
  "- **Industrial parks** — Free zones and special economic zones\n" +
  "- **Land acquisition** — How foreign investors can acquire land\n" +
  "- **Financing** — Banking and funding options\n" +
  "- **Regional market access** — EAC, COMESA, AfCFTA\n\n" +
  "Try asking about any of these topics, or contact UIA directly:\n" +
  "Phone: +256-414-301000 | Email: info@ugandainvest.go.ug";

export interface ChatResponse {
  response: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  language: ChatLanguage,
  sessionId?: string
): Promise<ChatResponse> {
  // Tier 1: Call API route (Gemini)
  try {
    const baseUrl = getChatbotBaseUrl();
    const res = await fetch(`${baseUrl}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-10),
        language,
        sessionId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.response) {
        return {
          response: data.response,
          sentiment: data.sentiment,
        };
      }
    }
  } catch (error) {
    console.error('Chatbot API error, falling back to local KB:', error);
  }

  // Tier 2: Local KB keyword match
  const kbAnswer = findKBAnswer(message);
  if (kbAnswer) return { response: kbAnswer };

  // Tier 3: Show available topics instead of dead-end fallback
  return { response: TOPIC_SUGGESTIONS };
}
