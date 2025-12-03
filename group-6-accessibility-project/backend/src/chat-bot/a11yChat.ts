import express, { Request, Response, Router } from "express";
import fetch from 'node-fetch';

const router: Router = express.Router();

// Add JSON parsing middleware
router.use(express.json());

// Helper function to fetch games from database
async function fetchGamesData(): Promise<any[]> {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/games`);
    
    console.log('Fetching games from:', `${baseUrl}/games`);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const games = await response.json();
      console.log('Games fetched successfully:', games?.data?.length || 0, 'games');
      
      // Handle both direct array and paginated response
      const gameArray = Array.isArray(games) ? games : games?.data || [];
      return gameArray;
    } else {
      console.error('Failed to fetch games. Status:', response.status);
      return [];
    }
    
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

// Helper function to fetch user accessibility settings
async function fetchUserSettings(userId: number): Promise<any> {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/accessibility-settings/${userId}`;
    
    console.log('🔍 Attempting to fetch user settings...');
    console.log('📍 URL:', url);
    console.log('👤 User ID:', userId);
    
    const response = await fetch(url);
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (response.ok) {
      const settings = await response.json();
      console.log('✅ Settings fetched successfully:');
      console.log('📋 Raw settings data:', JSON.stringify(settings, null, 2));
      return settings;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to fetch user settings');
      console.error('📍 Status:', response.status);
      console.error('📋 Error response:', errorText);
      return null;
    }
  } catch (error) {
    console.error('🚨 Error fetching user settings:');
    console.error('📋 Error details:', error);
    console.error('📋 Error message:', error.message);
    console.error('📋 Error stack:', error.stack);
    return null;  }
}

