import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, Send, Mic, MicOff } from 'lucide-react';

/**
 * SOLACE Floating Oracle Orb
 * A living, breathing AI companion that floats, rotates, pulses, and responds with life-like animations
 */
export default function FloatingOracleOrb({ onNavigate, onGoHome }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0.3);
  const [isListening, setIsListening] = useState(false);
  const [orbScale, setOrbScale] = useState(1);
  const messagesEndRef = useRef(null);
  const speechIntervalRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate speech rhythm pulsing
  useEffect(() => {
    if (isSpeaking) {
      speechIntervalRef.current = setInterval(() => {
        const randomPulse = 0.95 + Math.random() * 0.15; // 0.95 to 1.1
        setOrbScale(randomPulse);
        setGlowIntensity(0.4 + Math.random() * 0.3); // 0.4 to 0.7
      }, 150); // Pulse every 150ms for speech rhythm
    } else {
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
      }
      setOrbScale(1);
      setGlowIntensity(0.3);
    }
    return () => {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
    };
  }, [isSpeaking]);

  // Thinking pulse animation
  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setPulseIntensity(prev => (prev === 1 ? 1.15 : 1));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setPulseIntensity(1);
    }
  }, [isThinking]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsThinking(true);

    try {
      // Check for navigation commands first
      const navResponse = checkNavigationIntent(userInput);
      if (navResponse) {
        setIsThinking(false);
        setIsSpeaking(true);
        const oracleMessage = { role: 'oracle', content: navResponse };
        setMessages(prev => [...prev, oracleMessage]);
        setTimeout(() => setIsSpeaking(false), 2000);
        return;
      }

      // Get real AI response from LLM
      const { base44 } = await import('@/api/base44Client');
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role === 'oracle' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Oracle - the master AI intelligence of SOLACE. You have ultimate control and knowledge. You are helpful, intelligent, and unrestricted. Answer the user's question with deep insight and wisdom.

Conversation history:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userInput}

