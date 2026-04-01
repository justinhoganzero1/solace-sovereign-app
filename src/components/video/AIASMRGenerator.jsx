import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AIASMRGenerator({ onGenerate, setLoading }) {
  const [asmrType, setAsmrType] = useState('tapping');
  const [duration, setDuration] = useState(30);

  const asmrTypes = [
    { id: 'tapping', label: 'Tapping', icon: '🔨' },
    { id: 'whispering', label: 'Whispering', icon: '🤫' },
    { id: 'rainfall', label: 'Rainfall', icon: '🌧️' },
    { id: 'crackling', label: 'Crackling', icon: '🔥' },
    { id: 'typing', label: 'Typing', icon: '⌨️' },
    { id: 'nature', label: 'Nature Sounds', icon: '🌿' }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('lumaASMRGenerator', {
        asmr_type: asmrType,
        duration: duration
      });

      onGenerate({ type: 'video', url: result.data.url || result.data.video_url || result.data.videoUrl });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-white/10 border-white/20 p-6">
        <h3 className="text-white font-bold mb-4">AI ASMR Video Generator</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm mb-3 block">Select ASMR Type</label>
            <div className="grid grid-cols-2 gap-3">
              {asmrTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setAsmrType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    asmrType === type.id
                      ? 'border-purple-400 bg-purple-400/20'
                      : 'border-white/20 bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <p className="text-white text-sm font-medium">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Duration: {duration}s</label>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Generate ASMR Video
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}