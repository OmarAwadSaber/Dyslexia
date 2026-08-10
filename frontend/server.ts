import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// In-memory data store for documents & user settings
interface ProcessedData {
  simplifiedText: string;
  summary: string;
  keyPoints: string[];
  difficultWords: Array<{
    word: string;
    definition: string;
    phonetic?: string;
  }>;
  readingTimeMinutes: number;
  gradeLevel: string;
}

interface DocumentItem {
  id: string;
  source: string;
  raw_text: string;
  metadata?: Record<string, any>;
  status: "uploaded" | "processing" | "completed" | "error";
  processed_data?: ProcessedData;
  created_at: string;
}

const documentsStore = new Map<string, DocumentItem>();
const userSettingsStore = new Map<string, any>();

// Initialize default settings for user 'me'
userSettingsStore.set("me", {
  fontFamily: "OpenDyslexic", // OpenDyslexic | Atkinson | Inter
  fontSize: 20, // px
  letterSpacing: 1.5, // px
  lineHeight: 1.8,
  themeMode: "sepia", // sepia | dark | cream | light
  readingSpeed: 0.9, // TTS rate
  showLineReader: true,
  lineReaderHeight: 48,
});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Gemini Client Lazily
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Helper fallback generator if Gemini is not configured or offline
function generateFallbackProcessedData(rawText: string): ProcessedData {
  const words = rawText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Find long or complex words (over 7 characters)
  const uniqueWords = Array.from(new Set(words.map((w) => w.replace(/[^a-zA-Z]/g, ""))));
  const complex = uniqueWords.filter((w) => w.length > 7).slice(0, 5);

  const difficultWords = complex.map((w) => ({
    word: w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    definition: `A key term in this document referring to ${w.toLowerCase()}.`,
    phonetic: `[${w.toLowerCase()}]`,
  }));

  const sentences = rawText.split(/(?<=[.!?])\s+/).filter(Boolean);
  const simplifiedSentences = sentences.map((s) => s.trim());

  return {
    simplifiedText: simplifiedSentences.join("\n\n"),
    summary: rawText.length > 150 ? rawText.slice(0, 150) + "..." : rawText,
    keyPoints: sentences.slice(0, 3).map((s) => s.trim()) || ["Main message extracted from scanned text."],
    difficultWords: difficultWords.length > 0 ? difficultWords : [
      { word: "Dyslexia", definition: "A learning style affecting reading and processing speed.", phonetic: "dis-LEK-see-uh" }
    ],
    readingTimeMinutes: Math.max(1, Math.round(wordCount / 120)),
    gradeLevel: "Easy Reading",
  };
}

// API Routes

// Authentication Endpoints
app.post("/api/auth/jwt/create/", (req, res) => {
  const { username, password } = req.body;
  // Return mock JWT tokens
  res.json({
    access: "mock_access_jwt_token_" + Date.now(),
    refresh: "mock_refresh_jwt_token_" + Date.now(),
    user: {
      id: "usr_1001",
      username: username || "dyslexia_user",
      email: "user@example.com",
    },
  });
});

app.post("/api/auth/jwt/refresh/", (req, res) => {
  res.json({
    access: "mock_refreshed_access_jwt_token_" + Date.now(),
  });
});

app.post("/api/auth/jwt/verify/", (req, res) => {
  res.json({ code: "token_valid" });
});

app.get("/api/auth/users/me/", (req, res) => {
  res.json({
    id: "usr_1001",
    username: "dyslexia_user",
    email: "user@example.com",
    first_name: "Alex",
    last_name: "Reader",
  });
});

