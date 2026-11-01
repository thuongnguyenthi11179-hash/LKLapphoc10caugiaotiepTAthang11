// Speech utility with native Web Speech API and voice selection

export interface SpeakOptions {
  rate?: number; // 0.8 for slow educational mode, 1.0 for normal
  pitch?: number;
  voiceGender?: 'female' | 'male' | 'any';
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let preferredVoice: SpeechSynthesisVoice | null = null;

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(v => v.lang.startsWith('en'));
}

export function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  // Prefer natural high-quality en-US or en-GB voices
  const preferredNames = [
    'Google US English',
    'Samantha',
    'Victoria',
    'Karen',
    'Daniel',
    'Oliver',
    'Serena',
    'en-US-Standard',
    'Microsoft Zira',
    'Microsoft Jenny'
  ];

  for (const name of preferredNames) {
    const found = voices.find(v => v.name.includes(name));
    if (found) return found;
  }

  // Fallback to any en-US voice
  const usVoice = voices.find(v => v.lang === 'en-US');
  if (usVoice) return usVoice;

  // Fallback to any en voice
  return voices[0] || null;
}

export function playEnglishSpeech(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported on this device/browser');
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1.0;

      const voices = getEnglishVoices();
      if (!preferredVoice && voices.length) {
        preferredVoice = pickBestVoice(voices);
      }
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        options.onError?.(e);
        resolve(); // Don't throw unhandled rejection
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech error', err);
      resolve();
    }
  });
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Calculate similarity between spoken text and target text
export function calculateTextMatchScore(spoken: string, target: string): number {
  const cleanSpoken = spoken.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const cleanTarget = target.toLowerCase().replace(/[^\w\s]/g, '').trim();

  if (!cleanSpoken || !cleanTarget) return 0;
  if (cleanSpoken === cleanTarget) return 100;

  const spokenWords = cleanSpoken.split(/\s+/);
  const targetWords = cleanTarget.split(/\s+/);

  let matches = 0;
  for (const w of spokenWords) {
    if (targetWords.includes(w)) {
      matches++;
    }
  }

  const score = Math.round((matches / Math.max(targetWords.length, spokenWords.length)) * 100);
  return Math.min(100, Math.max(20, score));
}
