import express, { Request, Response, Router } from "express";
import { z } from "zod";
import fetch from 'node-fetch';

const router: Router = express.Router();

// Add JSON parsing middleware specifically for this router
router.use(express.json());

// Helper function to search games by accessibility
async function searchGames(query: string): Promise<any[]> {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    
    // Extract accessibility keywords from the query
    const visualKeywords = ['visual', 'sight', 'blind', 'screen reader', 'contrast', 'colorblind', 'color blind'];
    const hearingKeywords = ['hearing', 'deaf', 'subtitle', 'sound', 'audio', 'caption'];
    const motorKeywords = ['motor', 'mobility', 'one hand', 'touch', 'gesture', 'control'];
    const cognitiveKeywords = ['cognitive', 'memory', 'simple', 'easy', 'clear'];
      const lowerQuery = query.toLowerCase();
    
    const categories: string[] = [];
    if (visualKeywords.some(keyword => lowerQuery.includes(keyword))) {
      categories.push('Visual Accessibility');
    }
    if (hearingKeywords.some(keyword => lowerQuery.includes(keyword))) {
      categories.push('Hearing Accessibility');
    }
    if (motorKeywords.some(keyword => lowerQuery.includes(keyword))) {
      categories.push('Motor Accessibility');
    }
    if (cognitiveKeywords.some(keyword => lowerQuery.includes(keyword))) {
      categories.push('Cognitive Accessibility');
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    if (categories.length > 0) {
      params.append('categories', categories.join(','));
    }
    params.append('limit', '5'); // Limit to top 5 results
    
    const response = await fetch(`${baseUrl}/games/search-accessibility?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const games = await response.json();
      return Array.isArray(games) ? games : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error searching games:', error);
    return [];  }
}

// Helper function to get user accessibility settings
async function getUserSettings(userId: number): Promise<any> {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/accessibility-settings/${userId}`);
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type ChatContext = { route?: string; userId?: number; featureFlags?: Record<string, boolean> };

const AllowedRoutes = ["/", "/browserpage", "/favorites", "/accessibility", "/profile", "/login" , "/signup"] as const;

const CommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("NAVIGATE"),
    target: z.enum(AllowedRoutes),
  }),
  z.object({
    type: z.literal("UPDATE_SETTING"),
    setting: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
  z.object({
    type: z.literal("GET_SETTINGS"),
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
    // Debug logging
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    console.log('Request body type:', typeof req.body);
    
    // Defensive: ensure req.body is always an object
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const { messages, context } = body as {
      messages: ChatMessage[];
      context?: ChatContext;
    };

    console.log('Extracted messages:', messages);
    console.log('Messages is array:', Array.isArray(messages));
    console.log('Messages length:', messages?.length);

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array" });
    }    // Check if user is asking about games or settings
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const isGameQuery = lastMessage.includes('game') || lastMessage.includes('play') || 
                       lastMessage.includes('visual') || lastMessage.includes('hearing') || 
                       lastMessage.includes('motor') || lastMessage.includes('cognitive') ||
                       lastMessage.includes('accessibility');

    const isSettingsQuery = lastMessage.includes('setting') || lastMessage.includes('theme') ||
                            lastMessage.includes('text size') || lastMessage.includes('contrast') ||
                            lastMessage.includes('dark mode') || lastMessage.includes('light mode') ||
                            lastMessage.includes('apply') || lastMessage.includes('change') ||
                            lastMessage.includes('switch') || lastMessage.includes('enable') ||
                            lastMessage.includes('disable') || lastMessage.includes('turn on') ||
                            lastMessage.includes('turn off') || lastMessage.includes('font') ||
                            lastMessage.includes('magnifier') || lastMessage.includes('colorblind') ||
                            lastMessage.includes('my settings') || lastMessage.includes('increase') ||
                            lastMessage.includes('decrease');

    // Search for relevant games if it's a game-related query
    let gameResults: any[] = [];
    if (isGameQuery) {
      gameResults = await searchGames(lastMessage);
    }

    // Get user settings if it's a settings-related query and user is logged in
    let userSettings: any = null;
    if (isSettingsQuery && context?.userId) {
      userSettings = await getUserSettings(context.userId);
    }

    const trimmed = messages.slice(-20).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 4000),
    }));    const safeContext = {
      route: typeof context?.route === "string" ? context.route.slice(0, 200) : undefined,
      userId: typeof context?.userId === "number" ? context.userId : undefined,
      featureFlags:
        context?.featureFlags && typeof context.featureFlags === "object"
          ? Object.fromEntries(
              Object.entries(context.featureFlags)
                .slice(0, 50)
                .map(([k, v]) => [String(k).slice(0, 50), Boolean(v)])
            )
          : undefined,
      gameResults: gameResults.length > 0 ? gameResults : undefined,
      userSettings: userSettings || undefined,
    };const system = {
      role: "system",
      content:
        "You are an accessibility helper for this application.\n" +
        "You CAN control the app and change user settings using commands.\n\n" +
        "IMPORTANT: You have FULL ACCESS to change user accessibility settings!\n\n" +
        "Allowed commands:\n" +
        `- NAVIGATE: target must be one of ${JSON.stringify(AllowedRoutes)}\n` +
        "- UPDATE_SETTING: setting (string) and value (string/number/boolean) - USE THIS TO CHANGE USER SETTINGS\n" +
        "- GET_SETTINGS: retrieve user's current accessibility settings\n" +
        "- CLICK_UNDO: click the undo button if available\n" +
        "- TOGGLE_MAGNIFIER: enable or disable the magnifier (enabled: true/false)\n\n" +
        "ACCESSIBILITY SETTINGS YOU CAN CHANGE:\n" +
        "- theme: 'light-mode' or 'dark-mode'\n" +
        "- textSize: number (14-24)\n" +
        "- highContrast: true/false\n" +
        "- colorblindFilter: 'none', 'protanopia', 'deuteranopia', 'tritanopia'\n" +
        "- visual: true/false (visual accessibility preference)\n" +
        "- hearing: true/false (hearing accessibility preference)\n" +
        "- dexterity: true/false (motor accessibility preference)\n" +
        "- cognitive: true/false (cognitive accessibility preference)\n" +
        "- screenMagnifier: true/false\n\n" +
        (userSettings ? 
          "USER'S CURRENT SETTINGS:\n" +
          `Theme: ${userSettings.theme || 'light-mode'}\n` +
          `Text size: ${userSettings.textSize || 16}px\n` +
          `High contrast: ${userSettings.highContrast ? 'On' : 'Off'}\n` +
          `Colorblind filter: ${userSettings.colorblindFilter || 'none'}\n` +
          `Visual accessibility: ${userSettings.visual ? 'On' : 'Off'}\n` +
          `Hearing accessibility: ${userSettings.hearing ? 'On' : 'Off'}\n` +
          `Motor accessibility: ${userSettings.dexterity ? 'On' : 'Off'}\n` +
          `Cognitive accessibility: ${userSettings.cognitive ? 'On' : 'Off'}\n` +
          `Screen magnifier: ${userSettings.screenMagnifier ? 'On' : 'Off'}\n\n` : 
          "User is not logged in - suggest they log in to change settings.\n\n") +
        "WHEN USER ASKS TO CHANGE SETTINGS:\n" +
        "- ALWAYS respond with UPDATE_SETTING command\n" +
        "- Be confident: 'I'll change that for you right now'\n" +
        "- Use exact setting names listed above\n" +
        "- Example: User says 'apply light mode' -> {\"reply\": \"I'll switch you to light mode right now\", \"command\": {\"type\": \"UPDATE_SETTING\", \"setting\": \"theme\", \"value\": \"light-mode\"}}\n\n" +        "GAME RECOMMENDATIONS:\n" +
        "IMPORTANT: Only recommend games that are available in this application's database.\n" +
        "When users ask about games with accessibility features:\n" +
        "- Only suggest games from the AVAILABLE GAMES list below\n" +
        "- If no games are found, say 'We don't currently have games with those specific features in our database'\n" +
        "- Do NOT mention external games like Civilization, Steam games, or other platforms\n" +
        "- Focus only on the games available in this accessibility gaming platform\n\n" +
        "Game categories to search for:\n" +
        "- Visual Accessibility: screen readers, high contrast, large text, colorblind support\n" +
        "- Hearing Accessibility: subtitles, visual cues, sound alternatives\n" +
        "- Motor Accessibility: one-handed controls, adjustable difficulty, pause options\n" +
        "- Cognitive Accessibility: simple interface, clear instructions, memory aids\n\n" +
        (gameResults.length > 0 ? 
          "AVAILABLE GAMES:\n" + 
          gameResults.map(g => `- ${g.title} (${g.developer}) - Rating: ${g.rating}/5\n  Accessibility: ${g.accessibilityTags?.map((t: any) => t.tag).join(', ') || 'None listed'}\n  ${g.description?.substring(0, 100)}...`).join('\n') + 
          "\n\n" : "") +
        "RESPONSE FORMAT:\n" +
        "ALWAYS respond with VALID JSON:\n" +
        'FOR SETTING CHANGES: {"reply": "I\'ll switch you to light mode right now", "command": {"type": "UPDATE_SETTING", "setting": "theme", "value": "light-mode"}}\n' +
        'FOR GETTING SETTINGS: {"reply": "Let me check your current settings", "command": {"type": "GET_SETTINGS"}}\n' +
        'FOR NAVIGATION: {"reply": "I\'ll take you to the browse page", "command": {"type": "NAVIGATE", "target": "/browserpage"}}\n' +
        'FOR GENERAL HELP: {"reply": "your helpful response text here"}\n\n' +
        "IMPORTANT RULES:\n" +
        "- Always use UPDATE_SETTING command when user wants to change settings\n" +
        "- Be confident about your ability to change settings\n" +
        "- Use exact setting names: theme, textSize, highContrast, etc.\n" +
        "- Do NOT say you can't change settings - you absolutely can!\n" +
        "- For theme changes: use 'light-mode' or 'dark-mode' as values\n\n" +
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
    }    const data = await ollamaResp.json();
    const raw = String(data?.message?.content ?? "");

    // Parse assistant output as JSON (fallback to plain reply)
    let parsed: { reply: string; command?: unknown } = { reply: raw };
    try {
      // Try to parse as JSON first
      const jsonParsed = JSON.parse(raw);
      if (jsonParsed && typeof jsonParsed.reply === 'string') {
        parsed = jsonParsed;
      }
    } catch {
      // If JSON parsing fails, treat the entire response as the reply
      parsed = { reply: raw };
    }

    // Validate the parsed result
    const safe = ModelOutputSchema.safeParse(parsed);
    if (safe.success) {
      return res.json(safe.data);
    }

    // If validation fails, return just the text as reply
    return res.json({ reply: parsed.reply || raw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
