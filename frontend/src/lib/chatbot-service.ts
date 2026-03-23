import { chatKnowledgeBase } from '@/data/mock/chat-kb';
import type { ChatLanguage, ChatKBEntry } from '@/types';

function getChatbotBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
}

// ===================== MULTILINGUAL KEYWORD MAP =====================
// Maps non-English investment terms to their English KB equivalents.
// This lets the KB fallback match queries in French, Swahili, Arabic, and Chinese.
const MULTILINGUAL_KEYWORDS: Record<string, string[]> = {
  // --- French ---
  entreprise: ['business', 'company'], enregistrer: ['register', 'registration'],
  enregistrement: ['registration'], investir: ['invest', 'investment'],
  investissement: ['investment'], licence: ['license'], permis: ['permit'],
  taxe: ['tax'], impot: ['tax'], douane: ['import duty'], tva: ['VAT'],
  agriculture: ['agriculture', 'farming'], tourisme: ['tourism'],
  fabrication: ['manufacturing'], energie: ['energy'], minier: ['mining'],
  mineraux: ['minerals'], terrains: ['land'], terrain: ['land'],
  financement: ['finance', 'funding'], banque: ['bank'],
  travail: ['work'], visa: ['visa'], parc: ['industrial park'],
  environnement: ['environmental'], normes: ['standards'],
  commerce: ['trade', 'export'], economie: ['economy'],
  opportunites: ['opportunities'], exigences: ['requirements'],
  cout: ['cost'], minimum: ['minimum'],

  // --- Swahili ---
  biashara: ['business', 'company'], kujiandikisha: ['register'],
  usajili: ['registration'], uwekezaji: ['investment'],
  kuwekeza: ['invest'], leseni: ['license'], kibali: ['permit'],
  kodi: ['tax'], ushuru: ['tax', 'import duty'],
  kilimo: ['agriculture', 'farming'], utalii: ['tourism'],
  viwanda: ['manufacturing', 'industrial'], nishati: ['energy'],
  madini: ['mining', 'minerals'], ardhi: ['land'],
  fedha: ['finance', 'funding'], benki: ['bank'],
  kazi: ['work'], pasipoti: ['passport'],
  mazingira: ['environmental'], viwango: ['standards'],
  bidhaa: ['trade', 'export'], uchumi: ['economy'],
  fursa: ['opportunities'], mahitaji: ['requirements'],
  gharama: ['cost'],

  // --- Arabic ---
  '\u0634\u0631\u0643\u0629': ['company', 'business'],  // شركة
  '\u0627\u0633\u062a\u062b\u0645\u0627\u0631': ['investment', 'invest'],  // استثمار
  '\u062a\u0633\u062c\u064a\u0644': ['register', 'registration'],  // تسجيل
  '\u0631\u062e\u0635\u0629': ['license'],  // رخصة
  '\u062a\u0635\u0631\u064a\u062d': ['permit'],  // تصريح
  '\u0636\u0631\u064a\u0628\u0629': ['tax'],  // ضريبة
  '\u0632\u0631\u0627\u0639\u0629': ['agriculture', 'farming'],  // زراعة
  '\u0633\u064a\u0627\u062d\u0629': ['tourism'],  // سياحة
  '\u0635\u0646\u0627\u0639\u0629': ['manufacturing', 'industrial'],  // صناعة
  '\u0637\u0627\u0642\u0629': ['energy'],  // طاقة
  '\u062a\u0639\u062f\u064a\u0646': ['mining'],  // تعدين
  '\u0623\u0631\u0636': ['land'],  // أرض
  '\u062a\u0645\u0648\u064a\u0644': ['finance', 'funding'],  // تمويل
  '\u0628\u0646\u0643': ['bank'],  // بنك
  '\u0639\u0645\u0644': ['work'],  // عمل
  '\u062a\u0623\u0634\u064a\u0631\u0629': ['visa'],  // تأشيرة
  '\u0628\u064a\u0626\u0629': ['environmental'],  // بيئة
  '\u062a\u062c\u0627\u0631\u0629': ['trade', 'export'],  // تجارة
  '\u0627\u0642\u062a\u0635\u0627\u062f': ['economy'],  // اقتصاد
  '\u0641\u0631\u0635': ['opportunities'],  // فرص
  '\u062a\u0643\u0644\u0641\u0629': ['cost'],  // تكلفة

  // --- Chinese ---
  '\u6295\u8d44': ['investment', 'invest'],  // 投资
  '\u516c\u53f8': ['company', 'business'],  // 公司
  '\u6ce8\u518c': ['register', 'registration'],  // 注册
  '\u8bb8\u53ef\u8bc1': ['license'],  // 许可证
  '\u7a0e': ['tax'],  // 税
  '\u519c\u4e1a': ['agriculture', 'farming'],  // 农业
  '\u65c5\u6e38': ['tourism'],  // 旅游
  '\u5236\u9020\u4e1a': ['manufacturing'],  // 制造业
  '\u80fd\u6e90': ['energy'],  // 能源
  '\u77ff\u4e1a': ['mining', 'minerals'],  // 矿业
  '\u571f\u5730': ['land'],  // 土地
  '\u878d\u8d44': ['finance', 'funding'],  // 融资
  '\u94f6\u884c': ['bank'],  // 银行
  '\u5de5\u4f5c': ['work'],  // 工作
  '\u7b7e\u8bc1': ['visa'],  // 签证
  '\u73af\u5883': ['environmental'],  // 环境
  '\u8d38\u6613': ['trade', 'export'],  // 贸易
  '\u7ecf\u6d4e': ['economy'],  // 经济
  '\u673a\u4f1a': ['opportunities'],  // 机会
  '\u6210\u672c': ['cost'],  // 成本
  '\u5de5\u4e1a\u56ed\u533a': ['industrial park'],  // 工业园区
};

