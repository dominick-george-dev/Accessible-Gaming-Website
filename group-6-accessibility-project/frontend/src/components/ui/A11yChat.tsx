import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpeechInput } from "../../hooks/useSpeechInput";
import { speak } from "../../utils/textToSpeech";
import { useAccessibility } from "../../contexts/AccessibilityContext";

type Msg = { role: "user" | "assistant"; content: string };

type Command = { 
  type: "NAVIGATE"; 
  target: "/" | "/games" | "/settings" | "/help" 
} | {
  type: "navigate";
  target: "home" | "browserpage" | "favourites" | "accessibility" | "profile";
} | {
  type: "UPDATE_SETTING";
  setting: string;
  value: any;
} | {
  type: "update_setting";
  setting: string;
  value: any;
  refreshSettings?: boolean;
} | {
  type: "GET_SETTINGS";
};
type ApiResponse = { reply: string; command?: Command };

// Hook to get user from localStorage
function useUser() {
  const [user, setUser] = useState<{ id: number; username: string; email: string; isAdmin: boolean; isPublisher: boolean } | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userData = localStorage.getItem("userData");
    if (isLoggedIn && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  return user;
}

export default function A11yChat({ onWakeWord }: { onWakeWord?: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const navigate = useNavigate();
  const user = useUser();
  const { updatePreferences } = useAccessibility();
  const endpoint = useMemo(() => {
    // Use environment variable or fallback to localhost:3000
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/a11y-chat`;
  }, []);

  // Speech input integration
  const speech = useSpeechInput();
  useEffect(() => {
    if (!speech.supported) return;
    // Always set the handler ONCE
    speech.setOnFinal((finalText: string) => {
      setText(finalText);
      // To auto-send, uncomment the next line:
      // send();
    });
    // Clean up: remove handler on unmount
    return () => {
      if (speech.setOnFinal) {
        speech.setOnFinal(() => {});
      }
    };
  }, [speech]);

  // Debug/test: log when speech is listening
  useEffect(() => {
    if (speech.listening) {
      console.log('Speech recognition started');
    } else {
      console.log('Speech recognition stopped');
    }
  }, [speech.listening]);  

  // Function to refresh accessibility settings after chatbot update
  async function refreshAccessibilitySettings() {
    try {
      if (!user) return;
      
      const response = await fetch(`http://localhost:3000/api/accessibility-settings/${user.id}`);
      if (response.ok) {
        const settings = await response.json();
        
        // Map backend settings to frontend format
        const mappedSettings = {
          visual: settings.visual || false,
          hearing: settings.hearing || false,
          dexterity: settings.dexterity || false,
          cognitive: settings.cognitive || false,
          textSize: settings.textSize || 16,
          highContrast: settings.highContrast || false,
          dyslexiaFont: settings.fontFamily === 'OpenDyslexic',
          colorblindFilter: settings.colorblindFilter || 'none',
          theme: settings.theme || 'light',
        };
        
        // Update the accessibility context
        await updatePreferences(mappedSettings);
        console.log('Accessibility settings refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to refresh accessibility settings:', error);
    }
  }

  function handleCommand(cmd: Command) {
    if (cmd.type === "NAVIGATE") {
      navigate(cmd.target);
    } else if (cmd.type === "navigate") {
      // Handle the new lowercase navigation commands from backend
      console.log('Navigation command received:', cmd.target);
      
      switch (cmd.target) {
        case 'home':
          navigate('/');
          break;
        case 'browserpage':
          navigate('/browserpage');
          break;
        case 'favourites':
          navigate('/favourites');
          break;
        case 'accessibility':
          navigate('/accessibility');
          break;
        case 'profile':
          navigate('/profile');
          break;
        default:
          console.warn('Unknown navigation target:', cmd.target);
      }
    } else if (cmd.type === "UPDATE_SETTING") {
      handleUpdateSetting(cmd.setting, cmd.value);    } else if (cmd.type === "update_setting") {
      // Handle setting updates from chatbot
      console.log('Setting update command received:', cmd);
      if (cmd.refreshSettings) {
        // Refresh the accessibility settings to apply changes immediately
        refreshAccessibilitySettings();
        console.log('Refreshing accessibility settings...');
      }
    } else if (cmd.type === "GET_SETTINGS") {
      handleGetSettings();
    }
  }
  async function handleUpdateSetting(setting: string, value: any) {
    console.log('Frontend: handleUpdateSetting called with:', { setting, value, user });
    
    if (!user) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Please log in to update accessibility settings." 
      }]);
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      console.log('Frontend: Fetching current settings from:', `${baseUrl}/api/accessibility-settings/${user.id}`);
      
      // Get current settings first
      const getCurrentResponse = await fetch(`${baseUrl}/api/accessibility-settings/${user.id}`);
      if (!getCurrentResponse.ok) {
        console.error('Frontend: Failed to get current settings, status:', getCurrentResponse.status);
        throw new Error('Failed to get current settings');
      }
      
      const currentSettings = await getCurrentResponse.json();
      console.log('Frontend: Current settings:', currentSettings);
      
      // Update the specific setting
      const updatedSettings = { ...currentSettings, [setting]: value };
      console.log('Frontend: Updated settings to send:', updatedSettings);
      
      const updateResponse = await fetch(`${baseUrl}/api/accessibility-settings/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });

      console.log('Frontend: Update response status:', updateResponse.status);      if (updateResponse.ok) {
        const responseData = await updateResponse.json();
        console.log('Frontend: Update response data:', responseData);
        
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Successfully updated ${setting} to ${value}. Refreshing page to apply changes...` 
        }]);
        
        // Auto-refresh to apply visual changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorText = await updateResponse.text();
        console.error('Frontend: Update failed with error:', errorText);
        throw new Error(`Failed to update setting: ${errorText}`);
      }
    } catch (error) {
      console.error('Frontend: Error updating setting:', error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Sorry, I couldn't update that setting right now. Error: ${error.message}` 
      }]);
    }
  }

  async function handleGetSettings() {
    if (!user) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Please log in to view your accessibility settings." 
      }]);
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/accessibility-settings/${user.id}`);
      
      if (response.ok) {
        const settings = await response.json();
        const settingsText = `Your current accessibility settings:
