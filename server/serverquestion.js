import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedQuestions = null;
let cachedAt = 0;

const getFetch = () => {
  if (typeof fetch === "function") return fetch;
  throw new Error("Global fetch is not available. Use Node 18+ or add a fetch polyfill.");
};

const buildQuestionsUrl = () => {
  const directUrl = process.env.QUESTIONS_URL;
  if (directUrl) return directUrl;
  const bucket =
    process.env.FIREBASE_STORAGE_BUCKET || "mental-health-app-49ba8.appspot.com";
  const path = process.env.QUESTIONS_PATH || "configs/questions.json";
  const encodedPath = encodeURIComponent(path).replace(/%2F/g, "%2F");
  const token = process.env.FIREBASE_STORAGE_TOKEN;
  const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
  return token ? `${baseUrl}&token=${encodeURIComponent(token)}` : baseUrl;
};

const loadQuestions = async () => {
  const now = Date.now();
  if (cachedQuestions && now - cachedAt < CACHE_TTL_MS) {
    return cachedQuestions;
  }
  const url = buildQuestionsUrl();
  const fetchFn = getFetch();
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch questions (${res.status})`);
  }
  const data = await res.json();
  cachedQuestions = data;
  cachedAt = now;
  return data;
};

app.get("/questions", async (_req, res) => {
  try {
    const questions = await loadQuestions();
    res.json(questions);
  } catch (err) {
    res.status(500).json({
      error: "Unable to load questions.",
      message: err instanceof Error ? err.message : "Unknown error",
      source: buildQuestionsUrl(),
    });
  }
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
