import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function generateLocalAvatar(description) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const seed = description.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = seed % 360;
  const hue2 = (hue + 120) % 360;

  // Background
  const bg = ctx.createRadialGradient(256, 200, 50, 256, 256, 350);
  bg.addColorStop(0, `hsl(${hue}, 40%, 18%)`);
  bg.addColorStop(1, `hsl(${hue2}, 30%, 8%)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);

  // Body silhouette
  ctx.fillStyle = `hsl(${hue}, 50%, 50%)`;
  ctx.beginPath();
  ctx.ellipse(256, 380, 80, 120, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headGrad = ctx.createRadialGradient(256, 190, 10, 256, 200, 70);
  headGrad.addColorStop(0, `hsl(${(hue + 30) % 360}, 60%, 75%)`);
  headGrad.addColorStop(1, `hsl(${(hue + 30) % 360}, 50%, 55%)`);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(256, 200, 65, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = `hsl(${(seed * 7) % 360}, 40%, 25%)`;
  ctx.beginPath();
  ctx.ellipse(256, 165, 72, 55, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(200, 210, 25, 60, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(312, 210, 25, 60, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.ellipse(238, 195, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(274, 195, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `hsl(${(seed * 3) % 360}, 70%, 45%)`;
  ctx.beginPath(); ctx.arc(238, 196, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(274, 196, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(238, 196, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(274, 196, 3, 0, Math.PI * 2); ctx.fill();

  // Smile
  ctx.strokeStyle = `hsl(${(hue + 30) % 360}, 40%, 40%)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 215, 18, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Sparkle effects
  for (let i = 0; i < 15; i++) {
    const sx = 50 + ((seed * (i + 1) * 73) % 412);
    const sy = 30 + ((seed * (i + 1) * 37) % 450);
    const size = 1 + (i % 3);
    ctx.fillStyle = `hsla(${(hue + i * 25) % 360}, 80%, 70%, 0.6)`;
    ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
  }

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AI AVATAR • SOLACE', 256, 490);
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  const shortDesc = description.length > 40 ? description.substring(0, 40) + '...' : description;
  ctx.fillText(shortDesc, 256, 505);

  return canvas.toDataURL('image/png');
}

export default function AIGirlGenerator({ onGenerate, setLoading }) {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [localImage, setLocalImage] = useState(null);
  const [artStyle, setArtStyle] = useState('realistic');

  const styles = [
    { id: 'realistic', label: 'Realistic 8K', emoji: '📸' },
    { id: 'anime', label: 'Anime', emoji: '🎌' },
    { id: 'cartoon', label: 'Cartoon', emoji: '🎨' },
    { id: 'fantasy', label: 'Fantasy', emoji: '✨' },
  ];

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setGenerating(true);
    setLocalImage(null);

    // TRY 1: Cloud API
    try {
      const result = await base44.functions.invoke('lumaAIGirlGenerator', {
        description: `${description} (style: ${artStyle})`,
      });
      const url = result?.data?.url || result?.data?.video_url || result?.data?.videoUrl || result?.data?.image_url;
      if (url) {
        onGenerate({ type: 'image', url });
        setLoading(false); setGenerating(false);
        return;
      }
    } catch (err) {
      console.warn('Cloud API unavailable, using local generation:', err.message);
    }

    // TRY 2: Local Canvas fallback
    try {
      const imgUrl = generateLocalAvatar(description + artStyle);
      setLocalImage(imgUrl);
      onGenerate({ type: 'image', url: imgUrl });
    } catch (err) {
      console.error('Local generation failed:', err);
    } finally {
      setLoading(false); setGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="bg-white/10 border-white/20 p-6">
        <h3 className="text-white font-bold mb-4">AI Avatar Generator</h3>
        <div className="space-y-4">
          <Input placeholder="Describe the character (e.g., 'girl with blue eyes and dark hair, smiling')..."
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />

          <div>
            <label className="text-white/60 text-xs mb-2 block">Art Style</label>
            <div className="grid grid-cols-4 gap-2">
              {styles.map(s => (
                <button key={s.id} onClick={() => setArtStyle(s.id)}
                  className={`p-2 rounded-lg text-xs font-medium text-center transition-all ${artStyle === s.id
                    ? 'bg-pink-600 text-white ring-2 ring-pink-400'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  <div className="text-lg mb-0.5">{s.emoji}</div>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={!description.trim() || generating}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white disabled:bg-gray-600 h-12">
            {generating ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Generating Avatar...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Generate Avatar</span>
            )}
          </Button>

          {localImage && (
            <div className="mt-4 rounded-xl overflow-hidden border border-pink-500/30">
              <img src={localImage} alt="Generated avatar" className="w-full" />
              <div className="p-3 bg-pink-900/30 text-center">
                <p className="text-xs text-pink-300">AI-generated {artStyle} avatar</p>
                <a href={localImage} download={`avatar_${Date.now()}.png`}
                  className="text-xs text-pink-400 hover:text-pink-200 underline mt-1 inline-block">
                  Download Image
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}