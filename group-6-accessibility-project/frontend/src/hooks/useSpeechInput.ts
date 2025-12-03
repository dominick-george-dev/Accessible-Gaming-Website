import { useEffect, useMemo, useRef, useState } from "react";

export function useSpeechInput() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      setSupported(false);
      return;
    }

    const rec: SpeechRecognition = new SR();
    rec.lang = "en-GB";
    rec.continuous = true; // allow longer listening sessions
    rec.interimResults = true;

    rec.onstart = () => {
      console.log('[SpeechInput] onstart');
      setListening(true);
    };
    rec.onend = () => {
      console.log('[SpeechInput] onend');
      setListening(false);
      setInterim("");
    };
    rec.onerror = (e: unknown) => {
      if (e && typeof e === 'object') {
        const errObj = e as Record<string, unknown>;
        console.error('[SpeechInput] onerror', {
          type: errObj.type,
          error: errObj.error,
          message: errObj.message,
          ...errObj
        });
      } else {
        console.error('[SpeechInput] onerror', e);
      }
      setListening(false);
      setInterim("");
    };

    rec.onaudiostart = () => console.log('[SpeechInput] onaudiostart');
    rec.onsoundstart = () => console.log('[SpeechInput] onsoundstart');
    rec.onspeechstart = () => console.log('[SpeechInput] onspeechstart');
    rec.onspeechend = () => console.log('[SpeechInput] onspeechend');
    rec.onsoundend = () => console.log('[SpeechInput] onsoundend');
    rec.onaudioend = () => console.log('[SpeechInput] onaudioend');
    rec.onnomatch = (e: unknown) => console.log('[SpeechInput] onnomatch', e);

    recognitionRef.current = rec;
    return () => {
      if (rec) {
        // Defensive: try to abort, but catch and log any errors
        console.log('[SpeechInput] cleanup: attempting to abort recognition');
        try { (rec as unknown as { abort: () => void }).abort(); } catch (err) { console.warn('[SpeechInput] cleanup: abort error', err); }
      }
      recognitionRef.current = null;
    };
  }, []);

  const api = useMemo(() => ({
    supported,
    listening,
    interim,
    start: () => {
      console.log('[SpeechInput] start() called');
      recognitionRef.current?.start();
    },
    stop: () => {
      console.log('[SpeechInput] stop() called');
      recognitionRef.current?.stop();
    },
    setOnFinal: (fn: (finalText: string) => void) => {
      const rec = recognitionRef.current;
      if (!rec) return;

      rec.onresult = (event: unknown) => {
        const evt = event as { resultIndex: number; results: SpeechRecognitionResultList };
        let finalText = "";
        let interimText = "";

        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          const res = evt.results[i];
          const text = res[0]?.transcript ?? "";
          if (res.isFinal) finalText += text;
          else interimText += text;
        }

        setInterim(interimText.trim());
        if (finalText.trim()) {
          console.log('[SpeechInput] onresult final:', finalText.trim());
          fn(finalText.trim());
        }
      };
    },
  }), [supported, listening, interim]);

  return api;
}
