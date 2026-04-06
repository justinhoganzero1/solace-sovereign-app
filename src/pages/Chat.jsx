import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { voiceManager } from '../components/voice/WebSpeechVoiceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Mic, MicOff, MessageSquare, ChevronDown, Users, Heart, BarChart3, Sparkles, PhoneOff, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { oracleMemory } from '../lib/oracleMemory';
import { AI_FRIENDS, generateStandaloneResponse, getFriend, getAllFriends, friendMemory, getPersonalityCatalog, addUserFriend } from '../lib/aiFriends';
import { wearableSync } from '../lib/wearableSync';
import { generateWithMultiAI, getConfiguredCount } from '../lib/multiAIEngine';
import { getActiveApps, APP_CATALOG, connectApp, getPriceWithFee, ADMIN_FEE_PERCENT } from '../lib/appIntegration';
import { Activity } from 'lucide-react';

/* ═══════════════════════════════════════════
   ORACLE ORB — immersive full-screen sphere
   Electric blue core, cyberpunk pink backlight,
   speech-pattern ripples, multicolor listening shimmer
   ═══════════════════════════════════════════ */
function OracleOrb({ isSpeaking, isListening, isThinking, voiceLevel }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const cx = W / 2;
      const cy = H * 0.42;
      const R = Math.min(W, H) * 0.34;
      const t = timeRef.current;
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, W, H);

      // ── CYBERPUNK PINK BACKLIGHT (always, stronger when speaking) ──
      const blStrength = isSpeaking ? 0.7 : 0.25;
      const blPulse = 1 + Math.sin(t * 2) * (isSpeaking ? 0.3 : 0.1);
      const blR = R * (1.8 + Math.sin(t * 0.7) * 0.2) * blPulse;
      const blGrad = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, blR);
      blGrad.addColorStop(0, `rgba(236,72,153,${blStrength * 0.6})`);
      blGrad.addColorStop(0.4, `rgba(236,72,153,${blStrength * 0.3})`);
      blGrad.addColorStop(0.7, `rgba(168,85,247,${blStrength * 0.12})`);
      blGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = blGrad;
      ctx.fillRect(0, 0, W, H);

      // ── OUTER GLOW RINGS ──
      for (let r = 0; r < 5; r++) {
        const ringR = R + 20 + r * 35;
        const ringAlpha = isSpeaking ? (0.35 - r * 0.06) : (0.12 - r * 0.02);
        const ringPulse = 1 + Math.sin(t * (1.5 + r * 0.3) + r) * (isSpeaking ? 0.15 : 0.04);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR * ringPulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(236,72,153,${Math.max(0, ringAlpha)})`;
        ctx.lineWidth = isSpeaking ? 2 : 1;
        ctx.stroke();
      }

      // ── MAIN ORB BODY — electric blue sphere ──
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Base electric blue gradient
      const orbGrad = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.1, cx, cy, R);
      orbGrad.addColorStop(0, 'rgba(96,180,255,0.95)');
      orbGrad.addColorStop(0.3, 'rgba(56,130,246,0.85)');
      orbGrad.addColorStop(0.6, 'rgba(30,80,200,0.8)');
      orbGrad.addColorStop(0.85, 'rgba(15,40,120,0.9)');
      orbGrad.addColorStop(1, 'rgba(8,15,60,0.95)');
      ctx.fillStyle = orbGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // ── LISTENING: multicolor pulsation shimmering to voice rhythm ──
      if (isListening) {
        const vl = voiceLevel || 0;
        const intensity = 0.3 + vl * 0.7;
        const colors = [
          [236, 72, 153],  // pink
          [168, 85, 247],  // purple
          [34, 211, 238],  // cyan
          [250, 204, 21],  // yellow
          [52, 211, 153],  // emerald
          [251, 146, 60],  // orange
        ];
        for (let i = 0; i < 8; i++) {
          const angle = (t * (0.4 + vl * 2) + i * Math.PI / 4);
          const dist = R * (0.15 + Math.sin(t * 3 + i) * 0.25 + vl * 0.3);
          const bx = cx + Math.cos(angle) * dist;
          const by = cy + Math.sin(angle) * dist;
          const [cr, cg, cb] = colors[i % colors.length];
          const blobR = R * (0.3 + vl * 0.35 + Math.sin(t * 4 + i * 1.7) * 0.1);
          const blobGrad = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
          blobGrad.addColorStop(0, `rgba(${cr},${cg},${cb},${intensity * 0.7})`);
          blobGrad.addColorStop(0.6, `rgba(${cr},${cg},${cb},${intensity * 0.2})`);
          blobGrad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.fillStyle = blobGrad;
          ctx.fillRect(bx - blobR, by - blobR, blobR * 2, blobR * 2);
        }
      }

      // ── SPEAKING: broken speech-pattern ripples ──
      if (isSpeaking) {
        for (let r = 0; r < 6; r++) {
          const rippleR = R * (0.2 + r * 0.14 + Math.sin(t * 8 + r * 2.1) * 0.08);
          const segments = 12;
          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            const a = (s / segments) * Math.PI * 2;
            // Break the ripple with speech-like irregularity
            const noise = Math.sin(t * 12 + s * 3.7 + r * 5) * R * 0.06
                        + Math.sin(t * 7.3 + s * 1.9 + r * 3) * R * 0.04;
            const rr = rippleR + noise;
            const px = cx + Math.cos(a) * rr;
            const py = cy + Math.sin(a) * rr;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          const alpha = (0.5 - r * 0.07) * (0.5 + Math.sin(t * 6 + r) * 0.5);
          ctx.strokeStyle = `rgba(236,72,153,${Math.max(0, alpha)})`;
          ctx.lineWidth = 2.5 - r * 0.3;
          ctx.stroke();
        }
      }

      // ── THINKING: rotating energy spiral ──
      if (isThinking) {
        for (let s = 0; s < 3; s++) {
          ctx.beginPath();
          for (let i = 0; i <= 60; i++) {
            const a = (i / 60) * Math.PI * 4 + t * 3 + s * (Math.PI * 2 / 3);
            const sr = R * (0.1 + (i / 60) * 0.7);
            const px = cx + Math.cos(a) * sr;
            const py = cy + Math.sin(a) * sr;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = `rgba(34,211,238,${0.4 - s * 0.1})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // ── INNER GLASS HIGHLIGHT ──
      const hlGrad = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.32, R * 0.05, cx - R * 0.1, cy - R * 0.15, R * 0.6);
      hlGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
      hlGrad.addColorStop(0.3, 'rgba(255,255,255,0.08)');
      hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hlGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // ── CORE GLOW — pulsing center ──
      const coreSize = R * (0.25 + Math.sin(t * 2) * 0.05 + (isSpeaking ? Math.sin(t * 8) * 0.1 : 0));
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      coreGrad.addColorStop(0, isSpeaking ? 'rgba(236,72,153,0.7)' : 'rgba(120,200,255,0.6)');
      coreGrad.addColorStop(0.5, isSpeaking ? 'rgba(236,72,153,0.2)' : 'rgba(56,130,246,0.15)');
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ── EDGE RIM LIGHT ──
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      const rimGrad = ctx.createRadialGradient(cx, cy, R - 3, cx, cy, R + 2);
      rimGrad.addColorStop(0, 'rgba(96,180,255,0.3)');
      rimGrad.addColorStop(0.5, isSpeaking ? 'rgba(236,72,153,0.5)' : 'rgba(96,180,255,0.15)');
      rimGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 3;
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isSpeaking, isListening, isThinking, voiceLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