// ===================== STOP WORDS (English) =====================
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

// ===================== TOKENIZER (supports non-Latin scripts) =====================
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    // Keep letters (any script), numbers, and spaces
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Expand query to include English KB equivalents of non-English terms.
 * Uses both token-level matching (for space-separated languages like French/Swahili)
 * and substring scanning (for scriptio-continua languages like Chinese/Arabic).
 */
function expandToEnglish(text: string, tokens: string[]): string[] {
  const expanded: string[] = [...tokens];
  const lowerText = text.toLowerCase();

  for (const [foreignTerm, engTerms] of Object.entries(MULTILINGUAL_KEYWORDS)) {
    // Check both: exact token match AND substring in original text
    // Substring is critical for Chinese (no spaces) and Arabic (attached particles)
    const matched = tokens.includes(foreignTerm) || lowerText.includes(foreignTerm);
    if (matched) {
      for (const eng of engTerms) {
        if (!expanded.includes(eng)) expanded.push(eng);
      }
    }
  }

  return expanded;
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
  const rawTokens = tokenize(query);

  // Expand with multilingual keyword mappings (uses both tokens AND substring scan)
  const queryTokens = expandToEnglish(query, rawTokens);
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

  if (bestEntry && bestScore >= 3) {
    return bestEntry.answer;
  }

  return null;
}

// ===================== TRANSLATED FALLBACK MESSAGES =====================

const KB_DISCLAIMER: Record<ChatLanguage, string> = {
  en: '\n\n---\n*Answered from our knowledge base. Our AI assistant is currently being upgraded for real-time responses.*',
  fr: '\n\n---\n*Réponse tirée de notre base de connaissances. Notre assistant IA est en cours de mise à niveau pour des réponses en temps réel.*',
  ar: '\n\n---\n*\u062a\u0645\u062a \u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0645\u0646 \u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0644\u062f\u064a\u0646\u0627. \u064a\u062a\u0645 \u062d\u0627\u0644\u064a\u0627\u064b \u062a\u0631\u0642\u064a\u0629 \u0645\u0633\u0627\u0639\u062f\u0646\u0627 \u0627\u0644\u0630\u0643\u064a \u0644\u0644\u0631\u062f\u0648\u062f \u0627\u0644\u0641\u0648\u0631\u064a\u0629.*',
  zh: '\n\n---\n*\u6b64\u56de\u7b54\u6765\u81ea\u6211\u4eec\u7684\u77e5\u8bc6\u5e93\u3002\u6211\u4eec\u7684AI\u52a9\u624b\u6b63\u5728\u5347\u7ea7\u4ee5\u63d0\u4f9b\u5b9e\u65f6\u56de\u590d\u3002*',
  sw: '\n\n---\n*Jibu kutoka kwenye hifadhi yetu ya maarifa. Msaidizi wetu wa AI anaboreshwa kwa majibu ya wakati halisi.*',
};

