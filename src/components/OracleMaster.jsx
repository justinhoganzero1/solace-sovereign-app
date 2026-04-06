import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Brain, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { base44 } from '../api/base44Client';

export default function OracleMaster({ onNavigate, onGoHome, minimal = false }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'oracle',
      content: 'Oracle online. Ask any question, or command: "open moviemaker", "open inventor", "open wellness".'
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

    if (lower.includes('movie') || lower.includes('film') || lower.includes('video')) {
      onNavigate?.('MovieMaker');
      return 'Opening MovieMaker now.';
    }

    if (lower.includes('inventor') || lower.includes('app') || lower.includes('build')) {
      onNavigate?.('Inventor');
      return 'Opening Inventor now.';
    }

    if (lower.includes('wellness') || lower.includes('health') || lower.includes('meditation')) {
      onNavigate?.('WellnessCenter');
      return 'Opening Wellness Center now.';
    }

    if (lower.includes('diagnos') || lower.includes('repair') || lower.includes('fix') || lower.includes('broken') || lower.includes('not working')) {
      onNavigate?.('DiagnosticCenter');
      return 'Opening Diagnostic Center — running self-repair scan now.';
    }

    if (lower.includes('marketing') || lower.includes('campaign') || lower.includes('sms') || lower.includes('email blast') || lower.includes('send message') || lower.includes('sentiment')) {
      onNavigate?.('MarketingHub');
      return 'Opening Marketing Hub — SMS, Email, Voice campaigns and sentiment analysis ready.';
    }

    if (lower.includes('home') || lower.includes('dashboard')) {
      onGoHome?.();
      return 'Returning to dashboard now.';
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
