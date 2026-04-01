import React, { useState, useEffect } from 'react';

export default function BrowserVoice({ text, onEnd, autoPlay = false, gender = 'female' }) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (autoPlay && text && voices.length > 0) {
      speak();
    }
  }, [text, autoPlay, voices]);

  const speak = () => {
    if (!text) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select appropriate voice based on gender
    const preferredVoice = voices.find(voice => 
      gender === 'female' 
        ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('samantha') || voice.name.toLowerCase().includes('victoria')
        : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('daniel') || voice.name.toLowerCase().includes('alex')
    ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Humanize: Randomize pitch and rate for natural variation
    const basePitch = gender === 'female' ? 1.1 : 0.9;
    const baseRate = 0.9;
    const pitchVariation = Math.random() * 0.2 - 0.1; // ±0.1
    const rateVariation = Math.random() * 0.1 - 0.05; // ±0.05
    
    utterance.pitch = Math.max(0.5, Math.min(2.0, basePitch + pitchVariation));
    utterance.rate = Math.max(0.5, Math.min(2.0, baseRate + rateVariation));
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { speaking, speak, stop };
}