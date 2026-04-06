import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { voiceManager } from '../components/voice/WebSpeechVoiceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    loadData();
    initializeSpeechRecognition();
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (e) => {
        const transcript = Array.from(e.results).map(result => result[0].transcript).join('');
        setInput(transcript);
        
        // Auto-send after 1 second of speech ending
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (transcript.trim()) {
            sendMessage();
          }
        }, 1000);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }

      const voiceSettingsList = await base44.entities.VoiceSettings.filter({ created_by: currentUser.email });
      if (voiceSettingsList.length > 0) {
        setVoiceSettings(voiceSettingsList[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    const userMessage = { role: 'user', content: messageText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Check for intent routing using saved text
    const detectedPage = detectIntent(messageText);

    try {
      const result = await base44.functions.invoke('generateOracleResponse', {
        message: messageText,
        specialist: profile?.interpreter_mode ? 'interpreter' : 'chat',
        language: profile?.language || 'en'
      });

      const response = result?.data?.response || result?.response || (typeof result === 'string' ? result : 'I understand your request.');

      const oracleMessage = {
        role: 'oracle',
        content: detectedPage ? `${response}\n\nI've prepared the ${detectedPage} for you. Tap below to open it.` : response,
        timestamp: new Date().toISOString(),
        ...(detectedPage && { navigateTo: detectedPage })
      };

      setMessages(prev => [...prev, oracleMessage]);

      // Auto-speak if enabled
      if (voiceSettings?.auto_play) {
        setIsSpeaking(true);
        setTimeout(() => { speakText(response); setIsSpeaking(false); }, 300);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Standalone fallback: provide smart response with intent routing
      let fallbackResponse;
      if (detectedPage) {
        fallbackResponse = `Absolutely! I'll take you to the ${detectedPage} right away. Tap below to open it.`;
      } else {
        fallbackResponse = "I'm currently operating in offline mode. I can still help you navigate — try asking me to build an app, make a movie, generate a voice, or any other specialist task.";
      }

      setMessages(prev => [...prev, {
        role: 'oracle',
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
        ...(detectedPage && { navigateTo: detectedPage })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    // Check for saved Oracle voice from VoiceGenerator
    try {
      const savedVoice = localStorage.getItem('solace_oracle_voice');
      if (savedVoice) {
        const { voiceType } = JSON.parse(savedVoice);
        if (voiceType) {
          // Use the voiceSynthesis engine with the saved voice type
          import('../lib/voiceSynthesis').then(({ voiceSynthesis }) => {
            voiceSynthesis.speak(text, voiceType, { volume: voiceSettings?.volume || 1.0 });
          }).catch(() => {
            // Fallback to voiceManager
            voiceManager.speak(text, {
              language: profile?.language === 'en' ? 'en-US' : `${profile?.language}-${profile?.language?.toUpperCase()}`,
              gender: profile?.oracle_gender || 'female',
              pitch: voiceSettings?.pitch || 1.0,
              rate: voiceSettings?.rate || 1.0,
              volume: voiceSettings?.volume || 1.0
            });
          });
          return;
        }
      }
    } catch {}
    // Default: use voiceManager
    voiceManager.speak(text, {
      language: profile?.language === 'en' ? 'en-US' : `${profile?.language}-${profile?.language?.toUpperCase()}`,
      gender: profile?.oracle_gender || 'female',
      pitch: voiceSettings?.pitch || 1.0,
      rate: voiceSettings?.rate || 1.0,
      volume: voiceSettings?.volume || 1.0
    });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      sendMessage();
    }
  };



  // Intent routing: detect specialist commands and navigate
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

  const showMessages = messages.length > 0;

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #0a0a1a 60%, #050510 100%)' }}>
      {/* Ambient particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i} className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, background: i%3===0 ? 'rgba(236,72,153,0.5)' : i%3===1 ? 'rgba(168,85,247,0.5)' : 'rgba(34,211,238,0.4)' }}
          animate={{ y: [0,-80,0], opacity: [0,1,0] }}
          transition={{ duration: 4+Math.random()*4, repeat: Infinity, delay: Math.random()*4, ease: 'easeInOut' }}
        />
      ))}

      {/* ORACLE ORB — large, centered, always visible */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative" style={{ width: showMessages ? '220px' : '380px', height: showMessages ? '220px' : '380px', transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' }}>
          {/* Outer glow rings */}
          {[0,1,2,3].map(r => (
            <motion.div
              key={`ring-${r}`}
              className="absolute rounded-full border"
              style={{
                inset: -(20 + r * 30),
                borderColor: `rgba(236,72,153,${0.2 - r * 0.04})`,
                boxShadow: `0 0 ${20+r*10}px rgba(236,72,153,${0.1 - r*0.02})`,
              }}
              animate={loading || isSpeaking ? { scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] } : { scale: [1, 1.05, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 1.5 + r * 0.4, repeat: Infinity, ease: 'easeInOut', delay: r * 0.2 }}
            />
          ))}
          {/* Main orb body */}
          <motion.div
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.5) 0%, rgba(168,85,247,0.4) 40%, rgba(88,28,135,0.6) 70%, rgba(15,10,30,0.9) 100%)',
              boxShadow: '0 0 80px rgba(236,72,153,0.4), 0 0 160px rgba(168,85,247,0.2), inset 0 0 60px rgba(236,72,153,0.3)',
            }}
            animate={loading ? { scale: [1, 1.06, 1] } : { scale: [1, 1.02, 1] }}
            transition={{ duration: loading ? 1.2 : 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Inner shine */}
            <div className="absolute top-[15%] left-[20%] w-[35%] h-[25%] rounded-full bg-white/20 blur-xl" />
            <div className="absolute top-[25%] left-[30%] w-[15%] h-[10%] rounded-full bg-white/40 blur-md" />
            {/* Core energy */}
            <motion.div
              className="absolute inset-[20%] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.6) 0%, rgba(168,85,247,0.3) 50%, transparent 70%)' }}
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: loading ? 0.8 : 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Speech ripples */}
            {(loading || isSpeaking) && [0,1,2].map(r => (
              <motion.div
                key={`speak-${r}`}
                className="absolute rounded-full border-2 border-pink-400/40"
                style={{ inset: `${10+r*8}%` }}
                animate={{ scale: [0.9, 1.4, 0.9], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 0.8 + r*0.3, repeat: Infinity, ease: 'easeOut', delay: r*0.15 }}
              />
            ))}
          </motion.div>
          {/* Label under orb */}
          {!showMessages && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
            >
              <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">ORACLE</div>
              <div className="text-xs text-zinc-500 mt-1">Ask me anything or give me a task</div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="p-3 flex items-center justify-between" style={{ background: 'rgba(5,5,16,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(236,72,153,0.1)' }}>
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-sm font-mono text-pink-400/80 tracking-widest">ORACLE INTERFACE</div>
          <div className="w-20" />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-3" style={{ paddingTop: showMessages ? '0' : '55vh' }}>
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[80%]">
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-pink-600/80 text-white rounded-br-sm'
                        : 'bg-white/10 text-zinc-200 border border-white/10 rounded-bl-sm backdrop-blur-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.navigateTo && (
                        <button
                          onClick={() => {
                            const event = new CustomEvent('solace-navigate', { detail: { page: msg.navigateTo } });
                            window.dispatchEvent(event);
                          }}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-pink-500/30 border border-pink-400/40 text-pink-200 text-xs font-semibold hover:bg-pink-500/50 transition"
                        >
                          Open {msg.navigateTo} →
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <motion.div className="w-2 h-2 rounded-full bg-pink-400" animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-cyan-400" animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="p-4" style={{ background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(236,72,153,0.1)' }}>
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask the Oracle anything..."
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-pink-500/50"
              disabled={loading}
            />
            <Button
              onClick={toggleVoiceInput}
              variant="outline"
              className={`px-3 border-white/10 ${
                isListening 
                  ? 'bg-red-500/80 text-white border-red-500' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}