const TOPIC_SUGGESTIONS: Record<ChatLanguage, string> = {
  en:
    "I can help you with investing in Uganda! Here are some topics I know about:\n\n" +
    "- **Business registration** \u2014 How to register a company in Uganda\n" +
    "- **Investment licenses** \u2014 UIA license requirements and application\n" +
    "- **Tax rates & incentives** \u2014 Corporate tax, VAT, tax holidays\n" +
    "- **Sector opportunities** \u2014 Agriculture, tourism, ICT, manufacturing, mining, energy\n" +
    "- **Work permits & visas** \u2014 Requirements for foreign workers\n" +
    "- **Industrial parks** \u2014 Free zones and special economic zones\n" +
    "- **Land acquisition** \u2014 How foreign investors can acquire land\n" +
    "- **Financing** \u2014 Banking and funding options\n" +
    "- **Regional market access** \u2014 EAC, COMESA, AfCFTA\n\n" +
    "Try asking about any of these topics, or contact UIA directly:\n" +
    "Phone: +256-414-301000 | Email: info@ugandainvest.go.ug",

  fr:
    "Je peux vous aider \u00e0 investir en Ouganda ! Voici les sujets que je ma\u00eetrise :\n\n" +
    "- **Cr\u00e9ation d\u2019entreprise** \u2014 Comment enregistrer une soci\u00e9t\u00e9 en Ouganda\n" +
    "- **Licences d\u2019investissement** \u2014 Conditions et demande de licence UIA\n" +
    "- **Fiscalit\u00e9 et incitations** \u2014 Imp\u00f4t sur les soci\u00e9t\u00e9s, TVA, exon\u00e9rations\n" +
    "- **Opportunit\u00e9s sectorielles** \u2014 Agriculture, tourisme, TIC, industrie, mines, \u00e9nergie\n" +
    "- **Permis de travail et visas** \u2014 Conditions pour les travailleurs \u00e9trangers\n" +
    "- **Parcs industriels** \u2014 Zones franches et zones \u00e9conomiques sp\u00e9ciales\n" +
    "- **Acquisition fonci\u00e8re** \u2014 Comment les investisseurs \u00e9trangers peuvent acqu\u00e9rir des terrains\n" +
    "- **Financement** \u2014 Options bancaires et de financement\n" +
    "- **Acc\u00e8s aux march\u00e9s r\u00e9gionaux** \u2014 EAC, COMESA, ZLECAf\n\n" +
    "Posez-moi vos questions, ou contactez directement l\u2019UIA :\n" +
    "T\u00e9l : +256-414-301000 | Email : info@ugandainvest.go.ug",

  ar:
    "\u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0641\u064a \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0641\u064a \u0623\u0648\u063a\u0646\u062f\u0627! \u0625\u0644\u064a\u0643 \u0627\u0644\u0645\u0648\u0627\u0636\u064a\u0639 \u0627\u0644\u062a\u064a \u064a\u0645\u0643\u0646\u0646\u064a \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0641\u064a\u0647\u0627:\n\n" +
    "- **\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0634\u0631\u0643\u0627\u062a** \u2014 \u0643\u064a\u0641\u064a\u0629 \u062a\u0633\u062c\u064a\u0644 \u0634\u0631\u0643\u0629 \u0641\u064a \u0623\u0648\u063a\u0646\u062f\u0627\n" +
    "- **\u062a\u0631\u0627\u062e\u064a\u0635 \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631** \u2014 \u0645\u062a\u0637\u0644\u0628\u0627\u062a \u0648\u0637\u0644\u0628 \u062a\u0631\u062e\u064a\u0635 UIA\n" +
    "- **\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u062d\u0648\u0627\u0641\u0632** \u2014 \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0634\u0631\u0643\u0627\u062a\u060c \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629\u060c \u0627\u0644\u0625\u0639\u0641\u0627\u0621\u0627\u062a\n" +
    "- **\u0627\u0644\u0641\u0631\u0635 \u0627\u0644\u0642\u0637\u0627\u0639\u064a\u0629** \u2014 \u0627\u0644\u0632\u0631\u0627\u0639\u0629\u060c \u0627\u0644\u0633\u064a\u0627\u062d\u0629\u060c \u062a\u0643\u0646\u0648\u0644\u0648\u062c\u064a\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a\u060c \u0627\u0644\u062a\u0635\u0646\u064a\u0639\u060c \u0627\u0644\u062a\u0639\u062f\u064a\u0646\u060c \u0627\u0644\u0637\u0627\u0642\u0629\n" +
    "- **\u062a\u0635\u0627\u0631\u064a\u062d \u0627\u0644\u0639\u0645\u0644 \u0648\u0627\u0644\u062a\u0623\u0634\u064a\u0631\u0627\u062a** \u2014 \u0645\u062a\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0639\u0645\u0627\u0644\u0629 \u0627\u0644\u0623\u062c\u0646\u0628\u064a\u0629\n" +
    "- **\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0635\u0646\u0627\u0639\u064a\u0629** \u2014 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062d\u0631\u0629 \u0648\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f\u064a\u0629 \u0627\u0644\u062e\u0627\u0635\u0629\n" +
    "- **\u0634\u0631\u0627\u0621 \u0627\u0644\u0623\u0631\u0627\u0636\u064a** \u2014 \u0643\u064a\u0641\u064a\u0629 \u062d\u0635\u0648\u0644 \u0627\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646 \u0627\u0644\u0623\u062c\u0627\u0646\u0628 \u0639\u0644\u0649 \u0623\u0631\u0627\u0636\u064d\n" +
    "- **\u0627\u0644\u062a\u0645\u0648\u064a\u0644** \u2014 \u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0635\u0631\u0641\u064a\u0629 \u0648\u0627\u0644\u062a\u0645\u0648\u064a\u0644\u064a\u0629\n" +
    "- **\u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0625\u0642\u0644\u064a\u0645\u064a\u0629** \u2014 EAC\u060c COMESA\u060c AfCFTA\n\n" +
    "\u0627\u0637\u0631\u062d \u0633\u0624\u0627\u0644\u0643 \u062d\u0648\u0644 \u0623\u064a \u0645\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0648\u0627\u0636\u064a\u0639\u060c \u0623\u0648 \u062a\u0648\u0627\u0635\u0644 \u0645\u0639 UIA \u0645\u0628\u0627\u0634\u0631\u0629:\n" +
    "\u0647\u0627\u062a\u0641: +256-414-301000 | \u0628\u0631\u064a\u062f: info@ugandainvest.go.ug",

  zh:
    "\u6211\u53ef\u4ee5\u5e2e\u52a9\u60a8\u4e86\u89e3\u5728\u4e4c\u5e72\u8fbe\u7684\u6295\u8d44\u4fe1\u606f\uff01\u4ee5\u4e0b\u662f\u6211\u53ef\u4ee5\u89e3\u7b54\u7684\u4e3b\u9898\uff1a\n\n" +
    "- **\u4f01\u4e1a\u6ce8\u518c** \u2014 \u5982\u4f55\u5728\u4e4c\u5e72\u8fbe\u6ce8\u518c\u516c\u53f8\n" +
    "- **\u6295\u8d44\u8bb8\u53ef\u8bc1** \u2014 UIA\u8bb8\u53ef\u8bc1\u8981\u6c42\u53ca\u7533\u8bf7\n" +
    "- **\u7a0e\u7387\u4e0e\u4f18\u60e0** \u2014 \u4f01\u4e1a\u6240\u5f97\u7a0e\u3001\u589e\u503c\u7a0e\u3001\u7a0e\u6536\u51cf\u514d\n" +
    "- **\u884c\u4e1a\u673a\u4f1a** \u2014 \u519c\u4e1a\u3001\u65c5\u6e38\u3001ICT\u3001\u5236\u9020\u4e1a\u3001\u77ff\u4e1a\u3001\u80fd\u6e90\n" +
    "- **\u5de5\u4f5c\u8bb8\u53ef\u4e0e\u7b7e\u8bc1** \u2014 \u5916\u7c4d\u5de5\u4f5c\u4eba\u5458\u7684\u8981\u6c42\n" +
    "- **\u5de5\u4e1a\u56ed\u533a** \u2014 \u81ea\u7531\u8d38\u6613\u533a\u548c\u7ecf\u6d4e\u7279\u533a\n" +
    "- **\u571f\u5730\u83b7\u53d6** \u2014 \u5916\u56fd\u6295\u8d44\u8005\u5982\u4f55\u83b7\u5f97\u571f\u5730\n" +
    "- **\u878d\u8d44** \u2014 \u94f6\u884c\u548c\u8d44\u91d1\u9009\u62e9\n" +
    "- **\u533a\u57df\u5e02\u573a\u51c6\u5165** \u2014 EAC\u3001COMESA\u3001AfCFTA\n\n" +
    "\u8bf7\u5c31\u4ee5\u4e0a\u4efb\u4f55\u4e3b\u9898\u63d0\u95ee\uff0c\u6216\u76f4\u63a5\u8054\u7cfbUIA\uff1a\n" +
    "\u7535\u8bdd: +256-414-301000 | \u90ae\u7bb1: info@ugandainvest.go.ug",

  sw:
    "Ninaweza kukusaidia kuhusu uwekezaji nchini Uganda! Hizi ni mada ninazojua:\n\n" +
    "- **Usajili wa biashara** \u2014 Jinsi ya kusajili kampuni nchini Uganda\n" +
    "- **Leseni za uwekezaji** \u2014 Mahitaji na maombi ya leseni ya UIA\n" +
    "- **Viwango vya kodi na motisha** \u2014 Kodi ya makampuni, VAT, misamaha ya kodi\n" +
    "- **Fursa za kisekta** \u2014 Kilimo, utalii, ICT, viwanda, madini, nishati\n" +
    "- **Vibali vya kazi na visa** \u2014 Mahitaji kwa wafanyakazi wa kigeni\n" +
    "- **Maeneo ya viwanda** \u2014 Maeneo huru na maeneo maalum ya kiuchumi\n" +
    "- **Ununuzi wa ardhi** \u2014 Jinsi wawekezaji wa kigeni wanavyoweza kupata ardhi\n" +
    "- **Ufadhili** \u2014 Chaguzi za benki na ufadhili\n" +
    "- **Upatikanaji wa masoko ya kikanda** \u2014 EAC, COMESA, AfCFTA\n\n" +
    "Uliza kuhusu mada yoyote kati ya hizi, au wasiliana na UIA moja kwa moja:\n" +
    "Simu: +256-414-301000 | Barua pepe: info@ugandainvest.go.ug",
};

