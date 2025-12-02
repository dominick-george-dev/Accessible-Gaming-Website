import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpeechInput } from "../../hooks/useSpeechInput";
import { speak } from "../../utils/textToSpeech";

type Msg = { role: "user" | "assistant"; content: string };

type Command = { type: "NAVIGATE"; target: "/" | "/games" | "/settings" | "/help" };
type ApiResponse = { reply: string; command?: Command };

export default function A11yChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true); // now stateful
  const navigate = useNavigate();
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

  function handleCommand(cmd: Command) {
    if (cmd.type === "NAVIGATE") navigate(cmd.target);
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
            featureFlags: { highContrast: true },
          },
        }),
      });

      if (!r.ok) {
        const errText = await r.text();
        throw new Error(errText || `HTTP ${r.status}`);
      }

      const data = (await r.json()) as ApiResponse;

      setMessages([...next, { role: "assistant", content: String(data?.reply ?? "") }]);
      if (ttsEnabled) {
        speak(String(data?.reply ?? ""), { lang: "en-GB", rate: 1 });
      }
      if (data.command) {
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
      className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm relative"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Accessibility Help</h2>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            aria-label={ttsEnabled ? "Disable text to speech" : "Enable text to speech"}
            className={`rounded-full border border-gray-300 px-3 py-1 text-sm focus:ring-2 ${ttsEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setTtsEnabled((v) => !v)}
          >
            {ttsEnabled ? "🔊 TTS On" : "🔇 TTS Off"}
          </button>
          {/* Exit button should be here if not already in parent */}
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Ask about keyboard navigation, screen reader support, contrast, and more.
      </p>

      <div aria-live="polite" className="mt-4 min-h-[120px] space-y-3 rounded-xl bg-gray-50 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">Try: “Take me to settings”</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="text-sm">
              <div className="font-medium">{m.role === "user" ? "You" : "Assistant"}</div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))
        )}
      </div>

      <label className="mt-4 block text-sm font-medium">
        Message
        <input
          className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2"
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
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
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
          className={`ml-2 rounded-xl border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 ${speech.listening ? 'bg-blue-100 text-blue-700' : ''}`}
        >
          {speech.listening ? "🎙️ Listening… (release to stop)" : "🎤 Hold to Speak"}
        </button>
      </div>

      {/* Optional: show interim text */}
      {speech.listening && speech.interim ? (
        <div className="mt-2 text-sm text-gray-500">Heard: {speech.interim}</div>
      ) : null}
    </section>
  );
}
