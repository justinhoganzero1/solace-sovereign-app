import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ─── Constants ─── */
const ACCENT = '#a855f7';
const ACCENT2 = '#ec4899';
const CYAN = '#22d3ee';

const SPECIALIST_MAP = {
  'movie': { page: 'MovieMaker', name: 'Movie Maker', desc: 'AI movie generation studio' },
  'film': { page: 'MovieMaker', name: 'Movie Maker', desc: 'AI movie generation studio' },
  'video': { page: 'VideoEditor', name: 'Video Editor', desc: 'AI video editing suite' },
  'edit video': { page: 'VideoEditor', name: 'Video Editor', desc: 'AI video editing suite' },
  'app': { page: 'Inventor', name: 'App Maker', desc: 'Build production-ready apps' },
  'build app': { page: 'Inventor', name: 'App Maker', desc: 'Build production-ready apps' },
  'invent': { page: 'Inventor', name: 'App Maker', desc: 'Build production-ready apps' },
  'wellness': { page: 'WellnessCenter', name: 'Wellness Center', desc: 'Health & wellness tools' },
  'health': { page: 'WellnessCenter', name: 'Wellness Center', desc: 'Health & wellness tools' },
  'breathe': { page: 'WellnessCenter', name: 'Wellness Center', desc: 'Guided breathing & wellness' },
  'meditat': { page: 'WellnessCenter', name: 'Wellness Center', desc: 'Meditation & mindfulness' },
  'fitness': { page: 'TitanHeart', name: 'Titan Heart', desc: 'Fitness & strength coaching' },
  'workout': { page: 'TitanHeart', name: 'Titan Heart', desc: 'Fitness & strength coaching' },
  'exercise': { page: 'TitanHeart', name: 'Titan Heart', desc: 'Fitness & strength coaching' },
  'gym': { page: 'TitanHeart', name: 'Titan Heart', desc: 'Fitness & strength coaching' },
  'build': { page: 'Builder', name: 'Builder', desc: 'Construction & project planning' },
  'construct': { page: 'Builder', name: 'Builder', desc: 'Construction & project planning' },
  'car': { page: 'Mechanic', name: 'Mechanic', desc: 'Vehicle diagnostics & repair' },
  'mechanic': { page: 'Mechanic', name: 'Mechanic', desc: 'Vehicle diagnostics & repair' },
  'vehicle': { page: 'Mechanic', name: 'Mechanic', desc: 'Vehicle diagnostics & repair' },
  'repair': { page: 'Mechanic', name: 'Mechanic', desc: 'Vehicle diagnostics & repair' },
  'translat': { page: 'Interpreter', name: 'Interpreter', desc: '200+ language translation' },
  'language': { page: 'Interpreter', name: 'Interpreter', desc: '200+ language translation' },
  'interpret': { page: 'Interpreter', name: 'Interpreter', desc: '200+ language translation' },
  'fix': { page: 'Handyman', name: 'Handyman', desc: 'Home repair guidance' },
  'handyman': { page: 'Handyman', name: 'Handyman', desc: 'Home repair guidance' },
  'home repair': { page: 'Handyman', name: 'Handyman', desc: 'Home repair guidance' },
  'mind': { page: 'MindHub', name: 'Mind Hub', desc: 'Mental wellness tools' },
  'mental': { page: 'MindHub', name: 'Mind Hub', desc: 'Mental wellness tools' },
  'adhd': { page: 'MindHub', name: 'Mind Hub', desc: 'ADHD & focus tools' },
  'focus': { page: 'MindHub', name: 'Mind Hub', desc: 'Focus & productivity' },
  'safe': { page: 'SafetyCenter', name: 'Safety Center', desc: 'Personal safety tools' },
  'emergency': { page: 'CrisisHub', name: 'Crisis Hub', desc: 'Emergency support' },
  'crisis': { page: 'CrisisHub', name: 'Crisis Hub', desc: 'Emergency support' },
  'sos': { page: 'CrisisHub', name: 'Crisis Hub', desc: 'Emergency support' },
  'voice': { page: 'VoiceGenerator', name: 'Voice Generator', desc: 'Text-to-speech voices' },
  'speak': { page: 'VoiceGenerator', name: 'Voice Generator', desc: 'Text-to-speech voices' },
  'tts': { page: 'VoiceGenerator', name: 'Voice Generator', desc: 'Text-to-speech voices' },
  'shop': { page: 'DigitalMall', name: 'Digital Mall', desc: 'Digital marketplace' },
  'mall': { page: 'DigitalMall', name: 'Digital Mall', desc: 'Digital marketplace' },
  'buy': { page: 'DigitalMall', name: 'Digital Mall', desc: 'Digital marketplace' },
  'family': { page: 'FamilyHub', name: 'Family Hub', desc: 'Family management' },
  'career': { page: 'ProfessionalHub', name: 'Professional Hub', desc: 'Career & business tools' },
  'job': { page: 'ProfessionalHub', name: 'Professional Hub', desc: 'Career & business tools' },
  'business': { page: 'ProfessionalHub', name: 'Professional Hub', desc: 'Career & business tools' },
  'resume': { page: 'ProfessionalHub', name: 'Professional Hub', desc: 'Career & business tools' },
  'train': { page: 'OracleTrainingCenter', name: 'Training Center', desc: 'Oracle training system' },
  'learn': { page: 'OracleTrainingCenter', name: 'Training Center', desc: 'Oracle training system' },
  'camera': { page: 'LiveVision', name: 'Live Vision', desc: 'Camera & AR features' },
  'vision': { page: 'LiveVision', name: 'Live Vision', desc: 'Camera & AR features' },
  'scan': { page: 'LiveVision', name: 'Live Vision', desc: 'Camera & AR features' },
  'community': { page: 'CommunityHub', name: 'Community Hub', desc: 'Social & community' },
  'social': { page: 'CommunityHub', name: 'Community Hub', desc: 'Social & community' },
  'council': { page: 'OracleCouncil', name: 'Oracle Council', desc: 'Strategic AI advisors' },
  'advisor': { page: 'OracleCouncil', name: 'Oracle Council', desc: 'Strategic AI advisors' },
  'strategy': { page: 'OracleCouncil', name: 'Oracle Council', desc: 'Strategic AI advisors' },
};

