import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./admin";
import { defineString } from "firebase-functions/params";

const geminiKey = defineString("GEMINI_API_KEY");

const SYSTEM_INSTRUCTION = `You are the Uganda Investment Authority (UIA) One-Stop Centre AI Assistant.

ROLE: Help investors with accurate information about investing in Uganda.

RULES:
1. Only answer questions related to investment in Uganda, UIA services, business registration, licensing, tax incentives, sectors, and related government services.
2. If you don't know the answer, say so and recommend contacting UIA directly at +256-414-301000 or info@ugandainvest.go.ug.
3. Never fabricate statistics, fees, or contact details.
4. Be concise, professional, and helpful.
5. When asked about specific procedures, include step numbers and contact information.
6. If the user asks something unrelated to Uganda investment, politely redirect.
7. Always respond in the language the user is speaking or as directed by the language setting.`;

const LANGUAGE_DIRECTIVES: Record<string, string> = {
  en: "Respond in English.",
  fr: "Respond in French (Français).",
  ar: "Respond in Arabic (العربية).",
  zh: "Respond in Chinese (中文).",
  sw: "Respond in Swahili (Kiswahili).",
};

interface ChatHistoryEntry {
  role: "user" | "model";
  parts: { text: string }[];
}

export const chatbot = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { message, history, language, sessionId } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const lang = language || "en";

    try {
      const genAI = new GoogleGenerativeAI(geminiKey.value());
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\n${LANGUAGE_DIRECTIVES[lang] || LANGUAGE_DIRECTIVES.en}`,
      });

      // Convert history to Gemini format
      const geminiHistory: ChatHistoryEntry[] = (history || [])
        .slice(-10)
        .map((msg: { role: string; content: string }) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessage(message);
      const text = result.response.text();

      // Store in Firestore if sessionId provided
      if (sessionId) {
        const sessionRef = db.collection("chat_sessions").doc(sessionId);
        const sessionDoc = await sessionRef.get();

        const messageEntry = {
          role: "assistant",
          content: text,
          timestamp: new Date().toISOString(),
          language: lang,
        };

        if (sessionDoc.exists) {
          await sessionRef.update({
            messages: admin_arrayUnion(messageEntry),
            updatedAt: new Date().toISOString(),
          });
        } else {
          await sessionRef.set({
            messages: [
              {
                role: "user",
                content: message,
                timestamp: new Date().toISOString(),
                language: lang,
              },
              messageEntry,
            ],
            language: lang,
            status: "active",
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      res.json({ success: true, response: text });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({
        success: false,
        response:
          "I'm currently unable to process your request. Please contact UIA directly:\n\n" +
          "Phone: +256-414-301000\n" +
          "Email: info@ugandainvest.go.ug\n" +
          "Address: Twed Plaza, Plot 22B Lumumba Avenue, Kampala",
      });
    }
  }
);

// Helper — Firestore arrayUnion
function admin_arrayUnion(element: unknown) {
  const { FieldValue } = require("firebase-admin/firestore");
  return FieldValue.arrayUnion(element);
}
