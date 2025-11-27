import express, { Request, Response, Router } from "express";
import { z } from "zod";
import fetch from 'node-fetch';

const router: Router = express.Router();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type ChatContext = { route?: string; featureFlags?: Record<string, boolean> };

const AllowedRoutes = ["/", "/browserpage", "/favourites", "/accessibility", "/profile", "/login" , "/signup"] as const;

const CommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("NAVIGATE"),
    target: z.enum(AllowedRoutes),
  }),
  z.object({
    type: z.literal("CLICK_UNDO"),
  }),
  z.object({
    type: z.literal("TOGGLE_MAGNIFIER"),
    enabled: z.boolean(),
  }),
]);

const ModelOutputSchema = z.object({
  reply: z.string().default(""),
  command: CommandSchema.optional(),
});

// Add a GET handler for health check/testing
router.get("/a11y-chat", (req, res) => {
  res.status(200).json({ status: "ok", message: "a11y-chat endpoint is up" });
});

router.post("/a11y-chat", async (req: Request, res: Response) => {
  try {
    // Defensive: ensure req.body is always an object
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const { messages, context } = body as {
      messages: ChatMessage[];
      context?: ChatContext;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array" });
    }

    const trimmed = messages.slice(-20).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 4000),
    }));

    const safeContext = {
      route: typeof context?.route === "string" ? context.route.slice(0, 200) : undefined,
      featureFlags:
        context?.featureFlags && typeof context.featureFlags === "object"
          ? Object.fromEntries(
              Object.entries(context.featureFlags)
                .slice(0, 50)
                .map(([k, v]) => [String(k).slice(0, 50), Boolean(v)])
            )
          : undefined,
    };

    const system = {
      role: "system",
      content:
        "You are an accessibility helper for this application.\n" +
        "You may also control the app ONLY using an allowed command.\n\n" +
        "Allowed commands:\n" +
        `- NAVIGATE: target must be one of ${JSON.stringify(AllowedRoutes)}\n` +
        "- CLICK_UNDO: click the undo button if available\n" +
        "- TOGGLE_MAGNIFIER: enable or disable the magnifier (enabled: true/false)\n\n" +
        "IMPORTANT: Output ONLY valid JSON in this exact shape:\n" +
        '{"reply":"...", "command":{"type":"NAVIGATE","target":"/games"}}\n' +
        '{"reply":"...", "command":{"type":"CLICK_UNDO"}}\n' +
        '{"reply":"...", "command":{"type":"TOGGLE_MAGNIFIER", "enabled":true}}\n' +
        "If no command is needed, omit command.\n\n" +
        "App context:\n" +
        JSON.stringify(safeContext),
    };

    const ollamaResp = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.1",
        messages: [system, ...trimmed],
        stream: false,
        keep_alive: "10m",
        options: {num_predict: 120}
      }),
    });

    if (!ollamaResp.ok) {
      const text = await ollamaResp.text();
      return res.status(502).json({ error: "ollama_error", detail: text });
    }

    const data = await ollamaResp.json();
    const raw = String(data?.message?.content ?? "");

    // Parse assistant output as JSON (fallback to plain reply)
    let parsed: { reply: string; command?: unknown } = { reply: raw };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // keep parsed.reply = raw
    }

    const safe = ModelOutputSchema.safeParse(parsed);
    if (safe.success) {
      return res.json(safe.data);
    }

    // If model returned invalid JSON/command, ignore command and just return text
    return res.json({ reply: raw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