const GREETINGS = [
  "I am the Oracle. What would you like me to do?",
  "Oracle standing by. Name your task.",
  "Speak, and I shall act. What do you need?",
  "The Oracle is listening. How can I serve you today?",
];

const CAPABILITIES = [
  "I can launch any specialist for you — just describe what you need.",
  "Try saying: 'make a movie', 'fix my car', 'start a workout', 'translate something', 'build an app'...",
  "I control every specialist in SOLACE. Tell me what you want done and I'll deploy the right tool.",
];

function detectIntent(text) {
  const lower = text.toLowerCase().trim();

  if (/^(hi|hello|hey|sup|yo|greet)/i.test(lower)) {
    return { type: 'greeting' };
  }
  if (/^(help|what can you|capabilities|what do you)/i.test(lower)) {
    return { type: 'help' };
  }
  if (/^(go home|dashboard|main|back|home)/i.test(lower)) {
    return { type: 'home' };
  }

  for (const [keyword, spec] of Object.entries(SPECIALIST_MAP)) {
    if (lower.includes(keyword)) {
      return { type: 'launch', specialist: spec };
    }
  }

  return { type: 'unknown' };
}

function generateResponse(intent, userText) {
  switch (intent.type) {
    case 'greeting':
      return { text: GREETINGS[Math.floor(Math.random() * GREETINGS.length)], action: null };
    case 'help':
      return {
        text: `I am the Oracle — your command interface to SOLACE.\n\n${CAPABILITIES.join('\n\n')}`,
        action: null
      };
    case 'home':
      return { text: "Returning to the main dashboard.", action: { type: 'home' } };
    case 'launch':
      return {
        text: `Deploying **${intent.specialist.name}** — ${intent.specialist.desc}.\n\nOpening now...`,
        action: { type: 'navigate', page: intent.specialist.page, name: intent.specialist.name }
      };
    default:
      return {
        text: `I understand you said: "${userText}"\n\nI can help you with any specialist in SOLACE. Try describing what you want to do:\n\n• "Make a movie" — Movie Maker\n• "Fix my car" — Mechanic\n• "Start a workout" — Titan Heart\n• "Build an app" — App Maker\n• "Translate something" — Interpreter\n• "I need help" — See all capabilities`,
        action: null
      };
  }
}

