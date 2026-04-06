import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Brain, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { base44 } from '../api/base44Client';

export default function OracleMaster({ onNavigate, onGoHome, minimal = false, fullScreen = false }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'oracle',
      content: 'SOLACE Oracle online. Ask me anything, or say "open [app name]" to launch any feature. Tap the grid icon at the top to browse all apps.'
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Mic ready');
  
  // Draggable state
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for SpeechRecognition support
  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const hasSpeechSupport = !!SpeechRecognition;

  // Request microphone permission explicitly
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error('Mic permission denied:', err);
      setVoiceStatus('Mic permission denied - check browser settings');
      return false;
    }
  };

  const toggleVoiceInput = async () => {
    if (!hasSpeechSupport) {
      setVoiceStatus('Voice not supported in this browser');
      return;
    }

    if (isListening) {
      // Stop current recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    // Request permission first
    const permitted = await requestMicPermission();
    if (!permitted) return;

    // Create fresh recognition instance (required for reuse)
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Changed to en-US for better compatibility
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('Listening... Speak now');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      if (transcript) {
        setInput(transcript);
      }
      
      // If final result, auto-send
      if (event.results[0]?.isFinal) {
        setInput(transcript);
        setTimeout(() => {
          if (transcript && !isThinking) {
            handleSendWithInput(transcript);
          }
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      const errorMessages = {
        'no-speech': 'No speech detected - try again',
        'audio-capture': 'No microphone found',
        'not-allowed': 'Mic permission denied',
        'network': 'Network error - check connection',
        'aborted': 'Recording stopped',
        'service-not-allowed': 'Voice service unavailable'
      };
      
      setVoiceStatus(errorMessages[event.error] || `Error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceStatus('Mic ready');
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setVoiceStatus('Click mic to try again');
    }
  };

  // ── KNOWLEDGE WALL — monetization gate for free tier ──
  const checkKnowledgeWall = (userInput) => {
    const tier = localStorage.getItem('solace_user_tier') || 'free';
    if (tier !== 'free') return null;
    const lower = userInput.toLowerCase();
    const walls = [
      { kw: ['invest','stock','crypto','trading','portfolio','forex','dividend'], t: 'investment advice' },
      { kw: ['legal','lawyer','lawsuit','contract law','sue','court','liability'], t: 'legal guidance' },
      { kw: ['diagnosis','prescription','treatment plan','medical advice','dosage'], t: 'medical consultation' },
      { kw: ['write code','programming','javascript','python','build me an app','api endpoint','database schema'], t: 'code generation' },
      { kw: ['business plan','startup','revenue model','market analysis','competitive analysis','pitch deck'], t: 'business strategy' },
      { kw: ['ghostwrite','copywriting','content strategy','write article','write essay','seo strategy'], t: 'professional writing' },
      { kw: ['tax advice','accounting','financial planning','wealth management','budget analysis'], t: 'financial planning' },
      { kw: ['meal plan','nutrition plan','diet plan','fitness program','workout routine','training program'], t: 'detailed wellness plans' },
      { kw: ['movie maker','make a movie','generate film','screenplay'], t: 'Movie Maker' },
      { kw: ['edit video','video editor','luma','dance video'], t: 'Video Editor' },
      { kw: ['avatar','girlfriend','boyfriend','companion room','decorate room'], t: 'Avatar Companion' },
      { kw: ['live vision','object detect','ar scan'], t: 'Live Vision AI' },
    ];
    for (const w of walls) {
      if (w.kw.some(k => lower.includes(k))) {
        const jokes = [
          "My boss has to make money somehow, you know! 😄",
          "Look, even Oracle's gotta eat... digitally speaking! 😅",
          "I'd love to spill all the secrets but my boss put a padlock on that one! 🔒",
          "Between you and me, the premium stuff is where the real magic happens! ✨",
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        return `Ooh, ${w.t}? That's premium territory! ${joke} Upgrade to Solace Plus ($20/mo) or Solace Pro ($10/mo on yearly) for unlimited Oracle knowledge, full AI models, and all the good stuff. Say "open Settings" to check out upgrade plans! For now, I can help with basic questions, navigation, and general chat.`;
      }
    }
    return null;
  };

  // Handle send with specific input (for voice auto-send)
  const handleSendWithInput = async (userInput) => {
    if (!userInput.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: userInput }]);
    setInput('');
    setIsThinking(true);

    const navReply = detectNavigationIntent(userInput);
    if (navReply) {
      setIsThinking(false);
      setMessages((prev) => [...prev, { role: 'oracle', content: navReply }]);
      speakText(navReply);
      return;
    }

    // ── KNOWLEDGE WALL — free tier blocks premium topics ──
    const wallReply = checkKnowledgeWall(userInput);
    if (wallReply) {
      setIsThinking(false);
      setMessages((prev) => [...prev, { role: 'oracle', content: wallReply }]);
      speakText(wallReply);
      return;
    }

    try {
      const modelAnswer = await getModelAnswer(userInput);
      const finalAnswer = modelAnswer || generatePracticalFallback(userInput);
      setMessages((prev) => [...prev, { role: 'oracle', content: finalAnswer }]);
      speakText(finalAnswer);
    } catch (error) {
      const fallback = generatePracticalFallback(userInput);
      setMessages((prev) => [...prev, { role: 'oracle', content: fallback }]);
      speakText(fallback);
      console.error('Oracle response error:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => handleSendWithInput(input);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    // Try to use a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const detectNavigationIntent = (userInput) => {
    const lower = userInput.toLowerCase();
    const routes = [
      { keywords: ['movie', 'film'], page: 'MovieMaker', reply: 'Opening Movie Maker now.' },
      { keywords: ['video editor', 'edit video', 'luma', 'dance video'], page: 'VideoEditor', reply: 'Opening Video Editor now.' },
      { keywords: ['inventor', 'build app', 'make app', 'app maker'], page: 'Inventor', reply: 'Opening App Maker now.' },
      { keywords: ['voice gen', 'voice maker', 'multilingual'], page: 'VoiceGenerator', reply: 'Opening Voice Generator now.' },
      { keywords: ['interpret', 'translat', 'language'], page: 'Interpreter', reply: 'Opening Interpreter now.' },
      { keywords: ['avatar', 'girlfriend', 'boyfriend', 'companion', 'partner'], page: 'AvatarCompanion', reply: 'Opening Avatar Companion now.' },
      { keywords: ['live vision', 'camera', 'ar'], page: 'LiveVision', reply: 'Opening Live Vision now.' },
      { keywords: ['marketing', 'campaign', 'sms', 'email blast'], page: 'MarketingHub', reply: 'Opening Marketing Hub now.' },
      { keywords: ['diagnos', 'self-repair', 'debug', 'broken', 'not working'], page: 'DiagnosticCenter', reply: 'Opening Diagnostics — running scan now.' },
      { keywords: ['safety', 'emergency', 'danger'], page: 'SafetyCenter', reply: 'Opening Safety Center now.' },
      { keywords: ['shop', 'mall', 'store', 'marketplace'], page: 'SovereignMall', reply: 'Opening Digital Mall now.' },
      { keywords: ['owner', 'revenue', 'income'], page: 'OwnerDashboard', reply: 'Opening Owner Dashboard now.' },
      { keywords: ['setting', 'preference', 'config'], page: 'Settings', reply: 'Opening Settings now.' },
      { keywords: ['app store', 'connect app', 'download app', 'add app', 'integration'], page: 'AppStore', reply: 'Opening App Store now.' },
      { keywords: ['chat', 'oracle', 'talk'], page: 'Chat', reply: 'Opening AI Chat now.' },
    ];
    for (const route of routes) {
      if (route.keywords.some(k => lower.includes(k))) {
        onNavigate?.(route.page);
        return route.reply;
      }
    }
    if (lower.includes('home') || lower.includes('dashboard') || lower.includes('main menu')) {
      onGoHome?.();
      return 'Returning to home now.';
    }
    return null;
  };

  const generatePracticalFallback = (userInput) => {
    const lower = userInput.toLowerCase();

    if (lower.includes('earbud') || lower.includes('headset') || lower.includes('wearable') || lower.includes('mic')) {
      return 'Earbuds connection steps: 1) Connect earbuds to your phone/computer first. 2) Allow microphone access for this site in browser settings. 3) Click the mic icon and speak. 4) Oracle voice output uses your active system audio output (your earbuds if selected).';
    }

    if (lower.includes('how') || lower.includes('plan') || lower.includes('strategy')) {
      return `Practical approach for "${userInput}": 1) Define the exact outcome. 2) Split into three executable steps. 3) Execute step one now. 4) Measure result and iterate. If you want, I will generate a detailed step-by-step execution checklist.`;
    }

    if (lower.includes('help') || lower.includes('what can you do')) {
      return 'I can answer questions, create practical plans, and control the app by command. Try: "open MovieMaker", "open Inventor", "open Wellness Center", or ask me a specific problem and I will break it down into clear steps.';
    }

    return `Direct answer: based on "${userInput}", start with one clear objective, one immediate action, and one success metric. If you share your exact goal, I will produce a precise execution plan.`;
  };

  const getModelAnswer = async (userInput) => {
    const prompt = `Respond as Oracle with direct, practical help. Avoid generic filler. User request: ${userInput}`;
    const response = await base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: true });

    const answer = typeof response?.data === 'string'
      ? response.data.trim()
      : (response?.data?.answer || response?.data?.summary || '');

    if (!answer || answer === prompt || answer.includes('Connect an AI backend') || answer.length < 20) {
      return null;
    }

    return answer;
  };

  // Drag handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ═══ FULL-SCREEN ORACLE — the main landing experience ═══
  if (fullScreen) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle radial background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.03) 0%, transparent 50%)'
        }} />

        {/* Orb + status area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 10px', minHeight: 0, position: 'relative', zIndex: 1 }}>
          {/* The Oracle Orb */}
          <div style={{
            position: 'relative', width: '180px', height: '180px', borderRadius: '50%',
            background: isSpeaking
              ? 'radial-gradient(circle at 40% 35%, #818cf8, #6366f1, #4f46e5, #3730a3)'
              : isThinking
                ? 'radial-gradient(circle at 40% 35%, #a78bfa, #7c3aed, #6d28d9, #4c1d95)'
                : 'radial-gradient(circle at 40% 35%, #6366f1, #4f46e5, #3730a3, #312e81)',
            boxShadow: isSpeaking
              ? '0 0 80px rgba(99,102,241,0.6), 0 0 160px rgba(99,102,241,0.25), inset 0 0 40px rgba(129,140,248,0.3)'
              : '0 0 60px rgba(99,102,241,0.35), 0 0 120px rgba(99,102,241,0.1), inset 0 0 30px rgba(129,140,248,0.2)',
            transition: 'all 0.5s ease', marginBottom: '20px',
            animation: isThinking ? 'fsPulse 1.5s ease-in-out infinite' : 'fsFloat 4s ease-in-out infinite',
          }}>
            {/* Inner highlight */}
            <div style={{ position: 'absolute', top: '15%', left: '20%', width: '45%', height: '35%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(199,210,254,0.35), transparent)', filter: 'blur(8px)' }} />
            {/* Speech ripples */}
            {isSpeaking && [0,1,2].map(i => (
              <div key={i} style={{ position: 'absolute', inset: -(20 + i * 20), borderRadius: '50%', border: `1.5px solid rgba(99,102,241,${0.5 - i * 0.12})`, animation: `fsRipple ${1 + i * 0.3}s ease-out infinite`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div style={{ color: '#818cf8', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {isThinking ? 'PROCESSING...' : isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING...' : 'ORACLE READY'}
          </div>
        </div>

        {/* Messages */}
        <div style={{ maxHeight: '35vh', overflowY: 'auto', padding: '0 20px 8px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
          {messages.slice(-8).map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%', padding: '10px 16px', borderRadius: '16px',
              fontSize: '0.88rem', lineHeight: 1.5, color: '#e2e8f0',
              background: msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(15,15,30,0.8)',
              border: msg.role === 'user' ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.04)',
            }}>
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid rgba(99,102,241,0.08)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Oracle anything..."
              style={{ flex: 1, padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(6,6,16,0.8)', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none' }}
            />
            <button onClick={toggleVoiceInput} style={{ width: '46px', height: '46px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', background: isListening ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button onClick={handleSend} disabled={!input.trim() || isThinking} style={{ width: '46px', height: '46px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!input.trim() || isThinking) ? 0.4 : 1 }}>
              <Send size={20} />
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '8px', color: '#475569', fontSize: '0.68rem' }}>
            {voiceStatus}{isSpeaking ? ' · Speaking' : ''}
          </div>
        </div>

        <style>{`
          @keyframes fsFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
          @keyframes fsPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
          @keyframes fsRipple { 0% { transform: scale(0.9); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }
        `}</style>
      </div>
    );
  }

  if (minimal) {
    return (
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: isSpeaking 
            ? 'linear-gradient(145deg, #ec4899, #f472b6, #a855f7)'
            : 'linear-gradient(145deg, #ec4899, #be185d)',
          boxShadow: isSpeaking
            ? '0 0 40px rgba(236,72,153,0.8), 0 0 80px rgba(236,72,153,0.3), 0 4px 15px rgba(0,0,0,0.3)'
            : '0 0 30px rgba(236,72,153,0.6), 0 4px 15px rgba(0,0,0,0.3)',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}
      >
        <Brain size={28} color="#fff" />
        {/* Cyberpunk backlight glow */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
          filter: 'blur(8px)', zIndex: -1,
          animation: isSpeaking ? 'orbBacklight 0.8s ease-in-out infinite' : 'orbBacklight 3s ease-in-out infinite'
        }} />
        {/* Speech ripples */}
        {isSpeaking && [0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: -(8 + i * 12), borderRadius: '50%',
            border: `1.5px solid rgba(236,72,153,${0.6 - i * 0.15})`,
            animation: `speechRipple ${0.8 + i * 0.3}s ease-out infinite`,
            animationDelay: `${i * 0.15}s`
          }} />
        ))}
        {isThinking && (
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '2px solid rgba(236,72,153,0.6)',
            animation: 'pulse 1s infinite'
          }} />
        )}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.5; }
          }
          @keyframes orbBacklight {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.15); }
          }
          @keyframes speechRipple {
            0% { transform: scale(0.8); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 0.3; }
            100% { transform: scale(1.4); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: isMinimized ? 280 : 320,
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      {/* Header / Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: isSpeaking 
            ? 'linear-gradient(135deg, #ec4899, #be185d, #a855f7)'
            : 'linear-gradient(135deg, #be185d, #9d174d)',
          padding: '10px 14px',
          borderRadius: '16px 16px 0 0',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: isSpeaking
            ? '0 4px 30px rgba(236,72,153,0.6), 0 0 60px rgba(236,72,153,0.2)'
            : '0 4px 20px rgba(190,24,93,0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GripVertical size={16} color="rgba(255,255,255,0.7)" />
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Oracle</span>
          {isSpeaking && (
            <div style={{ display: 'flex', gap: 2, alignItems: 'center', height: 16 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{
                  width: 3, borderRadius: 2,
                  background: 'linear-gradient(180deg, #f472b6, #ec4899)',
                  animation: `voiceBar ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.08}s`
                }} />
              ))}
              <style>{`
                @keyframes voiceBar {
                  0% { height: 4px; opacity: 0.5; }
                  100% { height: 14px; opacity: 1; }
                }
              `}</style>
            </div>
          )}
          {isThinking && <Brain size={16} color="#f472b6" />}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 6,
              padding: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMinimized ? <Maximize2 size={14} color="#fff" /> : <Minimize2 size={14} color="#fff" />}
          </button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <div
          style={{
            background: 'rgba(6,6,15,0.95)',
            border: '1px solid rgba(236,72,153,0.3)',
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(236,72,153,0.1)'
          }}
        >
          {/* Messages */}
          <div
            style={{
              maxHeight: 200,
              minHeight: 80,
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {messages.slice(-6).map((message, idx) => (
              <div
                key={`${message.role}-${idx}`}
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 13,
                  lineHeight: 1.4,
                  background: message.role === 'user' ? 'rgba(139,92,246,0.4)' : 'rgba(236,72,153,0.2)',
                  border: message.role === 'user' ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(236,72,153,0.35)'
                }}
              >
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '10px 12px 12px', borderTop: '1px solid rgba(255,105,180,0.15)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSend();
                }}
                placeholder="Ask Oracle..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(236,72,153,0.4)',
                  background: 'rgba(2,6,23,0.8)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
              <button
                onClick={toggleVoiceInput}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid rgba(236,72,153,0.6)',
                  background: isListening ? 'rgba(239,68,68,0.8)' : 'rgba(190,24,93,0.4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: !input.trim() || isThinking ? 0.5 : 1
                }}
              >
                <Send size={16} />
              </button>
            </div>
            <div style={{ marginTop: 6, textAlign: 'center', color: '#f472b6', fontSize: 10 }}>
              {voiceStatus}{isSpeaking ? ' · Speaking' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Orb indicator when minimized */}
      {isMinimized && (
        <div
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #ec4899, #be185d)',
            boxShadow: '0 0 15px rgba(236,72,153,0.8)',
            animation: isThinking ? 'pulse 1s infinite' : 'none'
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translateY(-50%) scale(1); opacity: 1; }
          50% { transform: translateY(-50%) scale(1.3); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