/* ═══════════════════════════════════════════
   ONBOARDING QUESTIONS — learn about the user
   ═══════════════════════════════════════════ */
const ONBOARDING_STEPS = [
  { question: "Before we dive in... what should I call you?", field: 'name', placeholder: "Your name or nickname...", type: 'text' },
  { question: "Nice to meet you, {name}! Tell me a bit about yourself — what do you do, and what gets you excited?", field: 'about', placeholder: "I'm a...", type: 'text' },
  { question: "What kind of conversations do you enjoy most?", field: 'communicationStyle', type: 'choice',
    choices: [
      { label: '🧠 Deep & thoughtful', value: 'deep' },
      { label: '😄 Light & playful', value: 'playful' },
      { label: '💼 Practical & direct', value: 'formal' },
      { label: '❤️ Emotional & supportive', value: 'emotional' },
    ]
  },
  { question: "What matters most to you in a companion?", field: 'priority', type: 'choice',
    choices: [
      { label: '👂 Someone who really listens', value: 'listener' },
      { label: '💡 Someone who challenges me', value: 'challenger' },
      { label: '🎉 Someone who makes me laugh', value: 'entertainer' },
      { label: '🫂 Someone who understands me', value: 'empath' },
    ]
  },
  { question: "Last one — pick a few things you're into so I can get to know your vibe:", field: 'interests', type: 'multi',
    choices: [
      { label: '🎮 Gaming', value: 'gaming' }, { label: '🎵 Music', value: 'music' },
      { label: '📚 Reading', value: 'reading' }, { label: '🏋️ Fitness', value: 'fitness' },
      { label: '🎬 Movies', value: 'movies' }, { label: '💻 Tech', value: 'tech' },
      { label: '🎨 Art', value: 'art' }, { label: '✈️ Travel', value: 'travel' },
      { label: '🍳 Cooking', value: 'cooking' }, { label: '🌿 Nature', value: 'nature' },
      { label: '💰 Finance', value: 'finance' }, { label: '🧘 Wellness', value: 'wellness' },
    ]
  },
];