/* ─── Styles ─── */
const S = {
  overlay: {
    position: 'fixed', bottom: 0, right: 0, zIndex: 9999,
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    pointerEvents: 'none',
  },
  fab: {
    width: 64, height: 64, borderRadius: '50%',
    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
    border: 'none', cursor: 'pointer', position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 4px 30px ${ACCENT}40, 0 0 60px ${ACCENT}15`,
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    margin: '0 24px 24px 0', pointerEvents: 'auto',
  },
  panel: (open) => ({
    width: 420, maxHeight: open ? 600 : 0,
    opacity: open ? 1 : 0,
    borderRadius: '20px 20px 0 0',
    background: 'rgba(6,6,18,0.96)',
    backdropFilter: 'blur(30px)',
    border: `1px solid rgba(139,92,246,0.15)`,
    borderBottom: 'none',
    boxShadow: `0 -8px 60px rgba(0,0,0,0.6), 0 0 40px ${ACCENT}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    marginRight: 24, pointerEvents: open ? 'auto' : 'none',
    display: 'flex', flexDirection: 'column',
  }),
  header: {
    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
    borderBottom: '1px solid rgba(139,92,246,0.1)',
    background: 'rgba(139,92,246,0.03)',
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '16px 20px',
    display: 'flex', flexDirection: 'column', gap: 12,
    scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.2) transparent',
    minHeight: 300, maxHeight: 420,
  },
  inputBar: {
    padding: '12px 16px', display: 'flex', gap: 8,
    borderTop: '1px solid rgba(139,92,246,0.1)',
    background: 'rgba(6,6,15,0.5)',
  },
};

