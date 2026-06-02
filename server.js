import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3001;

// ── Supabase client (server-side only — key never reaches the browser) ────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ── Health check (used by UptimeRobot to keep the server awake) ──────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

// ── API: Chat proxy ───────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { system, messages, max_tokens } = req.body;
  if (!system || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing system or messages" });
  }

  const key = process.env.ANTHROPIC_KEY;
  if (!key) {
    console.error("ANTHROPIC_KEY not set");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 200,
        system,
        messages,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      console.error("Anthropic error:", upstream.status, err);
      return res.status(upstream.status).json({ error: "Upstream error" });
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    console.error("Chat proxy error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── API: Save response (upsert — works for both partial and completed) ────────
app.post("/api/responses", async (req, res) => {
  try {
    const row = req.body;
    if (!row.id || !row.ts) return res.status(400).json({ error: "Missing id or ts" });

    const { error } = await supabase
      .from("responses")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error("Supabase upsert error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Save response error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── API: Get all responses (newest first) ─────────────────────────────────────
app.get("/api/responses", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .order("ts", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    console.error("Get responses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Serve Vite build in production ────────────────────────────────────────────
if (isProd) {
  const distPath = join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, _res) => {
    _res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Ally server  →  http://localhost:${PORT}`);
  if (!isProd) console.log(`Vite dev     →  http://localhost:5173`);
});
