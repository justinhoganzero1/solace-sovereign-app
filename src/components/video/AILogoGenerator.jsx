import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function AILogoGenerator({ onGenerate, setLoading }) {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern');

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      const result = await base44.functions.invoke('lumaLogoGenerator', {
        description: description,
        style: style
      });

      onGenerate({ type: 'image', url: result.data.image_url });
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
        <h3 className="text-white font-bold mb-4">AI Logo Generator</h3>
        
        <div className="space-y-4">
          <Input
            placeholder="Describe your logo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
          />

          <div>
            <label className="text-white text-sm mb-2 block">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-white/20 border border-white/30 text-white rounded-lg p-2"
            >
              <option value="modern">Modern</option>
              <option value="minimalist">Minimalist</option>
              <option value="vintage">Vintage</option>
              <option value="abstract">Abstract</option>
              <option value="playful">Playful</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!description.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600"
          >
            Generate Logo
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}