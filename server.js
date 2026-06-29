import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3001;

// ── Supabase client (server-side only — key never reaches the browser) ────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase not configured!");
  console.error("SUPABASE_URL:", SUPABASE_URL ? "✓ set" : "✗ missing");
  console.error("SUPABASE_KEY:", SUPABASE_KEY ? "✓ set" : "✗ missing");
} else {
  console.log("✓ Supabase configured");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { error } = await supabase
      .from("responses")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error("Supabase upsert error:", JSON.stringify(error));
      return res.status(500).json({ error: error.message || "Database error" });
    }
    console.log("POST /api/responses: saved", row.id, "status:", row.status);
    res.json({ ok: true });
  } catch (err) {
    console.error("Save response error:", err.message);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// ── API: Get all responses (newest first) ─────────────────────────────────────
app.get("/api/responses", async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .order("ts", { ascending: false });

    if (error) {
      console.error("Supabase select error:", JSON.stringify(error));
      return res.status(500).json({ error: error.message || "Database error" });
    }
    console.log("GET /api/responses: found", data?.length || 0, "responses");
    res.json(data || []);
  } catch (err) {
    console.error("Get responses error:", err.message);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// ── API: Delete a response ────────────────────────────────────────────────────
app.delete("/api/responses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing id" });
    const { error } = await supabase.from("responses").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete response error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Serve Vite build in production ────────────────────────────────────────────
if (isProd) {
  const distPath = join(__dirname, "dist");
  // Serve static assets (JS, CSS, images, preview.jpg)
  app.use(express.static(distPath));

  // Explicitly handle dashboard route (serves index.html, React Router handles client-side routing)
  app.get("/dashboard", (_req, _res) => {
    _res.sendFile(join(distPath, "index.html"));
  });

  // All other page routes — serve index.html for React Router
  app.get("*", (_req, _res) => {
    _res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Ally server  →  http://localhost:${PORT}`);
  if (!isProd) console.log(`Vite dev     →  http://localhost:5173`);
});