// ===================== ENQUIRY LOGGING =====================

export interface ChatUserInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

function logEnquiry(
  sessionId: string,
  userInfo: ChatUserInfo,
  userMessage: string,
  botResponse: string,
  language: ChatLanguage,
  sentiment: string | undefined,
  tier: 'ai' | 'kb' | 'suggestions',
) {
  const baseUrl = getChatbotBaseUrl();
  // Fire-and-forget — don't block the chat response
  fetch(`${baseUrl}/api/chatbot/log`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      userName: userInfo.name,
      userEmail: userInfo.email,
      userPhone: userInfo.phone,
      userLocation: userInfo.location,
      userMessage,
      botResponse,
      language,
      sentiment,
      tier,
    }),
  }).catch((err) => console.warn('[chatbot] Log failed:', err));
}

// ===================== PUBLIC API =====================

export interface ChatResponse {
  response: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  language: ChatLanguage,
  sessionId: string,
  userInfo: ChatUserInfo = {},
): Promise<ChatResponse> {
  // Tier 1: Call API route (Groq / Llama 3.3)
  try {
    const baseUrl = getChatbotBaseUrl();
    const res = await fetch(`${baseUrl}/api/chatbot`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-10),
        language,
        sessionId,
      }),
    });

    const data = await res.json();

    // ASP.NET returns { success, data: { response, sentiment } }
    // Next.js returns  { success, response, sentiment }
    const chatData = data.data ?? data;
    if (res.ok && data.success && (chatData.response || data.response)) {
      const result: ChatResponse = {
        response: chatData.response ?? data.response,
        sentiment: chatData.sentiment ?? data.sentiment,
      };
      logEnquiry(sessionId, userInfo, message, result.response, language, result.sentiment, 'ai');
      return result;
    }

    // API returned an error — check if it's a quota/config issue
    if (data.code === 'QUOTA_EXCEEDED' || data.code === 'API_KEY_INVALID') {
      console.warn('[chatbot] AI service unavailable:', data.code);
      // Fall through to KB but note the issue
    } else if (data.error) {
      console.error('[chatbot] API error:', data.error);
    }
  } catch (error) {
    console.error('[chatbot] Network error, falling back to local KB:', error);
  }

  // Tier 2: Local KB keyword match (with multilingual expansion)
  const kbAnswer = findKBAnswer(message);
  if (kbAnswer) {
    const response = kbAnswer + (KB_DISCLAIMER[language] || KB_DISCLAIMER.en);
    logEnquiry(sessionId, userInfo, message, response, language, undefined, 'kb');
    return { response };
  }

  // Tier 3: Show available topics in the user's language
  const response = TOPIC_SUGGESTIONS[language] || TOPIC_SUGGESTIONS.en;
  logEnquiry(sessionId, userInfo, message, response, language, undefined, 'suggestions');
  return { response };
}
