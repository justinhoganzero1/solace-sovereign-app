import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { voiceManager } from '../components/voice/WebSpeechVoiceUtils';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await base44.functions.invoke('generateOracleResponse', {
        message: input,
        specialist: profile?.interpreter_mode ? 'interpreter' : 'chat',
        language: profile?.language || 'en'
      });

      const response = data.response;

      const oracleMessage = {
        role: 'oracle',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, oracleMessage]);

      // Auto-speak if enabled
      if (voiceSettings?.auto_play) {
        setTimeout(() => speakText(response), 300);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = error.message.includes('401') 
                           ? "I'm having trouble identifying you. Please try refreshing the page." 
                           : "I apologize, I'm having trouble connecting to the Oracle network. Please try again.";

      setMessages(prev => [...prev, {
        role: 'oracle',
        content: errorMessage,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    voiceManager.speak(text, {
      language: profile?.language === 'en' ? 'en-US' : `${profile?.language}-${profile?.language.toUpperCase()}`,
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



  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Full-screen animated Oracle background */}
      <div className="fixed inset-0 z-0">
        <AnimatedOracle 
          gender={profile?.oracle_gender || 'female'}
          isSpeaking={loading}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-4 bg-gradient-to-r from-amber-900/80 to-yellow-800/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Oracle Chat</h1>
            <div className="w-24" />
          </div>
        </div>



        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="space-y-2 max-w-[80%]">
                    <Card className={`p-4 ${
                       msg.role === 'user'
                         ? 'bg-amber-600/90 text-white border-amber-400'
                         : 'bg-white/95 text-gray-900 border-yellow-300'
                     } backdrop-blur-sm`}>
                       <p className="whitespace-pre-wrap">{msg.content}</p>
                     </Card>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <Card className="p-4 bg-white/95 backdrop-blur-sm border-yellow-300">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                </Card>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-amber-900/80 to-yellow-800/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Speak with the Oracle..."
              className="flex-1 bg-white/95 border-yellow-300 text-lg"
              disabled={loading}
            />
            <Button
              onClick={toggleVoiceInput}
              variant="outline"
              className={`px-4 transition-all ${
                isListening 
                  ? 'bg-red-500 text-white border-red-600' 
                  : 'bg-white/90'
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`px-8 text-white transition-all ${
                loading || !input.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
              }`}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}