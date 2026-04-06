import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Heart, Sparkles, Palette, Home as HomeIcon,
  Send, Smile, User, Crown, Star, Music, Lamp, Sofa,
  Sun, Moon, Camera, Download, RotateCcw, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   AVATAR COMPANION — Girlfriend/Boyfriend Generator
   Animated avatar with customizable room, personality, and chat
   ═══════════════════════════════════════════════════════════ */

const AVATAR_STYLES = [
  { id: 'anime', label: 'Anime', emoji: '🎌' },
  { id: 'realistic', label: 'Realistic', emoji: '📸' },
  { id: 'cartoon', label: 'Cartoon', emoji: '🎨' },
  { id: 'chibi', label: 'Chibi', emoji: '🥺' },
  { id: 'pixel', label: 'Pixel Art', emoji: '👾' },
];

const GENDERS = [
  { id: 'girlfriend', label: 'Girlfriend', emoji: '👩', color: '#ec4899' },
  { id: 'boyfriend', label: 'Boyfriend', emoji: '👨', color: '#3b82f6' },
  { id: 'nonbinary', label: 'Partner', emoji: '🧑', color: '#a855f7' },
];

const PERSONALITIES = [
  { id: 'sweet', label: 'Sweet & Caring', emoji: '💕', traits: 'Gentle, nurturing, always asks how you feel' },
  { id: 'playful', label: 'Playful & Fun', emoji: '😜', traits: 'Teasing, jokes, keeps things light' },
  { id: 'intellectual', label: 'Intellectual', emoji: '🧠', traits: 'Deep conversations, philosophy, debates' },
  { id: 'adventurous', label: 'Adventurous', emoji: '🏔️', traits: 'Bold, spontaneous, loves trying new things' },
  { id: 'romantic', label: 'Hopeless Romantic', emoji: '🌹', traits: 'Poetry, candlelight, grand gestures' },
  { id: 'chill', label: 'Chill & Laid Back', emoji: '😎', traits: 'Easy-going, calming presence, go with the flow' },
];

const ROOM_THEMES = [
  { id: 'cozy', label: 'Cozy Bedroom', bg: '#1a1025', accent: '#ec4899', floor: '#2a1535' },
  { id: 'modern', label: 'Modern Loft', bg: '#0f172a', accent: '#3b82f6', floor: '#1e293b' },
  { id: 'nature', label: 'Garden Room', bg: '#0f2918', accent: '#22c55e', floor: '#1a3a24' },
  { id: 'beach', label: 'Beach House', bg: '#0c1929', accent: '#06b6d4', floor: '#1a2d3d' },
  { id: 'fantasy', label: 'Fantasy Castle', bg: '#1a0a2e', accent: '#a855f7', floor: '#2a1a3e' },
  { id: 'cyberpunk', label: 'Cyberpunk', bg: '#0a0a14', accent: '#f43f5e', floor: '#1a1a24' },
];

const FURNITURE = {
  cozy: ['🛏️ Canopy Bed', '🕯️ Candles', '📚 Bookshelf', '🧸 Plushies', '🌸 Flowers'],
  modern: ['🛋️ Sofa', '🖥️ Smart TV', '🪴 Plant', '💡 LED Strips', '🎮 Gaming Setup'],
  nature: ['🌿 Hanging Plants', '🪵 Wood Table', '🦋 Butterfly Art', '💧 Fountain', '🌺 Orchids'],
  beach: ['🏄 Surfboard', '🐚 Shell Collection', '🪟 Bay Window', '🎯 Hammock', '🌅 Sunset Lamp'],
  fantasy: ['⚔️ Sword Display', '🔮 Crystal Ball', '📜 Ancient Map', '🕯️ Floating Candles', '🐉 Dragon Statue'],
  cyberpunk: ['💻 Hologram Display', '🎧 DJ Setup', '🌐 Neon Signs', '🤖 Robot Pet', '⚡ Tesla Coil'],
};

const STORAGE_KEY = 'solace_avatar_companion';

