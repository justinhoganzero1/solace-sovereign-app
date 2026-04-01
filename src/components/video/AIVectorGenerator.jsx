import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

export default function AIVectorGenerator({ onGenerate, setLoading }) {
  const [description, setDescription] = useState('');
  const [colorPalette, setColorPalette] = useState('vibrant');
  const [complexity, setComplexity] = useState(5);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      const result = await base44.functions.invoke('lumaVectorGenerator', {
        description: description,
        color_palette: colorPalette,
        complexity: complexity
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
        <h3 className="text-white font-bold mb-4">AI Vector Generator</h3>
        
        <div className="space-y-4">
          <Input
            placeholder="Describe your vector illustration..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
          />

          <div>
            <label className="text-white text-sm mb-2 block">Color Palette</label>
            <select
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className="w-full bg-white/20 border border-white/30 text-white rounded-lg p-2"
            >
              <option value="vibrant">Vibrant</option>
              <option value="pastel">Pastel</option>
              <option value="monochrome">Monochrome</option>
              <option value="warm">Warm Tones</option>
              <option value="cool">Cool Tones</option>
            </select>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Complexity: {complexity}</label>
            <Slider
              value={[complexity]}
              onValueChange={(val) => setComplexity(val[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!description.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600"
          >
            Generate Vector
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}