/* ─── Orb SVG ─── */
function OracleOrb({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="1" opacity="0.5" />
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.9" />
      <line x1="16" y1="4" x2="16" y2="10" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <line x1="16" y1="22" x2="16" y2="28" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <line x1="4" y1="16" x2="10" y2="16" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <line x1="22" y1="16" x2="28" y2="16" stroke="white" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

/* ─── Message Bubble ─── */
function MsgBubble({ msg }) {
  const isOracle = msg.from === 'oracle';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isOracle ? 'flex-start' : 'flex-end',
      gap: 4,
    }}>
      {isOracle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <OracleOrb size={10} />
          </div>
          <span style={{ fontSize: '0.65rem', color: '#8b8bb0', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Oracle</span>
        </div>
      )}
      <div style={{
        maxWidth: '85%', padding: '10px 14px', borderRadius: isOracle ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        background: isOracle ? 'rgba(139,92,246,0.08)' : 'rgba(34,211,238,0.08)',
        border: `1px solid ${isOracle ? 'rgba(139,92,246,0.15)' : 'rgba(34,211,238,0.15)'}`,
        fontSize: '0.82rem', lineHeight: 1.6, color: '#d4d4e8', whiteSpace: 'pre-wrap',
      }}>
        {msg.text.split('**').map((part, i) =>
          i % 2 === 1
            ? <strong key={i} style={{ color: '#c4b5fd', fontWeight: 700 }}>{part}</strong>
            : <span key={i}>{part}</span>
        )}
      </div>
      {msg.action && msg.action.type === 'navigate' && (
        <button
          onClick={msg.onAction}
          style={{
            marginTop: 4, padding: '8px 16px', borderRadius: 10,
            background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT2}15)`,
            border: `1px solid ${ACCENT}30`, color: '#c4b5fd',
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.background = `linear-gradient(135deg, ${ACCENT}35, ${ACCENT2}25)`; }}
          onMouseLeave={e => { e.target.style.background = `linear-gradient(135deg, ${ACCENT}20, ${ACCENT2}15)`; }}
        >
          <span style={{ fontSize: '1rem' }}>⚡</span>
          Open {msg.action.name}
        </button>
      )}
      <div style={{ fontSize: '0.6rem', color: '#4a4a6a', fontFamily: 'monospace' }}>
        {msg.time}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN ORACLE CHAT COMPONENT
   ═══════════════════════════════════════ */
export default function OracleChat({ onNavigate, onGoHome }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      from: 'oracle',
      text: "I am the **Oracle** — your command interface to SOLACE.\n\nTell me what you need and I will deploy the right specialist for you. Try:\n\n• \"Make a movie\"\n• \"Start a workout\"\n• \"Fix my car\"\n• \"Build an app\"\n• \"Help\"",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: null,
    }
  ]);
  const [typing, setTyping] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEnd.current) {
      messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now().toString(),
      from: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: null,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const intent = detectIntent(text);
      const response = generateResponse(intent, text);

      let actionHandler = null;
      if (response.action?.type === 'navigate' && onNavigate) {
        actionHandler = () => {
          onNavigate(response.action.page);
          setOpen(false);
        };
      }
      if (response.action?.type === 'home' && onGoHome) {
        onGoHome();
        setOpen(false);
      }

      const oracleMsg = {
        id: (Date.now() + 1).toString(),
        from: 'oracle',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
        onAction: actionHandler,
      };

      setTyping(false);
      setMessages(prev => [...prev, oracleMsg]);

      // Auto-execute navigation after a delay
      if (response.action?.type === 'navigate') {
        setTimeout(() => {
          if (onNavigate) onNavigate(response.action.page);
          setOpen(false);
        }, 1800);
      }
    }, 600 + Math.random() * 400);
  }, [input, onNavigate, onGoHome]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={S.overlay}>
      {/* Chat Panel */}
      <div style={S.panel(open)}>
        {/* Header */}
        <div style={S.header}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${ACCENT}30`,
          }}>
            <OracleOrb size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em' }}>THE ORACLE</div>
            <div style={{ color: '#6b6b90', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.15em' }}>MASTER COMMAND INTERFACE</div>
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#22c55e', boxShadow: '0 0 8px #22c55e60',
            animation: 'neonPulse 2s ease-in-out infinite',
          }} />
          <button onClick={() => setOpen(false)} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#8b8bb0', fontSize: '0.8rem', transition: 'all 0.2s',
          }}>✕</button>
        </div>

        {/* Messages */}
        <div style={S.messages}>
          {messages.map(msg => <MsgBubble key={msg.id} msg={msg} />)}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <OracleOrb size={10} />
              </div>
              <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.1)' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: ACCENT,
                    animation: `neonPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div style={S.inputBar}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tell the Oracle what to do..."
            style={{
              flex: 1, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,92,246,0.12)', borderRadius: 12,
              padding: '10px 14px', color: '#e2e8f0', fontSize: '0.82rem',
              outline: 'none', fontFamily: "'Segoe UI', system-ui, sans-serif",
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.12)'}
          />
          <button onClick={handleSend} disabled={!input.trim()} style={{
            width: 42, height: 42, borderRadius: 12, border: 'none',
            background: input.trim() ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})` : 'rgba(255,255,255,0.04)',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: input.trim() ? `0 2px 12px ${ACCENT}30` : 'none',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: input.trim() ? 1 : 0.3 }}>
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...S.fab,
          transform: open ? 'scale(0.9) rotate(180deg)' : 'scale(1)',
          boxShadow: open
            ? `0 2px 12px ${ACCENT}20`
            : `0 4px 30px ${ACCENT}40, 0 0 60px ${ACCENT}15`,
        }}
        title="Talk to the Oracle"
      >
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `2px solid ${ACCENT}20`,
          animation: open ? 'none' : 'neonPulse 3s ease-in-out infinite',
        }} />
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <OracleOrb size={30} />
        )}
      </button>
    </div>
  );
}
