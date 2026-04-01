import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scissors, Music, Type, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function VideoEditingTools({ videoUrl, onSave }) {
  const [loading, setLoading] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [textOverlay, setTextOverlay] = useState('');
  const [selectedMusic, setSelectedMusic] = useState('upbeat');
  const [captions, setCaptions] = useState([]);

  const musicOptions = [
    { value: 'upbeat', label: '🎵 Upbeat' },
    { value: 'calm', label: '🎼 Calm' },
    { value: 'dramatic', label: '🎭 Dramatic' },
    { value: 'energetic', label: '⚡ Energetic' },
    { value: 'ambient', label: '🌊 Ambient' }
  ];

  const handleGenerateCaptions = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('generateCaptions', {
        video_url: videoUrl
      });
      setCaptions(result.data.captions || []);
    } catch (error) {
      console.error('Error generating captions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMusic = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('generateBackgroundMusic', {
        mood: selectedMusic,
        duration: 30
      });
      alert(`Music added: ${result.data.music_url}`);
    } catch (error) {
      console.error('Error adding music:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="bg-white/10 border-white/20 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Scissors className="w-5 h-5" />
          Video Editing Tools
        </h3>

        <Tabs defaultValue="captions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="captions" className="text-white data-[state=active]:bg-purple-600">
              Captions
            </TabsTrigger>
            <TabsTrigger value="music" className="text-white data-[state=active]:bg-purple-600">
              Music
            </TabsTrigger>
            <TabsTrigger value="text" className="text-white data-[state=active]:bg-purple-600">
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="captions" className="space-y-4 mt-4">
            <Button
              onClick={handleGenerateCaptions}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Generating...' : 'Auto-Generate Captions'}
            </Button>
            
            {captions.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 max-h-64 overflow-y-auto">
                {captions.map((caption, idx) => (
                  <div key={idx} className="text-white text-sm mb-2 flex gap-2">
                    <span className="text-purple-400">{caption.time}</span>
                    <span>{caption.text}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="music" className="space-y-4 mt-4">
            <label className="text-white text-sm block">Select Music Mood</label>
            <div className="grid grid-cols-2 gap-2">
              {musicOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMusic(option.value)}
                  className={`p-3 rounded-lg transition-all ${
                    selectedMusic === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              onClick={handleAddMusic}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Music className="w-4 h-4 mr-2" />
              Add Background Music
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 mt-4">
            <label className="text-white text-sm block">Text Overlay</label>
            <Input
              placeholder="Enter text to overlay on video..."
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
            />
            <Button
              disabled={!textOverlay}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Type className="w-4 h-4 mr-2" />
              Add Text Overlay
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}