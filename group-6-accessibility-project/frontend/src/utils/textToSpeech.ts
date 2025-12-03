export type SpeakOptions = {
  lang?: string;   // "en-GB"
  rate?: number;   // 0.8–1.2 is usually comfy
  pitch?: number;  // 0–2
};

function pickBestVoice(lang: string) {
  const voices = window.speechSynthesis.getVoices();
  const candidates = voices.filter(v => v.lang?.toLowerCase().startsWith(lang.toLowerCase()));
  return candidates[0] ?? voices[0] ?? null;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (!("speechSynthesis" in window)) return;

  const lang = opts.lang ?? "en-GB";
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = opts.rate ?? 1;
  utter.pitch = opts.pitch ?? 1;

  // Best effort voice selection (voices may load async)
  const trySpeak = () => {
    const voice = pickBestVoice(lang);
    if (voice) utter.voice = voice;

    window.speechSynthesis.cancel(); // stop previous speech
    window.speechSynthesis.speak(utter);
  };

  // Some browsers populate voices asynchronously
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => trySpeak();
  } else {
    trySpeak();
  }
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
