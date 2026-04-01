import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '../utils';
import { ArrowLeft, Play, Square, Download, Loader2, Mic, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { voiceSynthesis } from '../lib/voiceSynthesis';

export default function VoiceGenerator() {
  const [text, setText] = useState('');
  const [voiceType, setVoiceType] = useState('professional_female');
  const [voiceCategory, setVoiceCategory] = useState('human');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState({ human: [], party: [] });

  useEffect(() => {
    const voices = voiceSynthesis.getAvailableVoices();
    setAvailableVoices(voices);
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
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black">
      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home', { appFace: 'solace', from: 'VoiceGenerator' })}>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
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
              Human-quality voice synthesis with party voices - all generated in-app
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
                      <div className="text-xs opacity-80">Fun effects and characters</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">
                  {voiceCategory === 'human' ? 'Human Voice Type' : 'Party Voice Effect'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableVoices[voiceCategory].map((voice) => (
                    <Button
                      key={voice}
                      onClick={() => setVoiceType(voice)}
                      className={`h-auto py-3 text-left ${voiceType === voice ? 'bg-pink-600 border-2 border-pink-400' : 'bg-gray-800 border border-gray-600'}`}
                    >
                      <div className="text-sm font-bold capitalize">
                        {voice.replace(/_/g, ' ')}
                      </div>
                    </Button>
                  ))}
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
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500">
            <CardContent className="p-4">
              <h3 className="text-blue-300 font-bold mb-2">✨ Features</h3>
              <ul className="text-blue-100/90 text-sm space-y-1 list-disc list-inside">
                <li>Human-quality voice synthesis with natural prosody and vibrato</li>
                <li>6 professional human voices (male/female, casual/formal/narrator)</li>
                <li>6 party voices (robot, chipmunk, monster, alien, echo, whisper)</li>
                <li>Advanced formant synthesis for realistic vocal characteristics</li>
                <li>Breathiness, pitch variation, and rhythm humanization</li>
                <li>All processing done in-app - no external API dependencies</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
