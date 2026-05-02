/**
 * Локальный API для MVP: вузы из общего mockData, профиль на диске, прокси Qwen.
 * Запуск: npm run dev:server  →  http://127.0.0.1:8787
 */
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.server" });
import express from "express";
import cors from "cors";
import { UNIVERSITIES, getProgramBySlug, currentStudent } from "../src/mockData.js";
import type { StudentProfile } from "../src/mockData.js";
import { readProfileFile, writeProfileFile } from "./profileStore.js";
import { completeChat, completeChatMessages, isAiConfigured } from "./openRouterChat.js";

const PORT = Number(process.env.PORT) || 8787;
const app = express();

const corsAllowlist = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (corsAllowlist.length > 0) return corsAllowlist.includes(origin);
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/[^/]+\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/[^/]+\.netlify\.app$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, cb) => {
      cb(null, isAllowedCorsOrigin(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: isAiConfigured(),
    universities: UNIVERSITIES.length,
  });
});

app.get("/api/config", (_req, res) => {
  res.json({ aiConfigured: isAiConfigured(), useClientKey: false });
});

app.get("/api/universities", (_req, res) => {
  res.json(UNIVERSITIES);
});

app.get("/api/universities/:id", (req, res) => {
  const u = UNIVERSITIES.find((x) => x.id === req.params.id);
  if (!u) {
    res.status(404).json({ error: "University not found" });
    return;
  }
  res.json(u);
});

app.get("/api/programs/:programId", (req, res) => {
  const found = getProgramBySlug(req.params.programId);
  if (!found) {
    res.status(404).json({ error: "Program not found" });
    return;
  }
  res.json(found);
});

app.get("/api/profile", (_req, res) => {
  const saved = readProfileFile();
  const student = saved ?? currentStudent;
  res.json({ student, source: saved ? "server" : "default" });
});

app.put("/api/profile", (req, res) => {
  const body = req.body as { student?: StudentProfile };
  if (!body?.student || typeof body.student !== "object") {
    res.status(400).json({ error: "Expected { student: StudentProfile }" });
    return;
  }
  try {
    writeProfileFile(body.student);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  const body = req.body as {
    userPrompt?: string;
    systemPrompt?: string;
    messages?: Array<{ role?: string; content?: string }>;
  };

  try {
    if (
      body.systemPrompt &&
      Array.isArray(body.messages) &&
      body.messages.length > 0
    ) {
      const turns = body.messages
        .filter(
          (m): m is { role: "user" | "assistant"; content: string } =>
            (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.length > 0
        )
        .slice(-24);
      if (!turns.length) {
        res.status(400).json({ error: "messages must include at least one user or assistant turn" });
        return;
      }
      const text = await completeChatMessages(body.systemPrompt, turns);
      res.json({ text });
      return;
    }

    const { userPrompt, systemPrompt } = body;
    if (!userPrompt || !systemPrompt) {
      res.status(400).json({ error: "Expected userPrompt and systemPrompt, or systemPrompt + messages[]" });
      return;
    }
    const text = await completeChat(userPrompt, systemPrompt);
    res.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI error";
    const status = msg.includes("не задан") ? 503 : 502;
    res.status(status).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`[api] http://127.0.0.1:${PORT}  (universities=${UNIVERSITIES.length}, ai=${isAiConfigured() ? "on" : "off"})`);
});