// Helper function to update user accessibility settings
async function updateUserSettings(userId: number, setting: string, value: any): Promise<boolean> {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/accessibility-settings/${userId}`;
    
    console.log('🔧 Attempting to update user setting...');
    console.log('👤 User ID:', userId);
    console.log('⚙️ Setting:', setting);
    console.log('💎 Value:', value);
    
    // First, get current settings
    const currentSettings = await fetchUserSettings(userId);
    if (!currentSettings) {
      console.error('❌ Cannot update settings: failed to fetch current settings');
      return false;
    }
    
    // Update the specific setting
    const updatedSettings = {
      ...currentSettings,
      [setting]: value
    };
    
    console.log('📤 Sending updated settings:', JSON.stringify(updatedSettings, null, 2));
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings)
    });
    
    console.log('📡 Update response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Settings updated successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to update settings');
      console.error('📍 Status:', response.status);
      console.error('📋 Error response:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('🚨 Error updating user settings:');
    console.error('📋 Error details:', error);
    return false;
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface NavigationCommand {
  type: "navigate";
  target: string;
}

interface SettingUpdateCommand {
  type: "update_setting";
  setting: string;
  value: any;
  refreshSettings?: boolean; // Flag to tell frontend to refresh settings
}

interface ChatResponse {
  reply: string;
  command?: NavigationCommand | SettingUpdateCommand;
}

// Health check endpoint
router.get("/a11y-chat", (req, res) => {
  res.status(200).json({ status: "ok", message: "a11y-chat endpoint is up" });
});

// Test endpoint to check game data fetching
router.get("/a11y-chat/test-games", async (req, res) => {
  try {
    console.log('Testing game data fetch...');
    const gameData = await fetchGamesData();
    
    const result = {
      success: true,
      totalGames: gameData.length,
      sampleGame: gameData[0] || null,
      allGameTitles: gameData.map(game => game.title),
      gameInfo: gameData.length > 0 ? 
        gameData.map(game => 
          `- ${game.title} (${game.developer}) - Rating: ${game.rating}/5\n` +
          `  Genre: ${game.genre}, Platform: ${game.platform}\n` +
          `  Accessibility: ${game.accessibilityTags?.map((tag: any) => tag.tag).join(', ') || 'None listed'}\n` +
          `  Description: ${game.description?.substring(0, 150)}...`
        ).join('\n\n') : 
        'No games currently available in database.'
    };
    
    console.log('Game data test result:', result);
    return res.json(result);
  } catch (error) {
    console.error('Game data test failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Test endpoint to check user accessibility settings fetching
router.get("/a11y-chat/test-settings/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('Testing accessibility settings fetch for user:', userId);
    
    const settings = await fetchUserSettings(userId);
    
    const result = {
      success: true,
      userId: userId,
      settings: settings,
      formattedSettings: settings ? 
        `USER'S CURRENT ACCESSIBILITY SETTINGS:
- Theme: ${settings.theme || 'light-mode'}
- Text Size: ${settings.textSize || 16}px
- High Contrast: ${settings.highContrast ? 'On' : 'Off'}
- Colorblind Filter: ${settings.colorblindFilter || 'none'}
- Visual Accessibility: ${settings.visual ? 'On' : 'Off'}
- Hearing Accessibility: ${settings.hearing ? 'On' : 'Off'}
- Motor Accessibility: ${settings.dexterity ? 'On' : 'Off'}
- Cognitive Accessibility: ${settings.cognitive ? 'On' : 'Off'}
- Screen Magnifier: ${settings.screenMagnifier ? 'On' : 'Off'}` :
        'Could not retrieve user accessibility settings.'
    };
    
    console.log('Settings test result:', result);
    return res.json(result);
  } catch (error) {
    console.error('Settings test failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Test endpoint for setting updates
router.post("/a11y-chat/test-update/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { setting, value } = req.body;
    
    console.log('Testing setting update for user:', userId, setting, value);
    
    const success = await updateUserSettings(userId, setting, value);
    
    return res.json({
      success: success,
      userId: userId,
      setting: setting,
      value: value,
      message: success ? 'Setting updated successfully!' : 'Failed to update setting'
    });
  } catch (error) {
    console.error('Setting update test failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Main chat endpoint
router.post("/a11y-chat", async (req: Request, res: Response) => {  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const { messages, context } = body as { 
      messages: ChatMessage[]; 
      context?: { userId?: number; route?: string; featureFlags?: any } 
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array" });
    }

    // Limit message history to last 10 messages for simplicity
    const trimmed = messages.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 1000),
    }));

    // Fetch game data for AI context
    const gameData = await fetchGamesData();
    const gameInfo = gameData.length > 0 ? 
      gameData.map(game => 
        `- ${game.title} (${game.developer}) - Rating: ${game.rating}/5\n` +
        `  Genre: ${game.genre}, Platform: ${game.platform}\n` +
        `  Accessibility: ${game.accessibilityTags?.map((tag: any) => tag.tag).join(', ') || 'None listed'}\n` +
        `  Description: ${game.description?.substring(0, 150)}...`
      ).join('\n\n') : 
      'No games currently available in database.';    // Fetch user accessibility settings if user is logged in
    let userSettings: any = null;
    let userSettingsText = "User is not logged in.";
    
    if (context?.userId) {
      console.log('Fetching settings for user ID:', context.userId);
      userSettings = await fetchUserSettings(context.userId);
      
      if (userSettings) {
        userSettingsText = `USER'S CURRENT ACCESSIBILITY SETTINGS:
- Theme: ${userSettings.theme || 'light-mode'}
- Text Size: ${userSettings.textSize || 16}px
- High Contrast: ${userSettings.highContrast ? 'On' : 'Off'}
- Colorblind Filter: ${userSettings.colorblindFilter || 'none'}
- Visual Accessibility: ${userSettings.visual ? 'On' : 'Off'}
- Hearing Accessibility: ${userSettings.hearing ? 'On' : 'Off'}
- Motor Accessibility: ${userSettings.dexterity ? 'On' : 'Off'}
- Cognitive Accessibility: ${userSettings.cognitive ? 'On' : 'Off'}
- Screen Magnifier: ${userSettings.screenMagnifier ? 'On' : 'Off'}

You can help users view and change these settings.`;
      } else {
        userSettingsText = "Could not retrieve user's accessibility settings.";
      }
    }const system = {
      role: "system",
      content: "You are a helpful accessibility assistant for a gaming website. " +
               "Provide clear and friendly responses about accessibility features and gaming. " +
               "Be conversational and helpful.\n\n" +
               "GAME DATABASE:\n" +
               "Here are the games available in our database:\n" +
               gameInfo + "\n\n" +
               "When users ask about games, only recommend games from the above database. " +
               "Do not mention external games or platforms.\n\n" +               "ACCESSIBILITY SETTINGS:\n" +
               userSettingsText + "\n\n" +
               "When users ask about their accessibility settings, refer to the information above. " +
               "You can help users understand what each setting does and how to change them.\n\n" +
               "SETTING UPDATE CAPABILITIES:\n" +
               "When a user asks to change a setting, respond with JSON containing an update command.\n" +
               "Available settings: theme, textSize, highContrast, colorblindFilter, visual, hearing, dexterity, cognitive, screenMagnifier\n\n" +               "Setting update examples (respond with JSON):\n" +
               "- 'change theme to dark' -> {\"reply\": \"I'll change your theme to dark mode!\", \"command\": {\"type\": \"update_setting\", \"setting\": \"theme\", \"value\": \"dark-mode\"}}\n" +
               "- 'set text size to 20' -> {\"reply\": \"Setting your text size to 20px!\", \"command\": {\"type\": \"update_setting\", \"setting\": \"textSize\", \"value\": 20}}\n" +
               "- 'turn on high contrast' -> {\"reply\": \"Enabling high contrast mode!\", \"command\": {\"type\": \"update_setting\", \"setting\": \"highContrast\", \"value\": true}}\n" +
               "- 'enable screen magnifier' -> {\"reply\": \"Turning on screen magnifier!\", \"command\": {\"type\": \"update_setting\", \"setting\": \"screenMagnifier\", \"value\": true}}\n" +
               "- 'disable high contrast' -> {\"reply\": \"Turning off high contrast!\", \"command\": {\"type\": \"update_setting\", \"setting\": \"highContrast\", \"value\": false}}\n" +
               "- 'change theme to deep-space' -> {\"reply\": \"Setting your theme to deep-space!\", \"command\": {\"type\": \"update_setting\", \"setting\": \"theme\", \"value\": \"deep-space\"}}\n\n"+
               "NAVIGATION CAPABILITIES:\n"+
               "ONLY when a user explicitly asks to navigate to a page, respond with VALID JSON containing a navigation command.\n" +
               "Available pages: home, browserpage, favourites, accessibility, profile\n\n" +
               "Navigation keywords that require JSON responses:\n" +
               "- 'take me to [page]' or 'go to [page]' or 'navigate to [page]'\n" +
               "- 'take me home' -> {\"reply\": \"Taking you to the home page!\", \"command\": {\"type\": \"navigate\", \"target\": \"home\"}}\n" +
               "- 'go to browse' -> {\"reply\": \"Opening the browser page for you!\", \"command\": {\"type\": \"navigate\", \"target\": \"browserpage\"}}\n" +
               "- 'show my favourites' -> {\"reply\": \"Here are your favourites!\", \"command\": {\"type\": \"navigate\", \"target\": \"favourites\"}}\n" +
               "- 'open accessibility settings' -> {\"reply\": \"Opening accessibility settings!\", \"command\": {\"type\": \"navigate\", \"target\": \"accessibility\"}}\n" +
               "- 'go to my profile' -> {\"reply\": \"Taking you to your profile!\", \"command\": {\"type\": \"navigate\", \"target\": \"profile\"}}\n\n" +
               "For ALL OTHER questions (about games, accessibility features, help, etc.), respond with regular text WITHOUT JSON formatting. " +
               "Just answer normally as a helpful assistant."
    };

    const ollamaResp = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2:1b",
        messages: [system, ...trimmed],        stream: false,
        keep_alive: "10m",
        options: { num_predict: 200 }
      }),
    });

    if (!ollamaResp.ok) {
      const text = await ollamaResp.text();
      return res.status(502).json({ error: "ollama_error", detail: text });
    }    const data = await ollamaResp.json();
    const raw = String(data?.message?.content ?? "");
    
    console.log('AI raw response:', raw);    // Try to parse navigation commands from the response
    let response: ChatResponse = { reply: raw };
      // Check if this is a navigation request by looking for keywords
    const lastUserMessage = trimmed[trimmed.length - 1]?.content?.toLowerCase() || '';
    const isNavigationRequest = lastUserMessage.includes('take me') || 
                               lastUserMessage.includes('go to') ||
                               lastUserMessage.includes('navigate') ||
                               lastUserMessage.includes('home') ||
                               lastUserMessage.includes('browse') ||
                               lastUserMessage.includes('favourites') ||
                               lastUserMessage.includes('favorites') ||
                               lastUserMessage.includes('accessibility') ||
                               lastUserMessage.includes('profile');    // Check if this is a setting update request
    const isSettingUpdate = lastUserMessage.includes('increase') ||
                           lastUserMessage.includes('decrease') ||
                           lastUserMessage.includes('change') ||
                           lastUserMessage.includes('set') ||
                           lastUserMessage.includes('turn on') ||
                           lastUserMessage.includes('turn off') ||
                           lastUserMessage.includes('enable') ||
                           lastUserMessage.includes('disable') ||
                           (lastUserMessage.includes('text') && lastUserMessage.includes('size')) ||
                           lastUserMessage.includes('theme') ||
                           lastUserMessage.includes('contrast') ||
                           lastUserMessage.includes('magnifier');

    console.log('Navigation request detected:', isNavigationRequest);
    console.log('Setting update detected:', isSettingUpdate);
    console.log('User message:', lastUserMessage);
      try {
      // Check if response is JSON with command
      const parsed = JSON.parse(raw);
      console.log('Parsed JSON:', parsed);
      if (parsed && typeof parsed.reply === 'string' && parsed.command) {
        response = parsed;
        console.log('Command detected:', response);
          // Execute the command if it's a setting update
        if (response.command && response.command.type === "update_setting" && context?.userId) {
          console.log('Executing setting update command...');
          const settingCommand = response.command as SettingUpdateCommand;
          const success = await updateUserSettings(
            context.userId,
            settingCommand.setting,
            settingCommand.value
          );
            if (success) {
            response.reply += " ✅ Settings updated successfully!";
            // Add refresh flag to tell frontend to reload settings
            if (response.command) {
              (response.command as SettingUpdateCommand).refreshSettings = true;
            }
          } else {
            response.reply += " ❌ Failed to update settings. Please try again.";
          }
        }
      }    } catch (error) {
      console.log('JSON parse failed:', error);
      
      // If AI didn't return JSON but this was a setting update request, force create setting command
      if (isSettingUpdate && context?.userId) {
        console.log('Forcing setting update command creation...');
        let setting = '';
        let value: any = null;
        
        // Parse the user's intent
        if (lastUserMessage.includes('increase') && lastUserMessage.includes('text')) {
          setting = 'textSize';
          value = Math.min(24, (userSettings?.textSize || 16) + 2); // Increase by 2, max 24
        } else if (lastUserMessage.includes('decrease') && lastUserMessage.includes('text')) {
          setting = 'textSize';
          value = Math.max(12, (userSettings?.textSize || 16) - 2); // Decrease by 2, min 12
        } else if (lastUserMessage.includes('turn on') || lastUserMessage.includes('enable')) {
          if (lastUserMessage.includes('contrast')) {
            setting = 'highContrast';
            value = true;
          } else if (lastUserMessage.includes('magnifier')) {
            setting = 'screenMagnifier';
            value = true;
          }
        } else if (lastUserMessage.includes('turn off') || lastUserMessage.includes('disable')) {
          if (lastUserMessage.includes('contrast')) {
            setting = 'highContrast';
            value = false;
          } else if (lastUserMessage.includes('magnifier')) {
            setting = 'screenMagnifier';
            value = false;
          }
        } else if (lastUserMessage.includes('theme')) {
          setting = 'theme';
          if (lastUserMessage.includes('dark')) value = 'dark-mode';
          else if (lastUserMessage.includes('light')) value = 'light-mode';
          else if (lastUserMessage.includes('deep')) value = 'deep-space';
        }
          if (setting && value !== null) {
          const success = await updateUserSettings(context.userId, setting, value);
          response = {
            reply: success ? 
              `✅ I've updated your ${setting} setting!` : 
              `❌ Sorry, I couldn't update your ${setting} setting. Please try again.`,
            command: success ? {
              type: "update_setting",
              setting: setting,
              value: value,
              refreshSettings: true
            } : undefined
          };
        }
      }
      // If AI didn't return JSON but this was a navigation request, force create navigation command
      else if (isNavigationRequest) {
        console.log('Forcing navigation command creation...');
        let target = 'home';
        
        if (lastUserMessage.includes('browse') || lastUserMessage.includes('games')) {
          target = 'browserpage';
        } else if (lastUserMessage.includes('favourites') || lastUserMessage.includes('favorites')) {
          target = 'favourites';
        } else if (lastUserMessage.includes('accessibility') || lastUserMessage.includes('settings')) {
          target = 'accessibility';
        } else if (lastUserMessage.includes('profile') || lastUserMessage.includes('account')) {
          target = 'profile';
        }
        
        response = {
          reply: raw,
          command: {
            type: "navigate",
            target: target
          }
        };
        console.log('Forced navigation command:', response);
      } else {
        // If not JSON, use raw response
        response = { reply: raw };
      }
    }

    return res.json(response);
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