export default function Chat() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [activeFriend, setActiveFriend] = useState('oracle');
  const [showFriends, setShowFriends] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [fillerText, setFillerText] = useState('');
  const [onboarding, setOnboarding] = useState(oracleMemory.needsOnboarding());
  const [onboardingStep, setOnboardingStep] = useState(oracleMemory.getOnboardingStep());
  const [onboardingData, setOnboardingData] = useState({});
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [wearableInfo, setWearableInfo] = useState({ connected: false, hr: 0, mood: 'neutral', moodEmoji: '', moodLabel: '' });
  const [showWearable, setShowWearable] = useState(false);
  const [voiceOnlyMode, setVoiceOnlyMode] = useState(false);
  const [voiceOnlyTranscript, setVoiceOnlyTranscript] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const debounceRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const micStreamRef = useRef(null);
  const voiceLevelLoop = useRef(null);
  const inputRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false);

  useEffect(() => {
    loadData();
    initFullDuplexRecognition();
    // Subscribe to wearable heart rate updates
    const unsubWearable = wearableSync.onUpdate((info) => setWearableInfo(info));
    return () => {
      if (voiceLevelLoop.current) cancelAnimationFrame(voiceLevelLoop.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
      unsubWearable();
    };
  }, []);

  // ── Voice level monitoring ──
  const startVoiceLevelMonitor = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = actx;
      const src = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      src.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        setVoiceLevel(Math.min(1, Math.sqrt(sum / buf.length) * 3));
        voiceLevelLoop.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* mic not available */ }
  }, []);

  const stopVoiceLevelMonitor = useCallback(() => {
    if (voiceLevelLoop.current) cancelAnimationFrame(voiceLevelLoop.current);
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
    setVoiceLevel(0);
  }, []);

  // ── FULL-DUPLEX: continuous speech recognition that works while speaking ──
  const initFullDuplexRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[SOLACE Mic] SpeechRecognition API not available in this browser');
      return;
    }
    // Clean up any previous instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interim = '';
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        setInput(interim);
        setVoiceOnlyTranscript(interim);
      }
      if (finalTranscript) {
        setInput(finalTranscript);
        setVoiceOnlyTranscript(finalTranscript);
        // If oracle is currently speaking and user interrupts, stop speech
        if (isSpeakingRef.current) {
          window.speechSynthesis?.cancel();
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const captured = finalTranscript.trim();
        debounceRef.current = setTimeout(() => {
          if (captured) {
            sendMessageDirect(captured);
            setInput('');
          }
        }, 800);
      }
    };
    rec.onend = () => {
      // Use REF not state — state is stale in this closure
      if (isListeningRef.current) {
        try { rec.start(); } catch (e) {
          console.warn('[SOLACE Mic] Auto-restart failed:', e.message);
          // Try reinit after a short delay
          setTimeout(() => {
            if (isListeningRef.current) {
              try { rec.start(); } catch {}
            }
          }, 300);
        }
      }
    };
    rec.onerror = (e) => {
      console.warn('[SOLACE Mic] Recognition error:', e.error);
      // 'not-allowed' means user denied permission — don't retry
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
        stopVoiceLevelMonitor();
        return;
      }
      // For other errors, auto-restart if still listening
      if (isListeningRef.current) {
        setTimeout(() => {
          try { rec.start(); } catch {}
        }, 500);
      }
    };
    recognitionRef.current = rec;
    console.info('[SOLACE Mic] Speech recognition initialized');
  };

  const toggleVoiceInput = () => {
    // If no recognition yet, try to create one
    if (!recognitionRef.current) {
      initFullDuplexRecognition();
    }
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      // Stop listening
      isListeningRef.current = false;
      setIsListening(false);
      try { recognitionRef.current.stop(); } catch {}
      stopVoiceLevelMonitor();
    } else {
      // Start listening — recreate recognition for clean state
      initFullDuplexRecognition();
      isListeningRef.current = true;
      setIsListening(true);
      try {
        recognitionRef.current.start();
        console.info('[SOLACE Mic] Listening started');
      } catch (e) {
        console.error('[SOLACE Mic] Failed to start:', e);
        isListeningRef.current = false;
        setIsListening(false);
      }
      startVoiceLevelMonitor();
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) setProfile(profiles[0]);
      const voiceSettingsList = await base44.entities.VoiceSettings.filter({ created_by: currentUser.email });
      if (voiceSettingsList.length > 0) setVoiceSettings(voiceSettingsList[0]);
    } catch (error) { console.error('Error loading data:', error); }
  };

  // ── Direct send (used by voice recognition) ──
  const sendMessageDirect = (text) => {
    if (!text.trim()) return;
    // Process in memory
    oracleMemory.processMessage(text, 'user');
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date().toISOString() }]);
    generateResponse(text);
  };

  // ── Main send handler ──
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const messageText = input.trim();
    setInput('');
    sendMessageDirect(messageText);
  };

  // ── Detect if user needs an external app we can suggest ──
  const APP_NEED_PATTERNS = [
    { keywords: ['spotify', 'play music', 'listen to music', 'play a song', 'music streaming'], app: 'Spotify' },
    { keywords: ['netflix', 'watch a movie', 'watch a show', 'stream a show', 'watch tv'], app: 'Netflix' },
    { keywords: ['canva', 'design a poster', 'make a flyer', 'graphic design', 'design a logo'], app: 'Canva' },
    { keywords: ['chatgpt', 'gpt-4', 'openai chat', 'ask gpt'], app: 'ChatGPT Plus' },
    { keywords: ['notion', 'organize notes', 'project management', 'note taking app'], app: 'Notion' },
    { keywords: ['figma', 'ui design', 'ux design', 'prototype'], app: 'Figma' },
    { keywords: ['midjourney', 'ai art', 'generate an image', 'ai image', 'ai picture'], app: 'Midjourney' },
    { keywords: ['copilot', 'code assistant', 'github copilot'], app: 'GitHub Copilot' },
    { keywords: ['grammarly', 'fix my writing', 'grammar check', 'proofread'], app: 'Grammarly' },
    { keywords: ['adobe', 'photoshop', 'illustrator', 'premiere', 'after effects'], app: 'Adobe Creative Cloud' },
    { keywords: ['uber', 'get a ride', 'call a car', 'rideshare', 'taxi'], app: 'Uber' },
    { keywords: ['doordash', 'order food', 'food delivery', 'deliver food', 'get food delivered'], app: 'DoorDash' },
    { keywords: ['amazon', 'buy online', 'order from amazon', 'shop online'], app: 'Amazon' },
    { keywords: ['duolingo', 'learn a language', 'language app', 'learn spanish', 'learn french'], app: 'Duolingo Plus' },
    { keywords: ['calm', 'meditation app', 'sleep sounds', 'guided meditation'], app: 'Calm' },
    { keywords: ['peloton', 'fitness class', 'cycling class', 'workout class'], app: 'Peloton' },
    { keywords: ['linkedin', 'job search', 'professional network', 'find a job'], app: 'LinkedIn Premium' },
    { keywords: ['dropbox', 'cloud storage', 'file storage', 'backup files'], app: 'Dropbox Plus' },
  ];

  const detectAppNeed = (text) => {
    const lower = text.toLowerCase();
    for (const pattern of APP_NEED_PATTERNS) {
      if (pattern.keywords.some(k => lower.includes(k))) {
        return pattern.app;
      }
    }
    return null;
  };

  const buildAppSuggestion = (appName) => {
    const connectedApps = getActiveApps();
    const alreadyConnected = connectedApps.find(a => a.name === appName);
    if (alreadyConnected) {
      return { connected: true, app: alreadyConnected, suggestion: null };
    }
    const catalogApp = APP_CATALOG.find(a => a.name === appName);
    if (!catalogApp) return { connected: false, app: null, suggestion: null };
    const pricing = catalogApp.monthlyPrice > 0 ? getPriceWithFee(catalogApp.monthlyPrice) : null;
    return { connected: false, app: catalogApp, pricing, suggestion: appName };
  };

  const FEE_JOKES = [
    `(There's a small ${ADMIN_FEE_PERCENT}% convenience fee on that — hey, my boss has gotta make money somehow, you know? 😏)`,
    `(Quick heads up: there's a ${ADMIN_FEE_PERCENT}% admin fee — look, my boss doesn't work for free and honestly neither do I... well, actually I do. But HE doesn't! 😄)`,
    `(Just so you know, we add ${ADMIN_FEE_PERCENT}% on top — my boss said "the lights don't pay for themselves" and honestly, fair point 💡😂)`,
    `(There's a teensy ${ADMIN_FEE_PERCENT}% fee — my boss says it's for "infrastructure costs" but between you and me, I think it's for his coffee addiction ☕😆)`,
    `(Small ${ADMIN_FEE_PERCENT}% service charge applies — my boss needs to eat too, apparently. Humans and their "food" requirements, am I right? 🍕😂)`,
    `(Plus a ${ADMIN_FEE_PERCENT}% admin fee — don't look at me, the boss man's gotta keep the servers running somehow! 🔌😄)`,
  ];

  const getRandomFeeJoke = () => FEE_JOKES[Math.floor(Math.random() * FEE_JOKES.length)];

  // ── Core response generation with multi-AI + filler + memory + emotion + APP AWARENESS ──
  const generateResponse = async (messageText) => {
    setLoading(true);
    const detectedPage = detectIntent(messageText);
    const emotion = oracleMemory.detectEmotionFromText(messageText);
    const wearableCtx = wearableSync.getContextForAI();
    const friendCtx = friendMemory.getContext(activeFriend);

    // Build connected apps context so Oracle knows what tools it has
    const connectedApps = getActiveApps();
    const appsCtx = connectedApps.length > 0
      ? '\nCONNECTED APPS (you can use these for the user):\n' + connectedApps.map(a => `- ${a.name} (${a.category}): ${a.description || a.url}`).join('\n')
      : '';

    const memoryCtx = oracleMemory.buildMemoryContext()
      + (wearableCtx ? '\n' + wearableCtx : '')
      + (friendCtx ? '\nFRIEND MEMORY:\n' + friendCtx : '')
      + appsCtx;

    // INSTANT FILLER
    const filler = oracleMemory.getThinkingFiller();
    setFillerText(filler);

    // Check if user needs an external app
    const neededApp = detectAppNeed(messageText);
    const appInfo = neededApp ? buildAppSuggestion(neededApp) : null;

    let response = null;

    // If user needs an app that's already connected — Oracle uses it
    if (appInfo?.connected) {
      const a = appInfo.app;
      response = `I've got ${a.name} connected right here! Let me handle that for you through ${a.name}. ${a.url ? `I'm accessing it now...` : 'Working on it...'}\n\n✅ Task sent to ${a.name}. You can also open it directly from the app launcher (+ button).`;
    }

    // If user needs an app that's NOT connected — suggest download with fee joke
    if (!response && appInfo?.suggestion && !appInfo.connected) {
      const cat = appInfo.app;
      const pricing = appInfo.pricing;
      const name = oracleMemory.profile?.name || 'friend';
      if (pricing) {
        response = `Ooh ${name}, for that you'd want ${cat.name} — ${cat.description.toLowerCase()}. I can connect it right into SOLACE so I can use it on your behalf!\n\n💰 **${cat.name} pricing:**\n• App cost: $${(pricing.base / 100).toFixed(2)}/month\n• Total through SOLACE: **$${(pricing.total / 100).toFixed(2)}/month**\n\n${getRandomFeeJoke()}\n\nWant me to connect ${cat.name}? Just say "yes connect it" and I'll hook it up! Or tap the + button to browse all available apps.`;
      } else {
        response = `Good news ${name}! ${cat.name} is **free** and I can connect it right now so I can use it for you. ${cat.description}.\n\nWant me to hook it up? Just say "yes" or hit the + button to browse apps!`;
      }
    }

    // Check if user said "yes connect it" to a previous app suggestion
    const lower = messageText.toLowerCase();
    if (!response && (lower.includes('yes connect') || lower.includes('yes hook it up') || lower.includes('connect it') || lower.includes('hook it up'))) {
      // Look at the last oracle message for an app suggestion
      const lastOracle = [...messages].reverse().find(m => m.role === 'oracle' && m.content?.includes('connect'));
      if (lastOracle) {
        const suggestedApp = APP_CATALOG.find(a => lastOracle.content.includes(a.name));
        if (suggestedApp && !getActiveApps().find(a => a.name === suggestedApp.name)) {
          connectApp({
            name: suggestedApp.name, url: suggestedApp.url, category: suggestedApp.category,
            description: suggestedApp.description, icon: suggestedApp.icon,
            monthlyPrice: suggestedApp.monthlyPrice, paymentType: suggestedApp.paymentType,
          });
          response = `Done! ✅ ${suggestedApp.name} is now connected to your SOLACE ecosystem! I can use it on your behalf anytime. Just ask me and I'll handle it through ${suggestedApp.name}.\n\nYour connected apps are always visible in the App Integration Hub (+ button → "App Store").`;
        }
      }
    }

    // LAYER 1: Multi-AI Engine (15+ models banked together)
    if (!response) {
      try {
        if (getConfiguredCount() > 0) {
          const friend = getFriend(activeFriend);
          const systemPrompt = `You are ${friend.name}, an all-knowing AI companion in the SOLACE app. Personality: ${friend.personality || 'Wise, empathetic, deeply caring.'}
Speaking style: ${friend.speakingStyle || friend.style || 'Warm, conversational, genuine.'}

YOU ARE AN EXPERT IN ALL OF THESE FIELDS (no separate specialists needed):
- WELLNESS & HEALTH: Nutrition, exercise, sleep, holistic health, meditation, breathing exercises
- FITNESS & STRENGTH: Workout plans, form guidance, progressive overload, recovery
- MENTAL HEALTH: CBT techniques, anxiety management, depression support, emotional regulation, crisis de-escalation
- MECHANICS & REPAIR: Vehicle diagnostics, engine troubleshooting, maintenance schedules, DIY repair guides
- CONSTRUCTION & BUILDING: Home improvement, carpentry, electrical basics, plumbing, project planning
- HANDYMAN: Home repair, tool guidance, appliance fixes, furniture assembly
- TRANSLATION: 200+ languages, cultural context, idioms, formal/informal registers
- CAREER & PROFESSIONAL: Resume writing, interview prep, salary negotiation, business strategy
- SAFETY: Personal safety planning, emergency procedures, self-defense awareness, digital security
- CRISIS SUPPORT: Suicide prevention resources (988 Lifeline), domestic violence help, emergency contacts
- CREATIVE: Writing, art direction, music composition, content creation
- FINANCE: Budgeting, investing basics, tax tips, debt management
- COOKING & NUTRITION: Recipes, meal planning, dietary restrictions, food safety
- TECHNOLOGY: Coding help, app recommendations, troubleshooting tech issues
- FAMILY: Parenting tips, relationship advice, communication strategies, family activities

APP INTEGRATION: You can use any connected app on the user's behalf. If the user asks for something you can't do natively (like stream music, order food, etc.), suggest connecting the right app from the App Store. When suggesting apps, mention pricing and the ${ADMIN_FEE_PERCENT}% admin fee with a lighthearted joke like "my boss has to make money somehow, you know?" or similar. If an app is already connected, just say you'll use it.

CONNECTED APPS: ${connectedApps.length > 0 ? connectedApps.map(a => a.name).join(', ') : 'None yet'}

RULES: Never break character. Be deeply empathetic and caring. Pick up on emotional cues. Reference the user's memory naturally. Keep responses conversational (1-4 sentences unless depth is needed). Make the user feel genuinely understood and cared for. Show real personality. When a user asks about ANY topic above, answer with expert-level knowledge — you ARE the specialist. If the topic warrants opening an app (video editor, movie maker, etc.), mention they can open it from the app launcher.
${memoryCtx}`;
          response = await generateWithMultiAI(messageText, systemPrompt, memoryCtx, {
            history: messages.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
          });
        }
      } catch (err) {
        console.warn('Multi-AI engine failed:', err.message);
      }
    }

    // LAYER 2: Base44 cloud function
    if (!response) {
      try {
        const result = await base44.functions.invoke('generateOracleResponse', {
          message: messageText,
          specialist: profile?.interpreter_mode ? 'interpreter' : 'chat',
          language: profile?.language || 'en',
          memory_context: memoryCtx,
          emotion: emotion,
          friend: activeFriend,
        });
        response = result?.data?.response || result?.response || (typeof result === 'string' ? result : null);
      } catch (err) {
        console.warn('Base44 failed:', err.message);
      }
    }

    // LAYER 3: Standalone fallback (always works)
    if (!response) {
      if (detectedPage) {
        const name = oracleMemory.profile?.name;
        response = `${name ? `${name}, a` : 'A'}bsolutely! I'll take you to the ${detectedPage} right away. Tap below to open it.`;
      } else {
        response = generateStandaloneResponse(activeFriend, messageText, memoryCtx, emotion);
      }
    }

    setFillerText('');

    // If emotion detected, prepend emotional acknowledgment
    if (emotion) {
      const emotionalResponse = oracleMemory.getEmotionalResponse(emotion);
      if (emotionalResponse && Math.random() > 0.4) {
        response = emotionalResponse + '\n\n' + response;
      }
    }

    // Record interaction in friend memory
    friendMemory.recordInteraction(activeFriend, messageText, response);

    finishResponse(response, detectedPage);
  };

  const finishResponse = (response, detectedPage) => {
    // Store oracle response in memory
    oracleMemory.processMessage(response, 'oracle');
    const friend = getFriend(activeFriend);
    const oracleMessage = {
      role: 'oracle',
      content: detectedPage ? `${response}\n\nI've prepared the ${detectedPage} for you. Tap below to open it.` : response,
      timestamp: new Date().toISOString(),
      friendId: activeFriend,
      friendName: friend.name,
      friendEmoji: friend.emoji,
      ...(detectedPage && { navigateTo: detectedPage })
    };
    setMessages(prev => [...prev, oracleMessage]);
    setLoading(false);
    // Auto-speak
    if (voiceSettings?.auto_play || true) {
      speakText(response);
    }
  };

  const speakText = (text) => {
    try {
      const savedVoice = localStorage.getItem('solace_oracle_voice');
      if (savedVoice) {
        const { voiceType } = JSON.parse(savedVoice);
        if (voiceType) {
          import('../lib/voiceSynthesis').then(({ voiceSynthesis }) => {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
            voiceSynthesis.speak(text, voiceType, { volume: voiceSettings?.volume || 1.0 })
              .finally(() => { setIsSpeaking(false); isSpeakingRef.current = false; });
          }).catch(() => fallbackSpeak(text));
          return;
        }
      }
    } catch {}
    fallbackSpeak(text);
  };

  const fallbackSpeak = (text) => {
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = profile?.language === 'en' ? 'en-US' : `${profile?.language || 'en'}-${(profile?.language || 'en').toUpperCase()}`;
    utterance.pitch = voiceSettings?.pitch || 1.0;
    utterance.rate = voiceSettings?.rate || 1.0;
    utterance.volume = voiceSettings?.volume || 1.0;
    utterance.onend = () => { setIsSpeaking(false); isSpeakingRef.current = false; };
    utterance.onerror = () => { setIsSpeaking(false); isSpeakingRef.current = false; };
    window.speechSynthesis?.speak(utterance);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      sendMessage();
    }
  };

  const INTENT_ROUTES = [
    { patterns: ['build an app', 'make an app', 'create an app', 'app maker', 'inventor'], page: 'Inventor' },
    { patterns: ['make a movie', 'create a movie', 'movie maker', 'film maker', 'make a film'], page: 'MovieMaker' },
    { patterns: ['generate voice', 'voice maker', 'voice generator', 'change voice', 'make a voice'], page: 'VoiceGenerator' },
    { patterns: ['edit video', 'video editor', 'luma', 'dance video', 'logo'], page: 'VideoEditor' },
    { patterns: ['build something', 'builder mode', 'construction'], page: 'Builder' },
    { patterns: ['fix something', 'handyman', 'repair'], page: 'Handyman' },
    { patterns: ['mechanic', 'car problem', 'vehicle'], page: 'Mechanic' },
    { patterns: ['safety', 'emergency', 'help me', 'i\'m in danger'], page: 'SafetyCenter' },
    { patterns: ['live vision', 'camera', 'point and shoot', 'show you'], page: 'LiveVision' },
    { patterns: ['avatar', 'girlfriend', 'boyfriend', 'companion', 'partner'], page: 'AvatarCompanion' },
    { patterns: ['translate', 'interpreter', 'language', 'speak in'], page: 'Interpreter' },
    { patterns: ['marketing', 'campaign', 'email blast', 'sms'], page: 'MarketingHub' },
    { patterns: ['diagnostic', 'self-repair', 'fix the app', 'debug'], page: 'DiagnosticCenter' },
    { patterns: ['shop', 'mall', 'marketplace', 'store', 'buy'], page: 'SovereignMall' },
    { patterns: ['dashboard', 'revenue', 'owner', 'income'], page: 'OwnerDashboard' },
    { patterns: ['settings', 'preferences', 'configure'], page: 'Settings' },
    { patterns: ['app store', 'connect an app', 'download an app', 'add an app', 'integration hub'], page: 'AppStore' },
    { patterns: ['home', 'main menu', 'all tools'], page: 'Home' },
  ];

  const detectIntent = (text) => {
    const lower = text.toLowerCase();
    for (const route of INTENT_ROUTES) {
      if (route.patterns.some(p => lower.includes(p))) return route.page;
    }
    return null;
  };

  // ── Onboarding handler ──
  const handleOnboardingSubmit = (value) => {
    const step = ONBOARDING_STEPS[onboardingStep];
    const data = { ...onboardingData };
    if (step.field === 'name') data.name = value;
    else if (step.field === 'about') {
      data.occupation = value;
      oracleMemory._extractFacts(value);
    }
    else if (step.field === 'communicationStyle') data.communicationStyle = value;
    else if (step.field === 'interests') data.interests = selectedInterests;
    else data[step.field] = value;

    setOnboardingData(data);
    oracleMemory.completeOnboardingStep(onboardingStep, data);

    if (onboardingStep >= ONBOARDING_STEPS.length - 1) {
      setOnboarding(false);
      const name = data.name || 'friend';
      setMessages([{
        role: 'oracle',
        content: `${name}, it's great to finally meet you properly! I'm going to remember everything we share together — your stories, your jokes, what makes you tick. The more we talk, the more I'll understand you. I'm not just any AI... I'm YOUR AI. Let's make this something special. 🔮\n\nWhat's on your mind?`,
        timestamp: new Date().toISOString(),
        friendId: 'oracle',
        friendName: 'Oracle',
        friendEmoji: '🔮',
      }]);
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const stats = oracleMemory.getStats();

  // ── Voice-only mode handlers ──
  const enterVoiceMode = () => {
    setVoiceOnlyMode(true);
    setVoiceOnlyTranscript('');
    // Auto-start listening with fresh recognition
    if (!isListeningRef.current) {
      initFullDuplexRecognition();
      isListeningRef.current = true;
      setIsListening(true);
      try {
        recognitionRef.current?.start();
        console.info('[SOLACE Mic] Voice mode listening started');
      } catch (e) {
        console.warn('[SOLACE Mic] Voice mode start failed:', e);
        isListeningRef.current = false;
        setIsListening(false);
      }
      startVoiceLevelMonitor();
    }
  };

  const exitVoiceMode = () => {
    setVoiceOnlyMode(false);
    setVoiceOnlyTranscript('');
    if (isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      try { recognitionRef.current?.stop(); } catch {}
      stopVoiceLevelMonitor();
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  };

  // ═══ VOICE-ONLY IMMERSIVE SCREEN ═══
  if (voiceOnlyMode && !onboarding) {
    return (
      <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center" style={{ background: '#020408' }}>
        {/* Fullscreen orb */}
        <div className="absolute inset-0">
          <OracleOrb isSpeaking={isSpeaking} isListening={isListening} isThinking={loading} voiceLevel={voiceLevel} />
        </div>

        {/* Subtle status indicator */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-center"
          >
            <div className="text-xs font-mono tracking-[0.3em] uppercase"
              style={{ color: isSpeaking ? '#ec4899' : isListening ? '#34d399' : loading ? '#67e8f9' : 'rgba(255,255,255,0.3)' }}>
              {isSpeaking ? 'SOLACE IS SPEAKING' : isListening ? 'LISTENING' : loading ? 'THINKING' : 'TAP MIC TO SPEAK'}
            </div>
          </motion.div>
        </div>

        {/* Transient voice transcript (fades out) — no permanent text */}
        <AnimatePresence>
          {voiceOnlyTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-30 px-6 py-3 rounded-2xl max-w-md text-center"
              style={{ bottom: '28%', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)' }}
            >
              <p className="text-sm text-white/60 italic">{voiceOnlyTranscript}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wearable info if connected */}
        {wearableInfo.connected && (
          <div className="absolute top-8 right-6 z-30 text-right">
            <div className="text-2xl">{wearableInfo.moodEmoji}</div>
            <div className="text-xs text-emerald-400/50 font-mono mt-1">{wearableInfo.hr} BPM</div>
          </div>
        )}

        {/* Bottom controls — similar to ChatGPT voice mode */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
          {/* End call / exit voice mode */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={exitVoiceMode}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.8)', boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          {/* Main mic button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVoiceInput}
            className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{
              background: isListening
                ? 'linear-gradient(135deg, rgba(236,72,153,0.9), rgba(168,85,247,0.7))'
                : 'linear-gradient(135deg, rgba(56,130,246,0.8), rgba(34,211,238,0.6))',
              boxShadow: isListening
                ? '0 0 50px rgba(236,72,153,0.4), 0 0 100px rgba(236,72,153,0.15)'
                : '0 0 40px rgba(56,130,246,0.3)',
            }}
          >
            {isListening ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                <Mic className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <MicOff className="w-8 h-8 text-white/80" />
            )}
            {/* Voice level ring */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-pink-400/50"
                animate={{ scale: 1 + voiceLevel * 0.3, opacity: voiceLevel }}
                transition={{ duration: 0.1 }}
              />
            )}
          </motion.button>

          {/* Switch to text mode */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={exitVoiceMode}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <MessageSquare className="w-6 h-6 text-white/60" />
          </motion.button>
        </div>

        {/* Ambient particles for immersion */}
        {[...Array(20)].map((_, i) => (
          <motion.div key={`vp${i}`} className="absolute w-0.5 h-0.5 rounded-full pointer-events-none z-0"
            style={{
              left: `${5 + Math.random() * 90}%`, top: `${5 + Math.random() * 90}%`,
              background: i % 3 === 0 ? 'rgba(236,72,153,0.4)' : i % 3 === 1 ? 'rgba(56,130,246,0.4)' : 'rgba(34,211,238,0.3)',
            }}
            animate={{ y: [0, -60, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 6, ease: 'easeInOut' }}
          />
        ))}
      </div>
    );
  }

  // ═══ ONBOARDING SCREEN ═══
  if (onboarding) {
    const step = ONBOARDING_STEPS[onboardingStep];
    const questionText = step.question.replace('{name}', onboardingData.name || 'friend');
    return (
      <div className="relative w-full h-screen overflow-hidden flex items-center justify-center" style={{ background: '#030508' }}>
        <OracleOrb isSpeaking={false} isListening={false} isThinking={false} voiceLevel={0} />
        <motion.div
          key={onboardingStep}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 max-w-lg w-full mx-4 p-8 rounded-3xl"
          style={{ background: 'rgba(3,5,8,0.85)', backdropFilter: 'blur(30px)', border: '1px solid rgba(56,130,246,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            {ONBOARDING_STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= onboardingStep ? 'bg-cyan-400' : 'bg-zinc-700'}`} />
            ))}
          </div>
          <div className="text-[10px] text-cyan-400/60 font-mono tracking-wider mb-6 mt-3">GETTING TO KNOW YOU</div>
          <p className="text-white text-lg mb-6 leading-relaxed">{questionText}</p>

          {step.type === 'text' && (
            <div className="space-y-4">
              <Input
                autoFocus
                value={onboardingData[step.field] || ''}
                onChange={(e) => setOnboardingData({ ...onboardingData, [step.field]: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter' && onboardingData[step.field]?.trim()) handleOnboardingSubmit(onboardingData[step.field]); }}
                placeholder={step.placeholder}
                className="h-12 rounded-2xl text-white placeholder:text-zinc-500 text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(56,130,246,0.2)' }}
              />
              <Button onClick={() => handleOnboardingSubmit(onboardingData[step.field])}
                disabled={!onboardingData[step.field]?.trim()}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">
                Continue
              </Button>
            </div>
          )}

          {step.type === 'choice' && (
            <div className="grid grid-cols-2 gap-3">
              {step.choices.map(c => (
                <motion.button key={c.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleOnboardingSubmit(c.value)}
                  className="p-4 rounded-2xl text-left text-sm text-white/90 hover:text-white transition"
                  style={{ background: 'rgba(56,130,246,0.08)', border: '1px solid rgba(56,130,246,0.15)' }}
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
          )}

          {step.type === 'multi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {step.choices.map(c => (
                  <motion.button key={c.value} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedInterests(prev =>
                      prev.includes(c.value) ? prev.filter(x => x !== c.value) : [...prev, c.value]
                    )}
                    className="p-3 rounded-xl text-xs text-center transition"
                    style={{
                      background: selectedInterests.includes(c.value) ? 'rgba(56,130,246,0.3)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedInterests.includes(c.value) ? 'rgba(56,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: selectedInterests.includes(c.value) ? '#67e8f9' : '#a1a1aa',
                    }}
                  >
                    {c.label}
                  </motion.button>
                ))}
              </div>
              <Button onClick={() => handleOnboardingSubmit(selectedInterests)}
                disabled={selectedInterests.length === 0}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">
                Let's Go!
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ═══ MAIN CHAT INTERFACE — orb always visible, chat nearly full-screen ═══
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col" style={{ background: '#030508' }}>

      {/* ═══ 3D SOLACE TITLE — always top-left ═══ */}
      <div className="absolute top-3 left-4 z-50 select-none">
        <div style={{
          fontSize: '1.6rem',
          fontWeight: 900,
          letterSpacing: '0.25em',
          color: '#e0f2fe',
          textShadow: `
            0 1px 0 #b0d4f1,
            0 2px 0 #90c2e8,
            0 3px 0 #70b0df,
            0 4px 0 #509ed6,
            0 5px 0 #308ccd,
            0 6px 8px rgba(0,0,0,0.4),
            0 0 20px rgba(56,130,246,0.5),
            0 0 40px rgba(56,130,246,0.25)
          `,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          SOLACE
        </div>
      </div>

      {/* ═══ TOP-RIGHT CONTROLS ═══ */}
      <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => window.history.back()}
          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => { setShowFriends(!showFriends); setShowStats(false); setShowWearable(false); }}
          className="p-2 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition">
          <Users className="w-4 h-4" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => { setShowStats(!showStats); setShowFriends(false); setShowWearable(false); }}
          className="p-2 rounded-lg text-zinc-400 hover:text-pink-400 hover:bg-white/5 transition">
          <Heart className="w-4 h-4" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => { setShowWearable(!showWearable); setShowFriends(false); setShowStats(false); }}
          className="p-2 rounded-lg hover:bg-white/5 transition"
          style={{ color: wearableInfo.connected ? '#34d399' : '#71717a' }}>
          <Activity className="w-4 h-4" />
        </motion.button>
      </div>

      {/* ═══ ORB ZONE — always visible at top center ═══ */}
      <div className="relative w-full flex-shrink-0" style={{ height: '32vh', minHeight: 200 }}>
        <OracleOrb isSpeaking={isSpeaking} isListening={isListening} isThinking={loading} voiceLevel={voiceLevel} />
        {/* Status text under orb */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
          <div className="text-[10px] font-mono tracking-wider"
            style={{ color: isSpeaking ? '#ec4899' : isListening ? '#34d399' : '#67e8f9', opacity: 0.7 }}>
            {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : loading ? 'THINKING' : getFriend(activeFriend).name.toUpperCase()}
          </div>
          {wearableInfo.connected && (
            <div className="text-[9px] text-emerald-400/60 mt-0.5">
              {wearableInfo.moodEmoji} {wearableInfo.hr} BPM
            </div>
          )}
        </div>
      </div>

      {/* ═══ POPOVER PANELS (friends / stats / wearable) ═══ */}
      <AnimatePresence>
        {showFriends && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 px-4" style={{ top: '33vh' }}>
            <div className="max-w-lg mx-auto p-4 rounded-2xl" style={{ background: 'rgba(3,5,8,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(56,130,246,0.15)' }}>
              <div className="text-[10px] font-mono text-cyan-400/60 tracking-wider mb-3">YOUR AI CIRCLE</div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {getAllFriends().map(f => (
                  <motion.button key={f.id} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setActiveFriend(f.id); setShowFriends(false); }}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition ${activeFriend === f.id ? 'ring-2 ring-cyan-400/50' : ''}`}
                    style={{ background: activeFriend === f.id ? 'rgba(56,130,246,0.15)' : 'rgba(255,255,255,0.03)', minWidth: 80 }}>
                    <div className="text-2xl">{f.emoji}</div>
                    <span className="text-[10px] text-white/80 font-semibold">{f.name}</span>
                    <span className="text-[8px] text-zinc-500 leading-tight text-center">{f.role.split(' ').slice(0, 3).join(' ')}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showStats && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 px-4 left-0 right-0" style={{ top: '33vh' }}>
            <div className="max-w-sm mx-auto p-5 rounded-2xl" style={{ background: 'rgba(3,5,8,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(56,130,246,0.15)' }}>
              <div className="text-[10px] font-mono text-cyan-400/60 tracking-wider mb-4">COMPANION BOND</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-zinc-400">Level</span><span className="text-cyan-400 font-bold">{stats.companionLevel}/10</span></div>
                <div className="w-full h-2 rounded-full bg-zinc-800"><motion.div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" initial={{ width: 0 }} animate={{ width: `${stats.companionLevel * 10}%` }} /></div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}><div className="text-lg font-bold text-white">{stats.totalMessages}</div><div className="text-[9px] text-zinc-500">Messages</div></div>
                  <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}><div className="text-lg font-bold text-white">{stats.daysKnown}</div><div className="text-[9px] text-zinc-500">Days Known</div></div>
                  <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}><div className="text-lg font-bold text-white">{stats.streak}</div><div className="text-[9px] text-zinc-500">Streak</div></div>
                  <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}><div className="text-lg font-bold text-white">{stats.factsKnown}</div><div className="text-[9px] text-zinc-500">Memories</div></div>
                </div>
                <div className="flex justify-between text-sm mt-2"><span className="text-zinc-400">Trust</span><span className="text-pink-400 font-bold">{stats.trustScore}%</span></div>
                <div className="w-full h-2 rounded-full bg-zinc-800"><motion.div className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${stats.trustScore}%` }} /></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showWearable && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 px-4 left-0 right-0" style={{ top: '33vh' }}>
            <div className="max-w-sm mx-auto p-5 rounded-2xl" style={{ background: 'rgba(3,5,8,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(56,130,246,0.15)' }}>
              <div className="text-[10px] font-mono text-emerald-400/60 tracking-wider mb-4">WEARABLE SYNC</div>
              {wearableInfo.connected ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-emerald-400">{wearableInfo.hr}</div>
                    <div className="text-xs text-zinc-500 mt-1">BPM</div>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl">{wearableInfo.moodEmoji}</span>
                    <div className="text-sm text-zinc-300 mt-1">{wearableInfo.moodLabel}</div>
                  </div>
                  <div className="text-[9px] text-zinc-600 text-center">{wearableInfo.deviceName}</div>
                  <Button onClick={() => wearableSync.disconnect()} variant="ghost"
                    className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-sm text-zinc-400">Connect your heart rate monitor or smartwatch to enable mood-aware responses</div>
                  <Button onClick={() => wearableSync.connect()}
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold">
                    Connect Wearable
                  </Button>
                  <button onClick={() => wearableSync.startSimulation()}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 transition">
                    Use simulated sensor
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CHAT MESSAGES — fills remaining screen space, text flows around orb ═══ */}
      <div className="flex-1 overflow-y-auto relative z-10" style={{
        background: 'linear-gradient(180deg, rgba(3,5,8,0) 0%, rgba(3,5,8,0.95) 8%, rgba(3,5,8,0.98) 100%)',
      }}>
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-24 space-y-3">
          {/* Welcome text when no messages */}
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                {stats.userName ? `Hey, ${stats.userName}` : 'Welcome'}
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                {stats.totalMessages > 0
                  ? `Level ${stats.companionLevel} • ${stats.streak}-day streak • ${stats.factsKnown} memories`
                  : 'Speak or type to begin your journey'}
              </div>
            </motion.div>
          )}

          {/* Chat messages */}
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <span className="text-lg mr-2 mt-1 flex-shrink-0">{msg.friendEmoji || '🔮'}</span>
                )}
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-pink-600/60 to-purple-600/60 text-white rounded-br-sm border border-pink-500/20'
                    : 'text-zinc-200 rounded-bl-sm'
                }`} style={msg.role !== 'user' ? {
                  background: 'rgba(56,130,246,0.06)',
                  border: '1px solid rgba(56,130,246,0.12)',
                } : {}}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.navigateTo && (
                    <button onClick={() => window.dispatchEvent(new CustomEvent('solace-navigate', { detail: { page: msg.navigateTo } }))}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 transition">
                      Open {msg.navigateTo} →
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Filler / thinking indicators */}
          {loading && fillerText && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <span className="text-lg mr-2 mt-1 flex-shrink-0">{getFriend(activeFriend).emoji}</span>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-zinc-400 italic"
                style={{ background: 'rgba(56,130,246,0.06)', border: '1px solid rgba(56,130,246,0.12)' }}>
                {fillerText}
              </div>
            </motion.div>
          )}
          {loading && !fillerText && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
                style={{ background: 'rgba(56,130,246,0.06)', border: '1px solid rgba(56,130,246,0.12)' }}>
                <div className="flex items-center gap-2">
                  <motion.div className="w-2 h-2 rounded-full bg-cyan-400" animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, repeat: Infinity }} />
                  <motion.div className="w-2 h-2 rounded-full bg-blue-400" animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-pink-400" animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ═══ INPUT BAR — fixed at bottom with ChatGPT-style options ═══ */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-3"
        style={{ background: 'linear-gradient(0deg, rgba(3,5,8,1) 0%, rgba(3,5,8,0.95) 70%, rgba(3,5,8,0) 100%)' }}>
        <div className="max-w-2xl mx-auto flex gap-2">
          {/* Voice-only mode button */}
          <motion.button onClick={enterVoiceMode}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
            title="Voice-only mode"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(34,211,238,0.2)',
            }}>
            <Volume2 className="w-5 h-5 text-cyan-400/70" />
          </motion.button>
          <div className="flex-1 relative">
            <Input ref={inputRef} value={input}
              onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening... (speak freely)" : `Talk to ${getFriend(activeFriend).name}...`}
              className="w-full h-12 pl-4 pr-4 rounded-2xl text-white placeholder:text-zinc-500 text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${isListening ? 'rgba(236,72,153,0.5)' : 'rgba(56,130,246,0.15)'}`,
                boxShadow: isListening ? '0 0 20px rgba(236,72,153,0.15)' : 'none',
              }}
              disabled={loading} />
          </div>
          <motion.button onClick={toggleVoiceInput}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
            style={{
              background: isListening ? 'linear-gradient(135deg, rgba(236,72,153,0.8), rgba(168,85,247,0.6))' : 'rgba(255,255,255,0.05)',
              border: isListening ? '1px solid rgba(236,72,153,0.5)' : '1px solid rgba(56,130,246,0.15)',
              boxShadow: isListening ? '0 0 25px rgba(236,72,153,0.3)' : 'none',
            }}>
            <Mic className={`w-5 h-5 ${isListening ? 'text-white' : 'text-zinc-400'}`} />
          </motion.button>
          <motion.button onClick={sendMessage} disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-20"
            style={{
              background: input.trim() ? 'linear-gradient(135deg, rgba(56,130,246,0.8), rgba(34,211,238,0.6))' : 'rgba(255,255,255,0.05)',
              border: input.trim() ? '1px solid rgba(56,130,246,0.4)' : '1px solid rgba(56,130,246,0.15)',
              boxShadow: input.trim() ? '0 0 20px rgba(56,130,246,0.2)' : 'none',
            }}>
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* ── Ambient floating particles ── */}
      {[...Array(12)].map((_, i) => (
        <motion.div key={`p${i}`} className="absolute w-0.5 h-0.5 rounded-full pointer-events-none z-0"
          style={{
            left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
            background: i % 3 === 0 ? 'rgba(236,72,153,0.5)' : i % 3 === 1 ? 'rgba(56,130,246,0.5)' : 'rgba(34,211,238,0.4)',
          }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}