• Theme: ${settings.theme}
• Text size: ${settings.textSize}px
• High contrast: ${settings.highContrast ? 'On' : 'Off'}
• Color blind filter: ${settings.colorblindFilter}
• Visual accessibility: ${settings.visual ? 'On' : 'Off'}
• Hearing accessibility: ${settings.hearing ? 'On' : 'Off'}
• Motor accessibility: ${settings.dexterity ? 'On' : 'Off'}
• Cognitive accessibility: ${settings.cognitive ? 'On' : 'Off'}
• Screen magnifier: ${settings.screenMagnifier ? 'On' : 'Off'}`;
        
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: settingsText 
        }]);
      } else {
        throw new Error('Failed to get settings');
      }
    } catch (error) {
      console.error('Error getting settings:', error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I couldn't retrieve your settings right now." 
      }]);
    }
  }

  async function send() {
    const content = text.trim();
    if (!content || busy) return;

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setText("");
    setBusy(true);    try {
      console.log('Sending request to:', endpoint);
      console.log('Request payload:', {
        messages: next,
        context: {
          route: window.location.pathname,
          featureFlags: { highContrast: true },
        },
      });
        const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          context: {
            route: window.location.pathname,
            userId: user?.id,
            featureFlags: { highContrast: true },
          },
        }),
      });

      if (!r.ok) {
        const errText = await r.text();
        throw new Error(errText || `HTTP ${r.status}`);
      }      const data = (await r.json()) as ApiResponse;

      // Only display the reply text, not the full JSON
      const replyText = String(data?.reply ?? "");
      setMessages([...next, { role: "assistant", content: replyText }]);
      
      if (ttsEnabled) {
        speak(replyText, { lang: "en-GB", rate: 1 });
      }      // Handle commands separately (don't show them to user)
      if (data.command) {
        console.log('Command received from backend:', data.command);
        handleCommand(data.command);
      }
    } catch (e) {
      console.error(e);
      setMessages([
        ...next,
        { role: "assistant", content: "Sorry—chat service is unavailable right now." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (    
    <section
      aria-label="Accessibility chat"
      className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-sm relative"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-card-foreground">Aiden - ChatBot</h2>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            aria-label={ttsEnabled ? "Disable text to speech" : "Enable text to speech"}
            className={`rounded-full border border-border px-3 py-1 text-sm focus:ring-2 focus:ring-ring ${ttsEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
            onClick={() => setTtsEnabled((v) => !v)}
          >
            {ttsEnabled ? "🔊 TTS On" : "🔇 TTS Off"}
          </button>
          {/* Exit button should be here if not already in parent */}
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask about keyboard navigation, screen reader support, contrast, and more.
      </p>      <div aria-live="polite" className="mt-4 min-h-[120px] space-y-3 rounded-xl bg-muted/50 p-3">
        {messages.length === 0 ? (          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Try asking:</p>
            <ul className="space-y-1 text-xs">
              <li>• "Which games feature visual accessibility?"</li>
              <li>• "Show me games with hearing support"</li>
              <li>• "Find games with motor accessibility"</li>
              <li>• "Show me my accessibility settings"</li>
              <li>• "Change to dark mode"</li>
              <li>• "Increase text size"</li>
              <li>• "Take me to settings"</li>
            </ul>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="text-sm">
              <div className="font-medium text-foreground">{m.role === "user" ? "You" : "Assistant"}</div>
              <div className="whitespace-pre-wrap text-foreground">{m.content}</div>
              
              {/* Enhanced game recommendations display */}
              {m.role === "assistant" && m.content.includes("game") && (
                <div className="mt-2 text-xs text-muted-foreground">
                  💡 Tip: Use "Browse Games" to see all accessibility features
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <label className="mt-4 block text-sm font-medium text-foreground">
        Message
        <input
          className="mt-2 w-full rounded-xl border border-border bg-input p-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          disabled={busy}
        />
      </label>

      <div className="flex items-center mt-3">
        <button
          className="rounded-xl border border-border bg-background text-foreground px-4 py-2 text-sm disabled:opacity-50 hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring"
          onClick={send}
          disabled={busy || !text.trim()}
        >
          {busy ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          onMouseDown={() => {
            if (!speech.listening && speech.supported && !busy) {
              console.log('Push-to-talk: start');
              speech.start();
            }
          }}
          onMouseUp={() => {
            if (speech.listening) {
              console.log('Push-to-talk: stop');
              speech.stop();
            }
          }}
          onMouseLeave={() => {
            if (speech.listening) {
              console.log('Push-to-talk: stop (mouse leave)');
              speech.stop();
            }
          }}
          onKeyDown={e => {
            if ((e.key === ' ' || e.key === 'Enter') && !speech.listening && speech.supported && !busy) {
              e.preventDefault();
              console.log('Push-to-talk: start (keyboard)');
              speech.start();
            }
          }}
          onKeyUp={e => {
            if ((e.key === ' ' || e.key === 'Enter') && speech.listening) {
              e.preventDefault();
              console.log('Push-to-talk: stop (keyboard)');
              speech.stop();
            }
          }}
          disabled={!speech.supported || busy}
          aria-pressed={speech.listening}
          aria-label={speech.listening ? "Release to stop voice input" : "Hold to speak"}
          className={`ml-2 rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-ring ${
            speech.listening 
              ? 'bg-primary/10 text-primary' 
              : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          {speech.listening ? "🎙️ Listening… (release to stop)" : "🎤 Hold to Speak"}
        </button>
      </div>

      {/* Optional: show interim text */}
      {speech.listening && speech.interim ? (
        <div className="mt-2 text-sm text-muted-foreground">Heard: {speech.interim}</div>
      ) : null}
    </section>
  );
}
