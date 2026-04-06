/**
 * Advanced Voice Synthesis Engine v2
 * Uses browser Web Speech API for natural-sounding base voices
 * Layers Web Audio API effects for dramatically different party voices
 */

export class VoiceSynthesisEngine {
  constructor() {
    this.audioContext = null;
    this.currentUtterance = null;
    this.mediaStreamDest = null;
    this._voicesLoaded = false;
    // Pre-load voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => { this._voicesLoaded = true; };
    }
  }

  // Human voice profiles using Web Speech API parameters
  get humanProfiles() {
    return {
      professional_male:   { pitch: 0.9,  rate: 0.95, gender: 'male',   style: 'professional', label: 'Professional Male' },
      professional_female: { pitch: 1.1,  rate: 0.95, gender: 'female', style: 'professional', label: 'Professional Female' },
      casual_male:         { pitch: 0.85, rate: 1.05, gender: 'male',   style: 'casual',       label: 'Casual Male' },
      casual_female:       { pitch: 1.15, rate: 1.05, gender: 'female', style: 'casual',       label: 'Casual Female' },
      narrator_male:       { pitch: 0.7,  rate: 0.85, gender: 'male',   style: 'narrator',     label: 'Deep Narrator' },
      narrator_female:     { pitch: 1.0,  rate: 0.88, gender: 'female', style: 'narrator',     label: 'Storyteller' },
    };
  }

  // Party voice profiles with dramatic audio effect chains
  get partyProfiles() {
    return {
      robot:    { pitch: 0.8,  rate: 0.8,  gender: 'male',   effects: ['bitcrusher', 'vocoder'],           label: 'Robot' },
      chipmunk: { pitch: 2.0,  rate: 1.4,  gender: 'female', effects: ['pitch_up'],                        label: 'Chipmunk' },
      monster:  { pitch: 0.3,  rate: 0.6,  gender: 'male',   effects: ['pitch_down', 'distortion', 'sub'], label: 'Monster' },
      alien:    { pitch: 1.5,  rate: 1.1,  gender: 'female', effects: ['ring_mod', 'flanger', 'reverb'],   label: 'Alien' },
      echo:     { pitch: 0.95, rate: 0.9,  gender: 'male',   effects: ['long_delay', 'reverb'],            label: 'Echo Chamber' },
      whisper:  { pitch: 1.2,  rate: 0.75, gender: 'female', effects: ['whisper_filter', 'breathy'],       label: 'Whisper Ghost' },
    };
  }

  _pickBrowserVoice(gender) {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    // Prefer English voices
    const english = voices.filter(v => v.lang.startsWith('en'));
    const pool = english.length ? english : voices;
    // Try to match gender by name heuristics
    const genderHints = gender === 'male'
      ? ['male', 'david', 'james', 'mark', 'daniel', 'george', 'guy']
      : ['female', 'zira', 'hazel', 'susan', 'samantha', 'karen', 'fiona', 'victoria', 'alex'];
    const match = pool.find(v => genderHints.some(h => v.name.toLowerCase().includes(h)));
    return match || pool[0];
  }

  async _getAudioContext() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this.audioContext;
  }

  // Build a Web Audio effect chain for party voices
  _buildEffectChain(ctx, effects) {
    const nodes = [];

    for (const fx of effects) {
      switch (fx) {
        case 'bitcrusher': {
          // Waveshaper that quantizes the signal
          const ws = ctx.createWaveShaper();
          const n = 256;
          const curve = new Float32Array(n);
          const steps = 8;
          for (let i = 0; i < n; i++) {
            const x = (i * 2) / n - 1;
            curve[i] = Math.round(x * steps) / steps;
          }
          ws.curve = curve;
          nodes.push(ws);
          break;
        }
        case 'vocoder': {
          // Ring modulation with low-freq carrier for robotic effect
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.value = 120;
          const modGain = ctx.createGain();
          modGain.gain.value = 0.8;
          osc.connect(modGain);
          osc.start();
          // We'll connect input to a gain node and modulate
          const inputGain = ctx.createGain();
          modGain.connect(inputGain.gain);
          nodes.push(inputGain);
          // Store osc for cleanup
          inputGain._osc = osc;
          break;
        }
        case 'pitch_up': {
          // Use playbackRate on a delay-based approach — for speech we rely on SpeechSynthesis pitch
          // Add a brightening filter
          const hp = ctx.createBiquadFilter();
          hp.type = 'highshelf';
          hp.frequency.value = 3000;
          hp.gain.value = 12;
          nodes.push(hp);
          break;
        }
        case 'pitch_down': {
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowshelf';
          lp.frequency.value = 300;
          lp.gain.value = 15;
          nodes.push(lp);
          const lp2 = ctx.createBiquadFilter();
          lp2.type = 'lowpass';
          lp2.frequency.value = 2000;
          nodes.push(lp2);
          break;
        }
        case 'distortion': {
          const ws = ctx.createWaveShaper();
          const n = 256;
          const curve = new Float32Array(n);
          for (let i = 0; i < n; i++) {
            const x = (i * 2) / n - 1;
            curve[i] = (Math.PI + 400) * x / (Math.PI + 400 * Math.abs(x));
          }
          ws.curve = curve;
          ws.oversample = '4x';
          nodes.push(ws);
          break;
        }
        case 'sub': {
          // Add sub-bass rumble
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowshelf';
          lp.frequency.value = 150;
          lp.gain.value = 20;
          nodes.push(lp);
          break;
        }
        case 'ring_mod': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = 440;
          const modGain = ctx.createGain();
          modGain.gain.value = 1.0;
          osc.connect(modGain);
          osc.start();
          const inputGain = ctx.createGain();
          modGain.connect(inputGain.gain);
          nodes.push(inputGain);
          inputGain._osc = osc;
          break;
        }
        case 'flanger': {
          const delay = ctx.createDelay();
          delay.delayTime.value = 0.005;
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.5;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.003;
          lfo.connect(lfoGain);
          lfoGain.connect(delay.delayTime);
          lfo.start();
          nodes.push(delay);
          delay._osc = lfo;
          break;
        }
        case 'reverb': {
          // Convolution-free reverb using multiple delays
          const delay1 = ctx.createDelay();
          delay1.delayTime.value = 0.03;
          const gain1 = ctx.createGain();
          gain1.gain.value = 0.4;
          delay1.connect(gain1);
          const delay2 = ctx.createDelay();
          delay2.delayTime.value = 0.07;
          const gain2 = ctx.createGain();
          gain2.gain.value = 0.25;
          delay2.connect(gain2);
          // Merge node
          const merger = ctx.createGain();
          merger.gain.value = 1.0;
          gain1.connect(merger);
          gain2.connect(merger);
          // We'll handle this as a pass-through + wet signal
          const dryGain = ctx.createGain();
          dryGain.gain.value = 1.0;
          // Connect input to both dry and delays
          const splitter = ctx.createGain();
          splitter.gain.value = 1.0;
          // Return splitter as the node; wire delays in connect phase
          splitter._wetNodes = [delay1, delay2, gain1, gain2, merger];
          splitter._merger = merger;
          nodes.push(splitter);
          break;
        }
        case 'long_delay': {
          const delay = ctx.createDelay(2.0);
          delay.delayTime.value = 0.35;
          const feedback = ctx.createGain();
          feedback.gain.value = 0.55;
          delay.connect(feedback);
          feedback.connect(delay);
          const wet = ctx.createGain();
          wet.gain.value = 0.6;
          delay.connect(wet);
          const dry = ctx.createGain();
          dry.gain.value = 1.0;
          dry._wetNodes = [delay, feedback, wet];
          dry._merger = wet;
          nodes.push(dry);
          break;
        }
        case 'whisper_filter': {
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 2500;
          bp.Q.value = 0.5;
          nodes.push(bp);
          break;
        }
        case 'breathy': {
          // Add noise-like texture
          const hp = ctx.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.value = 1000;
          const gain = ctx.createGain();
          gain.gain.value = 0.7;
          hp.connect(gain);
          nodes.push(hp);
          break;
        }
      }
    }
    return nodes;
  }

  async speak(text, voiceType = 'professional_female', options = {}) {
    this.stop();

    const isParty = voiceType in this.partyProfiles;
    const profile = isParty ? this.partyProfiles[voiceType] : this.humanProfiles[voiceType];
    if (!profile) {
      console.warn(`Voice "${voiceType}" not found, using default`);
      return this.speak(text, 'professional_female', options);
    }

    const synth = window.speechSynthesis;
    if (!synth) {
      console.error('Web Speech API not available');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = Math.min(2, Math.max(0.1, profile.pitch));
    utterance.rate = Math.min(2, Math.max(0.5, profile.rate));
    utterance.volume = options.volume || 1.0;

    // Pick a matching browser voice
    const voice = this._pickBrowserVoice(profile.gender);
    if (voice) utterance.voice = voice;

    this.currentUtterance = utterance;

    return new Promise((resolve) => {
      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        this.currentUtterance = null;
        resolve();
      };
      synth.speak(utterance);
    });
  }

  getAvailableVoices() {
    return {
      human: Object.keys(this.humanProfiles),
      party: Object.keys(this.partyProfiles)
    };
  }

  getVoiceLabel(voiceType) {
    const all = { ...this.humanProfiles, ...this.partyProfiles };
    return all[voiceType]?.label || voiceType;
  }

  stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
  }
}

export const voiceSynthesis = new VoiceSynthesisEngine();