// Documents Endpoints
app.get("/api/documents/", (req, res) => {
  const docs = Array.from(documentsStore.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json(docs);
});

app.post("/api/documents/", (req, res) => {
  const { source, raw_text, metadata } = req.body;

  if (!raw_text || typeof raw_text !== "string" || !raw_text.trim()) {
    res.status(400).json({ error: "raw_text is required and cannot be empty." });
    return;
  }

  const docId = "doc_" + Math.random().toString(36).substring(2, 10);
  const newDoc: DocumentItem = {
    id: docId,
    source: source || "mobile",
    raw_text: raw_text.trim(),
    metadata: metadata || {},
    status: "uploaded",
    created_at: new Date().toISOString(),
  };

  documentsStore.set(docId, newDoc);
  res.status(201).json(newDoc);
});

app.get("/api/documents/:id/", (req, res) => {
  const doc = documentsStore.get(req.params.id);
  if (!doc) {
    res.status(404).json({ error: "Document not found." });
    return;
  }
  res.json(doc);
});

// Document Processing Pipeline via Gemini API
app.post("/api/documents/:id/process/", async (req, res) => {
  const docId = req.params.id;
  const doc = documentsStore.get(docId);

  if (!doc) {
    res.status(404).json({ error: "Document not found." });
    return;
  }

  doc.status = "processing";
  documentsStore.set(docId, doc);

  try {
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback if no API key is set
      console.log("No GEMINI_API_KEY found, using local fallback OCR processor");
      doc.processed_data = generateFallbackProcessedData(doc.raw_text);
      doc.status = "completed";
      documentsStore.set(docId, doc);
      res.json({ id: docId, status: "completed", message: "Document processed successfully (fallback)" });
      return;
    }

    const prompt = `
You are an expert accessibility assistant specializing in Dyslexia Reading Support.
Analyze the following raw scanned text and transform it into a dyslexia-friendly structure.

Strict Rules for Dyslexia Accessibility:
1. Simplify complex vocabulary and long sentences into clear, plain-language statements.
2. Break up long paragraphs into short, digestible 1-2 sentence paragraphs.
3. Provide a brief 2-sentence executive summary.
4. Provide 3 to 5 clear key bullet points.
5. Identify 2 to 6 difficult or long words from the text, providing a simple definition and phonetic pronunciation for each.
6. Estimate reading time in minutes and provide an estimated reading level (e.g. "Clear & Accessible", "Intermediate").

Raw Scanned Text:
"""
${doc.raw_text}
"""

Return your answer ONLY as a strict valid JSON object matching this schema:
{
  "simplifiedText": "string - full simplified text with double newlines between short paragraphs",
  "summary": "string - 2 sentence overview",
  "keyPoints": ["string", "string"],
  "difficultWords": [
    { "word": "string", "definition": "string", "phonetic": "string" }
  ],
  "readingTimeMinutes": 1,
  "gradeLevel": "string"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const parsedData = JSON.parse(responseText);

    doc.processed_data = {
      simplifiedText: parsedData.simplifiedText || doc.raw_text,
      summary: parsedData.summary || "Summary generated.",
      keyPoints: Array.isArray(parsedData.keyPoints) ? parsedData.keyPoints : [],
      difficultWords: Array.isArray(parsedData.difficultWords) ? parsedData.difficultWords : [],
      readingTimeMinutes: parsedData.readingTimeMinutes || 1,
      gradeLevel: parsedData.gradeLevel || "Accessible",
    };
    doc.status = "completed";
    documentsStore.set(docId, doc);

    res.json({ id: docId, status: "completed", message: "Document processed successfully" });
  } catch (error: any) {
    console.error("Gemini processing error:", error);
    // Fallback on error to ensure user never stuck
    doc.processed_data = generateFallbackProcessedData(doc.raw_text);
    doc.status = "completed";
    documentsStore.set(docId, doc);
    res.json({ id: docId, status: "completed", message: "Document processed via fallback logic" });
  }
});

app.get("/api/documents/:id/processed/", (req, res) => {
  const doc = documentsStore.get(req.params.id);
  if (!doc) {
    res.status(404).json({ error: "Document not found." });
    return;
  }

  if (doc.status !== "completed") {
    res.json({
      id: doc.id,
      status: doc.status,
      message: "Document is still processing or pending.",
    });
    return;
  }

  res.json({
    id: doc.id,
    status: doc.status,
    raw_text: doc.raw_text,
    processed_data: doc.processed_data,
    created_at: doc.created_at,
  });
});

// User Settings
app.get("/api/users/:id/settings/", (req, res) => {
  const settings = userSettingsStore.get(req.params.id) || userSettingsStore.get("me");
  res.json(settings);
});

app.put("/api/users/:id/settings/", (req, res) => {
  const current = userSettingsStore.get(req.params.id) || userSettingsStore.get("me");
  const updated = { ...current, ...req.body };
  userSettingsStore.set(req.params.id, updated);
  res.json(updated);
});

async function start() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dyslexia Reading Assistant server running at http://0.0.0.0:${PORT}`);
  });
}

start();
