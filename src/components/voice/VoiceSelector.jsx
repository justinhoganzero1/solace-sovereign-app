import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Play, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VoiceSelector({ selectedVoiceId, onSelectVoice }) {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingVoice, setTestingVoice] = useState(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('getElevenLabsVoices');
      setVoices(result.data?.voices || []);
    } catch (error) {
      console.error('Error loading voices:', error);
      // Fallback to default voices if API fails
      setVoices(getDefaultVoices());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultVoices = () => [
    { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { accent: 'american', gender: 'female' } },
    { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', labels: { accent: 'american', gender: 'male' } },
    { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', labels: { accent: 'american', gender: 'male' } },
    { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Emily', labels: { accent: 'british', gender: 'female' } },
  ];

  const testVoice = async (voiceId, voiceName) => {
    setTestingVoice(voiceId);
    try {
      const result = await base44.functions.invoke('generateVoice', {
        text: `Hello, I am ${voiceName}. This is how I sound.`,
        voice_id: voiceId
      });
      
      if (result.data?.audio_url) {
        const audio = new Audio(result.data.audio_url);
        audio.play();
      }
    } catch (error) {
      console.error('Error testing voice:', error);
      alert('Voice test failed. Make sure backend functions are enabled in Dashboard > Settings.');
    } finally {
      setTestingVoice(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
        {voices.map((voice) => (
          <Card
            key={voice.voice_id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedVoiceId === voice.voice_id
                ? 'border-2 border-purple-600 bg-purple-50'
                : 'border border-gray-200'
            }`}
            onClick={() => onSelectVoice(voice.voice_id, voice.name)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-lg">{voice.name}</h4>
                <div className="flex gap-2 mt-1">
                  {voice.labels?.accent && (
                    <Badge variant="secondary" className="text-xs">
                      {voice.labels.accent}
                    </Badge>
                  )}
                  {voice.labels?.gender && (
                    <Badge variant="outline" className="text-xs">
                      {voice.labels.gender}
                    </Badge>
                  )}
                  {voice.labels?.age && (
                    <Badge variant="outline" className="text-xs">
                      {voice.labels.age}
                    </Badge>
                  )}
                </div>
              </div>
              {selectedVoiceId === voice.voice_id && (
                <Check className="w-5 h-5 text-purple-600" />
              )}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                testVoice(voice.voice_id, voice.name);
              }}
              disabled={testingVoice === voice.voice_id}
              className="w-full mt-2"
            >
              {testingVoice === voice.voice_id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test Voice
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}