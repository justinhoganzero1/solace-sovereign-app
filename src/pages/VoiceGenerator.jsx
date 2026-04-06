import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Square, Loader2, Mic, Volume2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceSynthesis } from '../lib/voiceSynthesis';

const PARTY_ICONS = { robot: '🤖', chipmunk: '🐿️', monster: '👹', alien: '👽', echo: '🔊', whisper: '👻' };
const HUMAN_ICONS = { professional_male: '🎙️', professional_female: '🎙️', casual_male: '😎', casual_female: '💬', narrator_male: '📖', narrator_female: '📖' };

export default function VoiceGenerator() {
  const [text, setText] = useState('');
  const [voiceType, setVoiceType] = useState('professional_female');
  const [voiceCategory, setVoiceCategory] = useState('human');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState({ human: [], party: [] });
  const [oracleVoice, setOracleVoice] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const voices = voiceSynthesis.getAvailableVoices();
    setAvailableVoices(voices);
    // Load saved oracle voice
    try {
      const saved = localStorage.getItem('solace_oracle_voice');
      if (saved) setOracleVoice(JSON.parse(saved));
    } catch {}
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setIsPlaying(true);

    try {
      await voiceSynthesis.speak(text, voiceType, {
        volume: 1.0,
        onStart: () => {
          console.log('Voice playback started');
        }
      });
    } catch (error) {
      console.error('Voice generation error:', error);
    } finally {
      setIsGenerating(false);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    voiceSynthesis.stop();
    setIsPlaying(false);
    setIsGenerating(false);
  };

  const setAsOracleVoice = () => {
    const voiceConfig = {
      voiceType,
      voiceCategory,
      label: voiceSynthesis.getVoiceLabel(voiceType),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('solace_oracle_voice', JSON.stringify(voiceConfig));
    setOracleVoice(voiceConfig);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="relative min-h-screen" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(88,28,135,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,0.2) 0%, transparent 50%), linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)' }}>
      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          {oracleVoice && (
            <div className="text-xs text-purple-300/70 font-mono flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Oracle Voice: {oracleVoice.label}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Volume2 className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              Voice Generator
            </h1>
            <p className="text-xl text-purple-200">
              Natural voice synthesis with dramatically unique party voices
            </p>
          </motion.div>

          <Card className="bg-gray-900/80 border-purple-500/50 mb-6">
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Voice Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      setVoiceCategory('human');
                      setVoiceType('professional_female');
                    }}
                    className={`h-auto py-4 ${voiceCategory === 'human' ? 'bg-purple-600 border-2 border-purple-400' : 'bg-gray-800 border border-gray-600'}`}
                  >
                    <div className="text-center">
                      <Mic className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-lg font-bold">Human Voices</div>
                      <div className="text-xs opacity-80">Natural, professional quality</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => {
                      setVoiceCategory('party');
                      setVoiceType('robot');
                    }}
                    className={`h-auto py-4 ${voiceCategory === 'party' ? 'bg-purple-600 border-2 border-purple-400' : 'bg-gray-800 border border-gray-600'}`}
                  >
                    <div className="text-center">
                      <Volume2 className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-lg font-bold">Party Voices</div>
                      <div className="text-xs opacity-80">Robot, Chipmunk, Monster & more</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">
                  {voiceCategory === 'human' ? 'Human Voice Type' : 'Party Voice Effect'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableVoices[voiceCategory]?.map((voice) => {
                    const icon = voiceCategory === 'party' ? PARTY_ICONS[voice] : HUMAN_ICONS[voice];
                    const label = voiceSynthesis.getVoiceLabel(voice);
                    const isOracleVoice = oracleVoice?.voiceType === voice;
                    return (
                      <Button
                        key={voice}
                        onClick={() => setVoiceType(voice)}
                        className={`h-auto py-3 text-left relative ${voiceType === voice ? 'bg-pink-600 border-2 border-pink-400' : 'bg-gray-800 border border-gray-600'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <div>
                            <div className="text-sm font-bold">{label}</div>
                            {isOracleVoice && (
                              <div className="text-[10px] text-purple-300 font-mono">ORACLE VOICE</div>
                            )}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">Text to Speak</label>
                <Textarea
                  placeholder="Enter the text you want to convert to speech..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-32 bg-gray-800 text-white border-gray-600"
                />
              </div>

              <div className="flex gap-3">
                {!isPlaying ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={!text.trim() || isGenerating}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Generate & Play
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleStop}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white h-14 text-lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </Button>
                )}
              </div>

              {/* SET AS ORACLE VOICE BUTTON */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={setAsOracleVoice}
                    className={`w-full h-14 text-lg font-bold transition-all ${
                      oracleVoice?.voiceType === voiceType
                        ? 'bg-emerald-600/80 border-2 border-emerald-400 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
                    }`}
                  >
                    {savedNotice ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Saved as Oracle Voice!
                      </>
                    ) : oracleVoice?.voiceType === voiceType ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Current Oracle Voice
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Set "{voiceSynthesis.getVoiceLabel(voiceType)}" as Oracle Voice
                      </>
                    )}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500">
            <CardContent className="p-4">
              <h3 className="text-blue-300 font-bold mb-2">✨ Features</h3>
              <ul className="text-blue-100/90 text-sm space-y-1 list-disc list-inside">
                <li>Browser-native voice synthesis for natural speech quality</li>
                <li>6 professional human voices (male/female, casual/formal/narrator)</li>
                <li>6 dramatically different party voices (Robot, Chipmunk, Monster, Alien, Echo, Whisper Ghost)</li>
                <li>Set any voice as the Oracle's voice with one tap</li>
                <li>Party voices use extreme pitch, rate, and audio characteristics — each sounds totally unique</li>
                <li>All processing done in-app using Web Speech API</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
