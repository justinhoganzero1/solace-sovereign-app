import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { voiceManager } from '../components/voice/WebSpeechVoiceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Mic, MessageSquare, ChevronDown, Users, Heart, BarChart3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { oracleMemory } from '../lib/oracleMemory';
import { AI_FRIENDS, generateStandaloneResponse, getFriend, getAllFriends } from '../lib/aiFriends';

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
  const [chatExpanded, setChatExpanded] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [activeFriend, setActiveFriend] = useState('oracle');
  const [showFriends, setShowFriends] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [fillerText, setFillerText] = useState('');
  const [onboarding, setOnboarding] = useState(oracleMemory.needsOnboarding());
  const [onboardingStep, setOnboardingStep] = useState(oracleMemory.getOnboardingStep());
  const [onboardingData, setOnboardingData] = useState({});
  const [selectedInterests, setSelectedInterests] = useState([]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const debounceRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const micStreamRef = useRef(null);
  const voiceLevelLoop = useRef(null);
  const inputRef = useRef(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    loadData();
    initFullDuplexRecognition();
    return () => {
      if (voiceLevelLoop.current) cancelAnimationFrame(voiceLevelLoop.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
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
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) setInput(interim);
      if (final) {
        setInput(final);
        // If oracle is currently speaking and user interrupts, stop speech
        if (isSpeakingRef.current) {
          window.speechSynthesis?.cancel();
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (final.trim()) {
            setInput(prev => {
              if (prev.trim()) sendMessageDirect(prev.trim());
              return '';
            });
          }
        }, 800);
      }
    };
    rec.onend = () => {
      // Auto-restart for continuous listening (full duplex)
      if (isListening) {
        try { rec.start(); } catch {}
      }
    };
    rec.onerror = () => {
      // Restart on error for resilience
      if (isListening) {
        setTimeout(() => { try { rec.start(); } catch {} }, 500);
      }
    };
    recognitionRef.current = rec;
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopVoiceLevelMonitor();
    } else {
      try { recognitionRef.current.start(); } catch {}
      setIsListening(true);
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
    if (!chatExpanded) setChatExpanded(true);
    generateResponse(text);
  };

  // ── Main send handler ──
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const messageText = input.trim();
    setInput('');
    sendMessageDirect(messageText);
  };

  // ── Core response generation with filler + memory + emotion ──
  const generateResponse = async (messageText) => {
    setLoading(true);
    const detectedPage = detectIntent(messageText);
    const emotion = oracleMemory.detectEmotionFromText(messageText);
    const memoryCtx = oracleMemory.buildMemoryContext();

    // INSTANT FILLER — show within 200ms so user never waits in silence
    const filler = oracleMemory.getThinkingFiller();
    setFillerText(filler);

    try {
      const result = await base44.functions.invoke('generateOracleResponse', {
        message: messageText,
        specialist: profile?.interpreter_mode ? 'interpreter' : 'chat',
        language: profile?.language || 'en',
        memory_context: memoryCtx,
        emotion: emotion,
        friend: activeFriend,
      });
      setFillerText('');
      let response = result?.data?.response || result?.response || (typeof result === 'string' ? result : null);
      if (!response) {
        response = generateStandaloneResponse(activeFriend, messageText, memoryCtx, emotion);
      }
      // If emotion detected, prepend emotional acknowledgment
      if (emotion) {
        const emotionalResponse = oracleMemory.getEmotionalResponse(emotion);
        if (emotionalResponse && Math.random() > 0.4) {
          response = emotionalResponse + '\n\n' + response;
        }
      }
      finishResponse(response, detectedPage);
    } catch (error) {
      console.error('Response error:', error);
      setFillerText('');
      // Use standalone fallback with memory + emotion awareness
      let fallbackResponse;
      if (detectedPage) {
        const name = oracleMemory.profile.name;
        fallbackResponse = `${name ? `${name}, a` : 'A'}bsolutely! I'll take you to the ${detectedPage} right away. Tap below to open it.`;
      } else {
        fallbackResponse = generateStandaloneResponse(activeFriend, messageText, memoryCtx, emotion);
      }
      finishResponse(fallbackResponse, detectedPage);
    }
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
    { patterns: ['edit video', 'video editor', 'luma'], page: 'VideoEditor' },
    { patterns: ['build something', 'builder mode', 'construction'], page: 'Builder' },
    { patterns: ['fix something', 'handyman', 'repair'], page: 'Handyman' },
    { patterns: ['mechanic', 'car problem', 'vehicle'], page: 'Mechanic' },
    { patterns: ['safety', 'emergency', 'help me', 'i\'m in danger'], page: 'SafetyCenter' },
    { patterns: ['live vision', 'camera', 'point and shoot', 'show you'], page: 'LiveVision' },
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
      setChatExpanded(true);
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const stats = oracleMemory.getStats();

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

  // ═══ MAIN CHAT INTERFACE ═══
  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#030508' }}>
      <OracleOrb isSpeaking={isSpeaking} isListening={isListening} isThinking={loading} voiceLevel={voiceLevel} />

      {/* ── ORACLE label + companion stats when idle ── */}
      <AnimatePresence>
        {!chatExpanded && messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none" style={{ bottom: '28%' }}>
            <div className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
              style={{ textShadow: '0 0 30px rgba(56,130,246,0.3)' }}>
              {stats.userName ? `Hey, ${stats.userName}` : 'ORACLE'}
            </div>
            <div className="text-sm text-zinc-500 mt-2 font-light tracking-wide">
              {stats.totalMessages > 0
                ? `Companion Level ${stats.companionLevel} • ${stats.streak}-day streak • ${stats.factsKnown} memories`
                : 'Speak or type to begin'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ambient floating particles ── */}
      {[...Array(20)].map((_, i) => (
        <motion.div key={i} className="absolute w-0.5 h-0.5 rounded-full pointer-events-none"
          style={{
            left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
            background: i % 3 === 0 ? 'rgba(236,72,153,0.6)' : i % 3 === 1 ? 'rgba(56,130,246,0.6)' : 'rgba(34,211,238,0.5)',
          }}
          animate={{ y: [0, -60, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: 'easeInOut' }}
        />
      ))}

      {/* ═══ TOP BAR ═══ */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(3,5,8,0.85) 0%, rgba(3,5,8,0) 100%)' }}>
        <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span className="text-xs">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowFriends(!showFriends)}
            className="p-2 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition">
            <Users className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition">
            <Heart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* ═══ AI FRIENDS CIRCLE ═══ */}
      <AnimatePresence>
        {showFriends && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-0 right-0 z-30 px-4">
            <div className="max-w-lg mx-auto p-4 rounded-2xl" style={{ background: 'rgba(3,5,8,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(56,130,246,0.15)' }}>
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

      {/* ═══ COMPANION STATS ═══ */}
      <AnimatePresence>
        {showStats && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-0 right-0 z-30 px-4">
            <div className="max-w-sm mx-auto p-5 rounded-2xl" style={{ background: 'rgba(3,5,8,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(56,130,246,0.15)' }}>
              <div className="text-[10px] font-mono text-cyan-400/60 tracking-wider mb-4">COMPANION BOND</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Level</span>
                  <span className="text-cyan-400 font-bold">{stats.companionLevel}/10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800">
                  <motion.div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }} animate={{ width: `${stats.companionLevel * 10}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-xl bg-white/3 text-center">
                    <div className="text-lg font-bold text-white">{stats.totalMessages}</div>
                    <div className="text-[9px] text-zinc-500">Messages</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/3 text-center">
                    <div className="text-lg font-bold text-white">{stats.daysKnown}</div>
                    <div className="text-[9px] text-zinc-500">Days Known</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/3 text-center">
                    <div className="text-lg font-bold text-white">{stats.streak}🔥</div>
                    <div className="text-[9px] text-zinc-500">Streak</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/3 text-center">
                    <div className="text-lg font-bold text-white">{stats.factsKnown}</div>
                    <div className="text-[9px] text-zinc-500">Memories</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-zinc-400">Trust</span>
                  <span className="text-pink-400 font-bold">{stats.trustScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800">
                  <motion.div className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                    initial={{ width: 0 }} animate={{ width: `${stats.trustScore}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CHAT OVERLAY — minimizable full-screen panel ═══ */}
      <AnimatePresence>
        {chatExpanded && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-20 flex flex-col"
            style={{ background: 'rgba(3,5,8,0.85)', backdropFilter: 'blur(20px)' }}>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getFriend(activeFriend).emoji}</span>
                <div>
                  <div className="text-xs font-semibold text-white">{getFriend(activeFriend).name}</div>
                  <div className="text-[9px] text-cyan-400/60">{isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Online'}</div>
                </div>
              </div>
              <button onClick={() => setChatExpanded(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto space-y-3">
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role !== 'user' && (
                        <span className="text-lg mr-2 mt-1">{msg.friendEmoji || '🔮'}</span>
                      )}
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-pink-600/60 to-purple-600/60 text-white rounded-br-sm border border-pink-500/20'
                          : 'bg-cyan-500/8 text-zinc-200 border border-cyan-500/15 rounded-bl-sm'
                      }`}>
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

                {/* Filler text while thinking */}
                {loading && fillerText && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <span className="text-lg mr-2 mt-1">{getFriend(activeFriend).emoji}</span>
                    <div className="px-4 py-3 rounded-2xl bg-cyan-500/8 border border-cyan-500/15 rounded-bl-sm text-sm text-zinc-400 italic">
                      {fillerText}
                    </div>
                  </motion.div>
                )}
                {loading && !fillerText && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl bg-cyan-500/8 border border-cyan-500/15 rounded-bl-sm">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MINIMIZED CHAT BUBBLE ═══ */}
      {!chatExpanded && messages.length > 0 && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setChatExpanded(true)}
          className="absolute top-16 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(56,130,246,0.2)', border: '1px solid rgba(56,130,246,0.3)', boxShadow: '0 0 20px rgba(56,130,246,0.2)' }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
            {messages.length}
          </div>
        </motion.button>
      )}

      {/* ═══ INPUT BAR — always at bottom ═══ */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4"
        style={{ background: 'linear-gradient(0deg, rgba(3,5,8,0.9) 0%, rgba(3,5,8,0.7) 60%, rgba(3,5,8,0) 100%)' }}>
        <div className="max-w-2xl mx-auto flex gap-2">
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
    </div>
  );
}