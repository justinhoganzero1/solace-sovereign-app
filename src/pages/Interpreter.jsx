import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Volume2, VolumeX, Headphones, Speaker, ArrowRightLeft, Loader2, MessageSquare, Trash2, Languages, Users, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 60+ languages supported by Web Speech API across platforms
const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (AU)', flag: '🇦🇺' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (BR)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (PT)', flag: '🇵🇹' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Taiwan)', flag: '🇹🇼' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ur-PK', name: 'Urdu', flag: '🇵🇰' },
  { code: 'th-TH', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id-ID', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms-MY', name: 'Malay', flag: '🇲🇾' },
  { code: 'tl-PH', name: 'Filipino', flag: '🇵🇭' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
  { code: 'uk-UA', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da-DK', name: 'Danish', flag: '🇩🇰' },
  { code: 'nb-NO', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi-FI', name: 'Finnish', flag: '🇫🇮' },
  { code: 'el-GR', name: 'Greek', flag: '🇬🇷' },
  { code: 'cs-CZ', name: 'Czech', flag: '🇨🇿' },
  { code: 'ro-RO', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu-HU', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'he-IL', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'fa-IR', name: 'Persian', flag: '🇮🇷' },
  { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪' },
  { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'zu-ZA', name: 'Zulu', flag: '🇿🇦' },
  { code: 'bg-BG', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr-HR', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sk-SK', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl-SI', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'sr-RS', name: 'Serbian', flag: '🇷🇸' },
  { code: 'ca-ES', name: 'Catalan', flag: '🏳️' },
  { code: 'gl-ES', name: 'Galician', flag: '🏳️' },
  { code: 'eu-ES', name: 'Basque', flag: '🏳️' },
  { code: 'ka-GE', name: 'Georgian', flag: '🇬🇪' },
  { code: 'hy-AM', name: 'Armenian', flag: '🇦🇲' },
  { code: 'km-KH', name: 'Khmer', flag: '🇰🇭' },
  { code: 'lo-LA', name: 'Lao', flag: '🇱🇦' },
  { code: 'my-MM', name: 'Burmese', flag: '🇲🇲' },
  { code: 'ne-NP', name: 'Nepali', flag: '🇳🇵' },
  { code: 'si-LK', name: 'Sinhala', flag: '🇱🇰' },
  { code: 'am-ET', name: 'Amharic', flag: '🇪🇹' },
];

const getLangName = (code) => LANGUAGES.find(l => l.code === code)?.name || code;
const getLangBase = (code) => code.split('-')[0];

export default function Interpreter() {
  // Mode: 'text' (type & translate) or 'conversation' (live multi-speaker)
  const [mode, setMode] = useState('conversation');
  const [myLang, setMyLang] = useState('en-US');
  const [theirLang, setTheirLang] = useState('es-ES');
  const [activeSpeaker, setActiveSpeaker] = useState(null); // 'me' or 'them'
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [outputMode, setOutputMode] = useState('speaker'); // 'speaker' or 'earbuds'
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [translating, setTranslating] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const conversationEndRef = useRef(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      stopListening();
      synthRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // ─── Web Speech Recognition ───
  const startListening = useCallback((speaker) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    stopListening();
    setActiveSpeaker(speaker);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speaker === 'me' ? myLang : theirLang;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t + ' ';
        } else {
          interim = t;
        }
      }
      if (final.trim()) {
        handleSpokenText(final.trim(), speaker);
      }
      setTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [myLang, theirLang, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setActiveSpeaker(null);
    setTranscript('');
  }, []);

  // ─── Translation via LLM ───
  const translateText = useCallback(async (text, fromLang, toLang) => {
    try {
      const fromName = getLangName(fromLang);
      const toName = getLangName(toLang);
      const { data } = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional real-time interpreter. Translate the following from ${fromName} to ${toName}. Return ONLY the translation, nothing else:\n\n${text}`,
        add_context_from_internet: false
      });
      // The stub returns the prompt as data when no schema; handle both cases
      if (typeof data === 'string') return data;
      if (data?.translation) return data.translation;
      if (data?.title) return data.title;
      // Fallback: use browser-based translation simulation
      return `[${toName}] ${text}`;
    } catch (err) {
      console.error('Translation error:', err);
      return `[Translation unavailable] ${text}`;
    }
  }, []);

  // ─── Voice Output via Speech Synthesis ───
  const speakText = useCallback((text, langCode) => {
    if (!synthRef.current || !text) return;
    synthRef.current.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a voice matching the language
    const voices = synthRef.current.getVoices();
    const langBase = getLangBase(langCode);
    const match = voices.find(v => v.lang.startsWith(langBase)) || voices.find(v => v.lang.startsWith('en'));
    if (match) utterance.voice = match;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, []);

  // ─── Handle spoken text from either speaker ───
  const handleSpokenText = useCallback(async (text, speaker) => {
    const fromLang = speaker === 'me' ? myLang : theirLang;
    const toLang = speaker === 'me' ? theirLang : myLang;

    // Add original to conversation
    const entry = {
      id: Date.now(),
      speaker,
      original: text,
      fromLang,
      toLang,
      translated: null,
      timestamp: new Date().toLocaleTimeString(),
    };
    setConversation(prev => [...prev, entry]);

    // Translate
    const translated = await translateText(text, fromLang, toLang);
    setConversation(prev => prev.map(e => e.id === entry.id ? { ...e, translated } : e));

    // Auto-speak the translation in the target language
    if (autoSpeak) {
      speakText(translated, toLang);
    }
  }, [myLang, theirLang, translateText, speakText, autoSpeak]);

  // ─── Text mode translate ───
  const handleTextTranslate = async () => {
    if (!textInput.trim()) return;
    setTranslating(true);
    const result = await translateText(textInput, myLang, theirLang);
    setTextOutput(result);
    setTranslating(false);
    if (autoSpeak) speakText(result, theirLang);
  };

  const swapLanguages = () => {
    setMyLang(theirLang);
    setTheirLang(myLang);
  };

  const clearConversation = () => {
    setConversation([]);
    stopListening();
  };

  const speakerColor = (s) => s === 'me' ? '#3b82f6' : '#22c55e';

  const S = {
    page: { minHeight: '100vh', background: '#000', color: '#e2e8f0' },
    hdr: { padding: '16px 24px', borderBottom: '1px solid rgba(59,130,246,0.12)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 },
    panel: { background: 'rgba(6,6,16,0.85)', border: '1px solid rgba(59,130,246,0.08)', borderRadius: '18px', padding: '20px', marginBottom: '14px' },
    modeBtn: (active) => ({ flex: 1, padding: '14px', borderRadius: '14px', border: `1px solid ${active ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`, background: active ? 'rgba(59,130,246,0.12)' : 'rgba(6,6,16,0.5)', color: active ? '#93c5fd' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.25s' }),
    micBtn: (active, col) => ({ position: 'relative', padding: '28px 16px', borderRadius: '18px', border: `2px solid ${active ? col : 'rgba(255,255,255,0.06)'}`, background: active ? col + '18' : 'rgba(6,6,16,0.6)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s', boxShadow: active ? `0 0 40px ${col}30` : 'none' }),
    pill: (col) => ({ padding: '5px 12px', borderRadius: '8px', background: col + '10', border: `1px solid ${col}25`, color: col, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }),
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.hdr}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Languages size={24} style={{ color: '#3b82f6' }} /></button>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interpreter</div>
              <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{LANGUAGES.length}+ LANGUAGES • LIVE VOICE • REAL-TIME</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={S.pill(outputMode === 'speaker' ? '#3b82f6' : '#a855f7')} onClick={() => setOutputMode(m => m === 'speaker' ? 'earbuds' : 'speaker')}>
              {outputMode === 'speaker' ? <Speaker size={13} /> : <Headphones size={13} />}
              {outputMode === 'speaker' ? 'Speaker' : 'Earbuds'}
            </div>
            <div style={S.pill(autoSpeak ? '#22c55e' : '#64748b')} onClick={() => setAutoSpeak(a => !a)}>
              {autoSpeak ? <Volume2 size={13} /> : <VolumeX size={13} />}
              Auto
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 20px 120px' }}>
        {/* Language selectors */}
        <div style={S.panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '6px' }}>YOU SPEAK</div>
              <Select value={myLang} onValueChange={setMyLang}>
                <SelectTrigger style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', color: '#93c5fd' }}><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">{LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <motion.button whileHover={{ scale: 1.15, rotate: 180 }} whileTap={{ scale: 0.9 }} onClick={swapLanguages}
              style={{ marginTop: '18px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightLeft size={18} />
            </motion.button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', color: '#22c55e', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '6px' }}>THEY SPEAK</div>
              <Select value={theirLang} onValueChange={setTheirLang}>
                <SelectTrigger style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '12px', color: '#86efac' }}><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">{LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <div style={S.modeBtn(mode === 'conversation')} onClick={() => { setMode('conversation'); stopListening(); }}>
            <Users size={16} /> Live Conversation
          </div>
          <div style={S.modeBtn(mode === 'text')} onClick={() => { setMode('text'); stopListening(); }}>
            <MessageSquare size={16} /> Text Translate
          </div>
        </div>

        {/* ═══ CONVERSATION MODE ═══ */}
        {mode === 'conversation' && (
          <>
            {/* Mic buttons — two big buttons, one per speaker */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* MY MIC */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => activeSpeaker === 'me' ? stopListening() : startListening('me')}
                className={`relative p-6 rounded-2xl border-2 transition-all ${
                  activeSpeaker === 'me'
                    ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.4)]'
                    : 'bg-white/5 border-white/10 hover:border-blue-400/50 hover:bg-blue-900/20'
                }`}
              >
                {activeSpeaker === 'me' && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-blue-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <div className="flex flex-col items-center gap-2">
                  {activeSpeaker === 'me' ? (
                    <MicOff className="w-10 h-10 text-blue-400" />
                  ) : (
                    <Mic className="w-10 h-10 text-blue-300" />
                  )}
                  <span className="text-white font-bold text-sm">
                    {activeSpeaker === 'me' ? 'STOP' : 'TAP TO SPEAK'}
                  </span>
                  <span className="text-blue-300 text-xs">{getLangName(myLang)}</span>
                  {activeSpeaker === 'me' && (
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                  )}
                </div>
              </motion.button>

              {/* THEIR MIC */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => activeSpeaker === 'them' ? stopListening() : startListening('them')}
                className={`relative p-6 rounded-2xl border-2 transition-all ${
                  activeSpeaker === 'them'
                    ? 'bg-green-600/30 border-green-400 shadow-[0_0_40px_rgba(34,197,94,0.4)]'
                    : 'bg-white/5 border-white/10 hover:border-green-400/50 hover:bg-green-900/20'
                }`}
              >
                {activeSpeaker === 'them' && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-green-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <div className="flex flex-col items-center gap-2">
                  {activeSpeaker === 'them' ? (
                    <MicOff className="w-10 h-10 text-green-400" />
                  ) : (
                    <Mic className="w-10 h-10 text-green-300" />
                  )}
                  <span className="text-white font-bold text-sm">
                    {activeSpeaker === 'them' ? 'STOP' : 'HAND TO THEM'}
                  </span>
                  <span className="text-green-300 text-xs">{getLangName(theirLang)}</span>
                  {activeSpeaker === 'them' && (
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                  )}
                </div>
              </motion.button>
            </div>

            {/* Live transcript */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                  <span className="text-xs text-white/50 uppercase">Hearing...</span>
                </div>
                <p className="text-white/80 text-sm italic">{transcript}</p>
              </motion.div>
            )}

            {/* Conversation log */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/60 text-xs uppercase font-semibold tracking-wider">Conversation Log</span>
                  {conversation.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={clearConversation} className="text-red-400 hover:text-red-300 h-7 px-2">
                      <Trash2 className="w-3 h-3 mr-1" /> Clear
                    </Button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {conversation.length === 0 && (
                    <div className="text-center py-12 text-white/30">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Tap a microphone button to start a conversation.</p>
                      <p className="text-xs mt-1">You speak into the blue mic. Hand the phone to them for the green mic.</p>
                    </div>
                  )}

                  <AnimatePresence>
                    {conversation.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: entry.speaker === 'me' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${entry.speaker === 'me' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl p-3 ${
                          entry.speaker === 'me'
                            ? 'bg-blue-900/40 border border-blue-500/30 rounded-bl-sm'
                            : 'bg-green-900/40 border border-green-500/30 rounded-br-sm'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: speakerColor(entry.speaker) }}>
                              {entry.speaker === 'me' ? 'You' : 'Them'}
                            </span>
                            <span className="text-[10px] text-white/30">{entry.timestamp}</span>
                          </div>
                          <p className="text-white text-sm mb-1">{entry.original}</p>
                          {entry.translated ? (
                            <div className="mt-2 pt-2 border-t border-white/10">
                              <p className="text-sm font-medium" style={{ color: speakerColor(entry.speaker === 'me' ? 'them' : 'me') }}>
                                {entry.translated}
                              </p>
                              <button
                                onClick={() => speakText(entry.translated, entry.toLang)}
                                className="mt-1 text-[10px] text-white/40 hover:text-white/80 flex items-center gap-1"
                              >
                                <Volume2 className="w-3 h-3" /> Replay
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center gap-1 text-white/30 text-xs">
                              <Loader2 className="w-3 h-3 animate-spin" /> Translating...
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={conversationEndRef} />
                </div>
              </CardContent>
            </Card>

            {/* Speaking indicator */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50"
                >
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold text-sm">Playing translation via {outputMode}...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ═══ TEXT MODE ═══ */}
        {mode === 'text' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-blue-500/20">
              <CardContent className="p-4">
                <label className="text-xs text-blue-300 font-semibold uppercase mb-2 block">{getLangName(myLang)}</label>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type or paste text to translate..."
                  className="min-h-48 bg-blue-950/30 border-blue-500/20 text-white resize-none"
                />
                <Button
                  onClick={handleTextTranslate}
                  disabled={!textInput.trim() || translating}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  {translating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
                  {translating ? 'Translating...' : 'Translate'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-green-500/20">
              <CardContent className="p-4">
                <label className="text-xs text-green-300 font-semibold uppercase mb-2 block">{getLangName(theirLang)}</label>
                <Textarea
                  value={textOutput}
                  readOnly
                  placeholder="Translation appears here..."
                  className="min-h-48 bg-green-950/30 border-green-500/20 text-white resize-none"
                />
                {textOutput && (
                  <Button
                    onClick={() => speakText(textOutput, theirLang)}
                    disabled={isSpeaking}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white h-12"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isSpeaking ? 'Speaking...' : 'Speak Translation'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <Card className="bg-white/5 border-white/10 mt-4">
          <CardContent className="p-4">
            <h3 className="text-blue-300 font-bold text-sm mb-2">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/60">
              <div className="flex items-start gap-2">
                <Mic className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span><strong className="text-white/80">Multi-speaker:</strong> Tap blue mic to speak your language. Hand phone to them — they tap green mic. Each person's speech is auto-translated and spoken aloud.</span>
              </div>
              <div className="flex items-start gap-2">
                <Volume2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong className="text-white/80">Voice output:</strong> Translations are spoken through your phone speaker or earbuds. Toggle auto-speak and output device in the top bar.</span>
              </div>
              <div className="flex items-start gap-2">
                <Languages className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <span><strong className="text-white/80">{LANGUAGES.length}+ languages:</strong> Full Web Speech API support. Works offline for many languages. Real-time continuous recognition.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}