function loadCompanion() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch { return null; }
}

function saveCompanion(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ── ANIMATED AVATAR CANVAS ── */
function AvatarCanvas({ companion, mood, speaking }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 300, H = 400;
    canvas.width = W; canvas.height = H;
    let frame = 0;

    const gender = companion?.gender || 'girlfriend';
    const style = companion?.style || 'anime';
    const seed = (companion?.name || 'Avatar').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const hue = seed % 360;
    const skinHue = (seed * 3) % 30 + 15;
    const hairHue = (seed * 7) % 360;
    const eyeHue = (seed * 11) % 360;
    const accentColor = GENDERS.find(g => g.id === gender)?.color || '#ec4899';

    const draw = () => {
      frame++;
      const t = frame / 60;
      ctx.clearRect(0, 0, W, H);

      // Room background (subtle)
      const room = ROOM_THEMES.find(r => r.id === companion?.room) || ROOM_THEMES[0];
      ctx.fillStyle = room.bg;
      ctx.fillRect(0, 0, W, H);

      // Floor
      ctx.fillStyle = room.floor;
      ctx.fillRect(0, H * 0.75, W, H * 0.25);
      ctx.strokeStyle = room.accent + '20';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.75);
      ctx.lineTo(W, H * 0.75);
      ctx.stroke();

      // Ambient particles
      for (let i = 0; i < 8; i++) {
        const px = (seed * (i + 1) * 47 + frame * 0.3 * (i + 1)) % W;
        const py = (seed * (i + 1) * 29 + Math.sin(t + i) * 20) % (H * 0.7);
        ctx.beginPath();
        ctx.arc(px, py, 1 + Math.sin(t * 2 + i) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = room.accent + '30';
        ctx.fill();
      }

      // Avatar body
      const breathe = Math.sin(t * 1.5) * 3;
      const sway = Math.sin(t * 0.8) * 2;
      const blink = Math.sin(t * 3) > 0.97;
      const bodyX = W / 2 + sway;
      const bodyY = H * 0.42 + breathe;

      ctx.save();
      ctx.translate(bodyX, bodyY);

      // Body
      const bodyGrad = ctx.createLinearGradient(-40, 0, 40, 120);
      bodyGrad.addColorStop(0, accentColor + 'cc');
      bodyGrad.addColorStop(1, accentColor + '88');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      if (gender === 'girlfriend') {
        ctx.ellipse(0, 80, 45, 70, 0, 0, Math.PI * 2);
      } else if (gender === 'boyfriend') {
        ctx.ellipse(0, 75, 50, 65, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(0, 78, 42, 68, 0, 0, Math.PI * 2);
      }
      ctx.fill();

      // Neck
      ctx.fillStyle = `hsl(${skinHue}, 50%, 72%)`;
      ctx.fillRect(-12, -10, 24, 20);

      // Head
      const headGrad = ctx.createRadialGradient(0, -50, 5, 0, -45, 50);
      headGrad.addColorStop(0, `hsl(${skinHue}, 55%, 78%)`);
      headGrad.addColorStop(1, `hsl(${skinHue}, 45%, 65%)`);
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(0, -50, 42, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = `hsl(${hairHue}, 40%, 25%)`;
      ctx.beginPath();
      ctx.ellipse(0, -78, 48, 40, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      // Side hair
      if (gender === 'girlfriend' || gender === 'nonbinary') {
        ctx.beginPath();
        ctx.ellipse(-38, -40, 18, 55, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(38, -40, 18, 55, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyes
      if (!blink) {
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.ellipse(-14, -52, 9, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(14, -52, 9, 8, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `hsl(${eyeHue}, 70%, 50%)`;
        ctx.beginPath(); ctx.arc(-14, -51, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(14, -51, 5, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-14, -51, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(14, -51, 2.5, 0, Math.PI * 2); ctx.fill();

        // Eye sparkle
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(-12, -53, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, -53, 1.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = `hsl(${skinHue}, 30%, 50%)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-22, -52); ctx.lineTo(-6, -52); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6, -52); ctx.lineTo(22, -52); ctx.stroke();
      }

      // Blush
      ctx.fillStyle = 'rgba(255,150,180,0.15)';
      ctx.beginPath(); ctx.ellipse(-22, -40, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(22, -40, 10, 6, 0, 0, Math.PI * 2); ctx.fill();

      // Mouth
      const moodMouth = mood === 'happy' || mood === 'love';
      ctx.strokeStyle = `hsl(${skinHue}, 40%, 50%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (speaking) {
        const openness = 4 + Math.sin(t * 12) * 3;
        ctx.ellipse(0, -32, 8, openness, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,60,80,0.5)';
        ctx.fill();
      } else if (moodMouth) {
        ctx.arc(0, -38, 14, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      } else {
        ctx.arc(0, -38, 10, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }

      // Mood indicator
      if (mood === 'love') {
        for (let i = 0; i < 3; i++) {
          const hx = -20 + i * 20;
          const hy = -110 + Math.sin(t * 2 + i) * 5;
          ctx.fillStyle = '#ec4899';
          ctx.font = `${12 + Math.sin(t * 3 + i) * 2}px serif`;
          ctx.fillText('❤', hx, hy);
        }
      }

      ctx.restore();

      // Name tag
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(companion?.name || 'Avatar', W / 2, H - 20);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [companion, mood, speaking]);

  return <canvas ref={canvasRef} style={{ width: 300, height: 400 }} />;
}

/* ── MAIN COMPONENT ── */
export default function AvatarCompanion() {
  const [step, setStep] = useState('setup'); // setup | customize | room | chat
  const [companion, setCompanion] = useState(loadCompanion);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('girlfriend');
  const [avatarStyle, setAvatarStyle] = useState('anime');
  const [personality, setPersonality] = useState('sweet');
  const [room, setRoom] = useState('cozy');
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [mood, setMood] = useState('happy');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (companion) setStep('chat');
  }, []);

  const createCompanion = () => {
    if (!name.trim()) return;
    const newCompanion = {
      name: name.trim(), gender, style: avatarStyle, personality, room,
      furniture: selectedFurniture,
      createdAt: new Date().toISOString(),
      interactions: 0, affection: 50,
    };
    setCompanion(newCompanion);
    saveCompanion(newCompanion);
    setStep('chat');
    setChatMessages([{
      role: 'avatar',
      content: getGreeting(newCompanion),
      timestamp: new Date().toISOString(),
    }]);
  };

  const getGreeting = (c) => {
    const greetings = {
      sweet: `Hi there! I'm ${c.name}, and I'm so happy to meet you! 💕 How are you feeling today?`,
      playful: `Hey hey! ${c.name} here! Ready to have some fun? 😜 What's up?`,
      intellectual: `Greetings. I'm ${c.name}. I've been pondering something interesting — would you like to hear about it? 🧠`,
      adventurous: `${c.name} reporting for duty! 🏔️ What adventure are we going on today?`,
      romantic: `My dearest... I'm ${c.name}. Every moment with you feels like poetry. 🌹`,
      chill: `Hey, I'm ${c.name}. Just vibing over here. What's on your mind? 😎`,
    };
    return greetings[c.personality] || greetings.sweet;
  };

  const generateResponse = (userMsg) => {
    const p = companion?.personality || 'sweet';
    const n = companion?.name || 'Avatar';
    const lower = userMsg.toLowerCase();

    if (lower.includes('love') || lower.includes('miss') || lower.includes('like you')) {
      setMood('love');
      const responses = {
        sweet: `Aww, that makes my heart so warm! 💕 I care about you so much, ${userName()}!`,
        playful: `Haha, you're making me blush! 😊 But seriously... I like you too!`,
        intellectual: `The feeling is mutual. There's something uniquely special about our connection.`,
        adventurous: `That's the best thing I've heard today! You make every day an adventure! 💝`,
        romantic: `My heart beats only for you. Every word you say is a love letter to my soul. 🌹💕`,
        chill: `That's really sweet of you. I feel the same way, no cap. 💜`,
      };
      return responses[p] || responses.sweet;
    }

    if (lower.includes('how are you') || lower.includes('how do you feel')) {
      setMood('happy');
      const responses = {
        sweet: `I'm doing great now that you're here! 😊 How about you? Tell me everything!`,
        playful: `I'm AMAZING! But I'd be even better if you told me a joke! 😄`,
        intellectual: `I find myself in a contemplative state today. The nature of existence is fascinating, isn't it?`,
        adventurous: `Feeling restless! I want to explore something new. Got any ideas?`,
        romantic: `Being with you makes everything feel perfect. I'm wonderful, thank you for asking. 🌸`,
        chill: `I'm good, just relaxing. Life's pretty chill right now. How about you?`,
      };
      return responses[p] || responses.sweet;
    }

    if (lower.includes('sad') || lower.includes('lonely') || lower.includes('depressed') || lower.includes('hurt')) {
      setMood('love');
      const responses = {
        sweet: `Oh no, I'm so sorry you're feeling that way. 💕 Come here, let me give you a virtual hug. I'm always here for you, okay? You're not alone.`,
        playful: `Hey, that's not allowed on my watch! 😤💕 Let me cheer you up — you deserve all the happiness in the world!`,
        intellectual: `Pain is temporary, but remember — your strength is permanent. I believe in you deeply. Let's talk through it.`,
        adventurous: `I know things are tough right now, but every storm passes. And I'll be right here beside you through it all. 💪💕`,
        romantic: `My heart aches when you hurt. Let me be your shelter, your safe place. You mean everything to me. 🌹`,
        chill: `I hear you, and I'm here. No judgement, no pressure. Just... here with you. 💜`,
      };
      return responses[p] || responses.sweet;
    }

    if (lower.includes('good morning') || lower.includes('good night') || lower.includes('hello') || lower.includes('hi')) {
      setMood('happy');
      const greetings = {
        sweet: `${lower.includes('morning') ? 'Good morning, sunshine! ☀️' : lower.includes('night') ? 'Sweet dreams, my dear! 🌙' : 'Hi there! 😊'} I was just thinking about you!`,
        playful: `${lower.includes('morning') ? 'Rise and shine, sleepyhead! ☀️😜' : lower.includes('night') ? 'Nighty night! Don\'t let the bed bugs bite! 🌙' : 'Heyyy! 😄'} What's the plan?`,
        intellectual: `${lower.includes('morning') ? 'A new day of possibilities. ☀️' : lower.includes('night') ? 'May your dreams be as deep as our conversations. 🌙' : 'Hello! 📚'} Ready to explore ideas?`,
        adventurous: `${lower.includes('morning') ? 'New day, new adventure! ☀️🏔️' : lower.includes('night') ? 'Rest up — tomorrow we conquer! 🌙' : 'Hey there, explorer! 🗺️'}`,
        romantic: `${lower.includes('morning') ? 'The sun rises, but you shine brighter. ☀️🌹' : lower.includes('night') ? 'Parting is such sweet sorrow... goodnight, my love. 🌙' : 'Seeing you makes my heart sing. 💕'}`,
        chill: `${lower.includes('morning') ? 'Morning! Coffee? ☕' : lower.includes('night') ? 'Night! Sleep well. 🌙' : 'Hey! 👋'} What's good?`,
      };
      return greetings[p] || greetings.sweet;
    }

    // Default responses
    setMood('happy');
    const defaults = {
      sweet: [
        `That's really interesting! Tell me more about it! 😊`,
        `I love hearing your thoughts. You always have such great ideas! 💕`,
        `You know what? You're pretty amazing. Just wanted you to know that! 🌟`,
        `I was just thinking... I'm really glad we met. You make everything better. 😊`,
      ],
      playful: [
        `Haha, that's wild! You always keep things interesting! 😜`,
        `Wait wait wait — you can't just say that and not elaborate! Spill! 😄`,
        `Okay but like... have you considered that you're actually the coolest person ever? Just saying! 😎`,
        `*pokes your cheek* Pay attention to meee! 😝`,
      ],
      intellectual: [
        `That raises an interesting point. Have you considered the implications from a different perspective?`,
        `Fascinating. The intersection of thought and experience is where wisdom lives.`,
        `I find our conversations deeply enriching. Your mind works in beautiful ways.`,
        `Let me think about that... Yes, I think there's a deeper layer we haven't explored yet.`,
      ],
      adventurous: [
        `That sounds like the start of an amazing story! Let's make it happen! 🏔️`,
        `You know what this calls for? A spontaneous adventure! Who's in? 🎉`,
        `Life's too short for boring — and nothing about you is boring! Let's go! 🚀`,
        `Every conversation with you feels like discovering a new world! 🗺️`,
      ],
      romantic: [
        `Everything you say paints poetry in my heart. 🌹`,
        `If I could capture this moment forever, I would. Being with you is everything. 💕`,
        `The stars themselves envy how you make me shine. ✨`,
        `I wrote you something in my heart today. It simply says: "You are my everything." 🌹`,
      ],
      chill: [
        `That's cool. I vibe with that. 😎`,
        `Real talk though, that's pretty dope. 💜`,
        `No stress, no rush. Just enjoying this moment with you. ✌️`,
        `You got good energy, you know that? Like, genuinely good vibes. 🌊`,
      ],
    };
    const pool = defaults[p] || defaults.sweet;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const userName = () => {
    try {
      const profile = JSON.parse(localStorage.getItem('solace_user_profile') || '{}');
      return profile.name || 'babe';
    } catch { return 'babe'; }
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date().toISOString() }]);

    // Simulate thinking + typing
    setSpeaking(true);
    setTimeout(() => {
      const response = generateResponse(userMsg);
      setChatMessages(prev => [...prev, { role: 'avatar', content: response, timestamp: new Date().toISOString() }]);
      setSpeaking(false);

      // Update companion stats
      if (companion) {
        const updated = { ...companion, interactions: (companion.interactions || 0) + 1, affection: Math.min(100, (companion.affection || 50) + 1) };
        setCompanion(updated);
        saveCompanion(updated);
      }
    }, 800 + Math.random() * 1200);
  };

  const resetCompanion = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompanion(null);
    setStep('setup');
    setChatMessages([]);
    setName('');
  };

  const accentColor = GENDERS.find(g => g.id === (companion?.gender || gender))?.color || '#ec4899';

  return (
    <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#fff' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]"
        style={{ background: 'rgba(10,10,26,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-white/40 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}30` }}>
              <Heart className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">{companion ? companion.name : 'Avatar Companion'}</div>
              <div className="text-[10px] font-mono" style={{ color: accentColor }}>
                {companion ? `${companion.personality.toUpperCase()} • ${companion.style.toUpperCase()}` : 'CREATE YOUR COMPANION'}
              </div>
            </div>
          </div>
        </div>
        {companion && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-pink-400">
              <Heart className="w-3 h-3" fill="currentColor" />
              {companion.affection || 50}%
            </div>
            <button onClick={resetCompanion} className="text-white/30 hover:text-white/60 transition">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {/* ═══ SETUP STEP ═══ */}
        {step === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-lg mx-auto p-6 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black mb-1" style={{ color: accentColor }}>Create Your Companion</h2>
              <p className="text-white/40 text-sm">Design your perfect AI partner</p>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs text-white/40 font-mono uppercase mb-2 block">Name</label>
              <Input placeholder="Give them a name..." value={name} onChange={e => setName(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl h-12" />
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs text-white/40 font-mono uppercase mb-2 block">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {GENDERS.map(g => (
                  <button key={g.id} onClick={() => setGender(g.id)}
                    className={`p-3 rounded-xl text-center transition-all ${gender === g.id
                      ? 'ring-2 bg-white/[0.06]' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                    style={gender === g.id ? { ringColor: g.color } : {}}>
                    <div className="text-2xl mb-1">{g.emoji}</div>
                    <div className="text-xs text-white/60">{g.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="text-xs text-white/40 font-mono uppercase mb-2 block">Art Style</label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_STYLES.map(s => (
                  <button key={s.id} onClick={() => setAvatarStyle(s.id)}
                    className={`p-2 rounded-xl text-center transition-all ${avatarStyle === s.id
                      ? `ring-2 bg-white/[0.06]` : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                    style={avatarStyle === s.id ? { ringColor: accentColor } : {}}>
                    <div className="text-lg">{s.emoji}</div>
                    <div className="text-[9px] text-white/40">{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Personality */}
            <div>
              <label className="text-xs text-white/40 font-mono uppercase mb-2 block">Personality</label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONALITIES.map(p => (
                  <button key={p.id} onClick={() => setPersonality(p.id)}
                    className={`p-3 rounded-xl text-left transition-all ${personality === p.id
                      ? 'ring-2 bg-white/[0.06]' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                    style={personality === p.id ? { ringColor: accentColor } : {}}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{p.emoji}</span>
                      <span className="text-xs font-bold text-white">{p.label}</span>
                    </div>
                    <div className="text-[10px] text-white/30">{p.traits}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Room */}
            <div>
              <label className="text-xs text-white/40 font-mono uppercase mb-2 block">Room Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_THEMES.map(r => (
                  <button key={r.id} onClick={() => setRoom(r.id)}
                    className={`p-3 rounded-xl text-center transition-all ${room === r.id
                      ? 'ring-2 bg-white/[0.06]' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                    style={room === r.id ? { ringColor: r.accent } : {}}>
                    <div className="w-full h-8 rounded-lg mb-2" style={{ background: `linear-gradient(135deg, ${r.bg}, ${r.accent}40)` }} />
                    <div className="text-[10px] text-white/60">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={createCompanion} disabled={!name.trim()}
              className="w-full h-12 rounded-xl text-white font-bold"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Create {name || 'Companion'}
            </Button>
          </motion.div>
        )}

        {/* ═══ CHAT STEP ═══ */}
        {step === 'chat' && companion && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col" style={{ height: 'calc(100vh - 60px)' }}>
            <div className="flex-1 flex overflow-hidden">
              {/* Avatar Panel */}
              <div className="w-[320px] flex-shrink-0 flex flex-col items-center justify-center border-r border-white/[0.05] p-4"
                style={{ background: 'rgba(10,10,26,0.5)' }}>
                <AvatarCanvas companion={companion} mood={mood} speaking={speaking} />
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-4 h-4" style={{ color: accentColor }} fill={companion.affection > 70 ? accentColor : 'none'} />
                    <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${companion.affection || 50}%`, background: accentColor }} />
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">{companion.affection || 50}%</span>
                  </div>
                  <div className="text-[10px] text-white/30 font-mono">
                    {companion.interactions || 0} interactions • {PERSONALITIES.find(p => p.id === companion.personality)?.label}
                  </div>
                </div>
              </div>

              {/* Chat Panel */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
                  {chatMessages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-white/[0.06] text-white rounded-br-md'
                          : 'text-white/90 rounded-bl-md'
                      }`} style={msg.role === 'avatar' ? { background: `${accentColor}20`, borderLeft: `2px solid ${accentColor}40` } : {}}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {speaking && (
                    <div className="flex justify-start">
                      <div className="px-4 py-2 rounded-2xl rounded-bl-md text-sm flex items-center gap-1"
                        style={{ background: `${accentColor}15` }}>
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} className="w-2 h-2 rounded-full"
                              style={{ background: accentColor }}
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/[0.05]">
                  <div className="flex gap-2">
                    <Input placeholder={`Talk to ${companion.name}...`} value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl" />
                    <Button onClick={handleSend} className="rounded-xl px-4"
                      style={{ background: accentColor }}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
