// Web Speech API Voice Utility Functions

export class WebSpeechVoiceManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
  }

  getAvailableVoices() {
    this.voices = this.synth.getVoices();
    return this.voices;
  }

  findVoice(language, gender = null) {
    const voices = this.getAvailableVoices();
    
    // Filter by language first
    let filtered = voices.filter(v => v.lang.startsWith(language.split('-')[0]));
    
    // Filter by gender if specified
    if (gender) {
      const genderFiltered = filtered.filter(v => {
        const name = v.name.toLowerCase();
        if (gender === 'male') {
          return name.includes('male') || name.includes('man') || name.includes('boy');
        } else if (gender === 'female') {
          return name.includes('female') || name.includes('woman') || name.includes('girl');
        }
        return true;
      });
      if (genderFiltered.length > 0) filtered = genderFiltered;
    }

    return filtered.length > 0 ? filtered[0] : voices[0];
  }

  speak(text, options = {}) {
    const {
      language = 'en-US',
      gender = 'female',
      pitch = 1.0,
      rate = 1.0,
      volume = 1.0,
      humanize = true,
      onStart = null,
      onEnd = null,
      onError = null
    } = options;

    // Cancel any ongoing speech
    if (this.currentUtterance) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.findVoice(language, gender);

    utterance.voice = voice;
    utterance.lang = language;
    
    // Humanize: Randomize pitch and rate slightly for natural variation
    if (humanize) {
      const pitchVariation = Math.random() * 0.2 - 0.1; // ±0.1
      const rateVariation = Math.random() * 0.1 - 0.05; // ±0.05
      utterance.pitch = Math.max(0.5, Math.min(2.0, pitch + pitchVariation));
      utterance.rate = Math.max(0.5, Math.min(2.0, rate + rateVariation));
    } else {
      utterance.pitch = Math.max(0.5, Math.min(2.0, pitch));
      utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    }
    
    utterance.volume = Math.max(0, Math.min(1.0, volume));

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    this.currentUtterance = utterance;
    this.synth.speak(utterance);

    return utterance;
  }

  getRandomLoadingMessage() {
    const loadingPhrases = {
      casual: ["Just a sec, Juzzy...", "Hang tight, I'm on it!", "Checking the vault...", "Let me think about that...", "One moment please..."],
      tech: ["Reticulating splines...", "Accessing the Sovereign servers...", "Querying the Oracle database...", "Encrypting the stream...", "Syncing neural pathways..."],
      personality: ["Fatty is watching me work, one moment...", "Checking my circuits for you...", "Peggy is thinking...", "Consulting the Oracle...", "Analyzing the data stream..."]
    };

    const categories = Object.keys(loadingPhrases);
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const phrases = loadingPhrases[randomCat];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  speakLoadingMessage(options = {}) {
    const message = this.getRandomLoadingMessage();
    return this.speak(message, { ...options, humanize: true });
  }

  stop() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  pause() {
    if (this.synth.paused) {
      this.synth.resume();
    } else {
      this.synth.pause();
    }
  }

  isSpeaking() {
    return this.synth.speaking;
  }

  isPaused() {
    return this.synth.paused;
  }
}

// Global instance
export const voiceManager = new WebSpeechVoiceManager();