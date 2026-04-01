import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIGirlGenerator({ onGenerate, setLoading }) {
  const [description, setDescription] = useState('');

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      const result = await base44.functions.invoke('lumaAIGirlGenerator', {
        description: description
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
        <h3 className="text-white font-bold mb-4">AI Girl Generator</h3>
        
        <div className="space-y-4">
          <Input
            placeholder="Describe the character you want to generate..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
          />

          <Button
            onClick={handleGenerate}
            disabled={!description.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600"
          >
            Generate Girl Video
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}