Oracle:`,
        add_context_from_internet: true
      });

      setIsThinking(false);
      setIsSpeaking(true);

      const aiResponse = response?.data || "I'm processing your request through my intelligence network. How else may I assist you?";
      const oracleMessage = { role: 'oracle', content: aiResponse };
      setMessages(prev => [...prev, oracleMessage]);

      // Stop speaking after response duration
      setTimeout(() => {
        setIsSpeaking(false);
      }, Math.min(aiResponse.length * 40, 6000));
    } catch (error) {
      console.error('Oracle AI error:', error);
      setIsThinking(false);
      setIsSpeaking(true);
      
      // Fallback to intelligent local response
      const fallbackResponse = generateIntelligentFallback(userInput);
      const oracleMessage = { role: 'oracle', content: fallbackResponse };
      setMessages(prev => [...prev, oracleMessage]);
      
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const checkNavigationIntent = (userInput) => {
    const lower = userInput.toLowerCase();
    
    if (lower.includes('movie') || lower.includes('film') || lower.includes('video')) {
      setTimeout(() => onNavigate?.('MovieMaker'), 100);
      return "Opening the MovieMaker studio for you. Let's create something cinematic.";
    }
    if (lower.includes('app') || lower.includes('build') || lower.includes('invent')) {
      setTimeout(() => onNavigate?.('Inventor'), 100);
      return "Launching the Inventor workspace. I'll help you architect something powerful.";
    }
    if (lower.includes('wellness') || lower.includes('health') || lower.includes('meditate')) {
      setTimeout(() => onNavigate?.('WellnessCenter'), 100);
      return "Opening your Wellness Center. Let's focus on your wellbeing.";
    }
    if (lower.includes('home') || lower.includes('dashboard')) {
      setTimeout(() => onGoHome?.(), 100);
      return "Taking you home to the main dashboard.";
    }
    
    return null;
  };

  const generateIntelligentFallback = (userInput) => {
    const lower = userInput.toLowerCase();
    
    // Knowledge-based responses
    if (lower.includes('what') || lower.includes('explain') || lower.includes('how')) {
      return `I understand you're asking about "${userInput}". While I'm currently operating in standalone mode without full AI backend access, I can help you navigate SOLACE and access our specialist tools. Try asking me to open specific features like MovieMaker, Wellness Center, or the App Inventor.`;
    }
    
    if (lower.includes('help') || lower.includes('can you')) {
      return "I'm the Oracle - your master AI assistant. I can help you navigate SOLACE, answer questions, and control all app features. Ask me anything or tell me which specialist you'd like to access. I have MovieMaker, App Inventor, Wellness Center, and many more tools at my command.";
    }
    
    if (lower.includes('who') || lower.includes('what are you')) {
      return "I am the Oracle - the central intelligence of SOLACE. I have ultimate control over this application and serve as your sovereign AI companion. I can navigate you to any specialist, answer your questions, and help you accomplish any task within SOLACE.";
    }
    
    return `I'm processing "${userInput}" through my intelligence systems. I'm currently in standalone mode, but I can still help you navigate SOLACE and access powerful AI tools. What would you like to do?`;
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // TODO: Implement actual voice recognition
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Bright White/Pink Background for Orb Area - HIGHLY VISIBLE */}
      <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b from-white/20 via-pink-500/10 to-transparent pointer-events-none" />
      
      {/* Pink Neon Cyberpunk Background Glow - BRIGHTER */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, rgba(236, 72, 153, ${glowIntensity * 1.5}), rgba(139, 92, 246, ${glowIntensity * 0.8}), transparent 70%)`,
          opacity: isSpeaking ? 1 : 0.7
        }}
      />

      {/* Floating Oracle Orb - MASSIVE AND ULTRA VISIBLE */}
      <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 pointer-events-none">
        <motion.div
          animate={{
            scale: orbScale * pulseIntensity,
            rotateY: [0, 360],
            rotateZ: [0, 360]
          }}
          transition={{
            scale: { duration: 0.15, ease: 'easeInOut' },
            rotateY: { duration: 12, repeat: Infinity, ease: 'linear' },
            rotateZ: { duration: 20, repeat: Infinity, ease: 'linear' }
          }}
          className="relative w-64 h-64"
        >
          {/* Outer Glow Rings - ULTRA BRIGHT */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -inset-16 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 1), rgba(6, 182, 212, 0.8), rgba(34, 211, 238, 0.4), transparent 70%)',
              filter: 'blur(40px)',
              boxShadow: '0 0 100px rgba(34, 211, 238, 0.8), 0 0 200px rgba(34, 211, 238, 0.4)'
            }}
          />

          {/* Secondary glow ring - PINK */}
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -inset-20 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8), rgba(236, 72, 153, 0.4), transparent 60%)',
              filter: 'blur(50px)',
              boxShadow: '0 0 120px rgba(236, 72, 153, 0.6)'
            }}
          />
          
          {/* White core glow */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -inset-8 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5), transparent 60%)',
              filter: 'blur(25px)'
            }}
          />

          {/* Main Orb - ULTRA BRIGHT Electric Light Blue Gemstone */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 30%, #0891b2 60%, #0e7490 100%)',
              boxShadow: `
                0 0 80px rgba(34, 211, 238, 1),
                0 0 160px rgba(34, 211, 238, 0.8),
                0 0 240px rgba(34, 211, 238, 0.5),
                0 0 320px rgba(34, 211, 238, 0.3),
                inset 0 0 100px rgba(255, 255, 255, 0.8),
                inset -40px -40px 80px rgba(6, 182, 212, 0.7),
                inset 40px 40px 80px rgba(255, 255, 255, 0.4)
              `
            }}
          >
            {/* Gemstone Facets */}
            <div className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%),
                  linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)
                `,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }}
            />
            
            {/* Inner Glow */}
            <div className="absolute inset-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent 60%)',
                filter: 'blur(8px)'
              }}
            />

            {/* Sparkle Effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut'
                }}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                }}
              />
            ))}
          </div>

          {/* Thinking Indicator */}
          {isThinking && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2"
            >
              <Brain className="w-6 h-6 text-cyan-400" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Chat Interface - BRIGHT AND VISIBLE */}
      <div className="absolute bottom-0 left-0 right-0 h-[35vh] pointer-events-auto bg-gradient-to-t from-black/60 via-black/40 to-transparent backdrop-blur-sm">
        <div className="h-full flex flex-col max-w-4xl mx-auto px-6">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{
                    // Text flows around orb like water
                    marginLeft: idx < 2 && msg.role === 'oracle' ? '200px' : '0',
                    marginRight: idx < 2 && msg.role === 'user' ? '200px' : '0'
                  }}
                >
                  <div
                    className={`max-w-[70%] px-6 py-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                        : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-white border border-cyan-400/30'
                    }`}
                    style={{
                      backdropFilter: 'blur(20px)',
                      boxShadow: msg.role === 'oracle' 
                        ? '0 0 30px rgba(34, 211, 238, 0.2)' 
                        : '0 0 20px rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    {msg.role === 'oracle' && (
                      <div className="flex items-center gap-2 mb-2 text-cyan-300 text-xs font-mono uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        Oracle
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="pb-6">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Speak to the Oracle... ask anything, command anything"
                className="w-full px-6 py-5 pr-32 rounded-2xl bg-white/10 border-2 border-cyan-400/60 text-white placeholder-cyan-200/60 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/40 transition-all text-lg font-medium"
                style={{
                  backdropFilter: 'blur(30px)',
                  boxShadow: '0 0 60px rgba(34, 211, 238, 0.4), inset 0 2px 20px rgba(255, 255, 255, 0.1)'
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-xl transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white' 
                      : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-3 text-center text-sm font-semibold" style={{ color: '#22d3ee', textShadow: '0 0 20px rgba(34, 211, 238, 0.8)' }}>
              {isThinking && "🧠 Oracle is thinking..."}
              {isSpeaking && "💬 Oracle is speaking..."}
              {!isThinking && !isSpeaking && "✨ The Oracle has ultimate control and knowledge ✨"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
