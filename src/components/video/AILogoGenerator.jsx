import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function generateLocalLogo(text, style) {
  const seed = (text + style).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = seed % 360;
  const hue2 = (hue + 60) % 360;
  const initial = (text.match(/\b\w/g) || ['S']).slice(0, 3).join('').toUpperCase();
  const safeName = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').substring(0, 20);

  const shapes = {
    modern: `<circle cx="256" cy="200" r="80" fill="none" stroke="hsl(${hue},70%,55%)" stroke-width="4"/><text x="256" y="220" text-anchor="middle" fill="hsl(${hue},70%,60%)" font-size="60" font-weight="900" font-family="system-ui">${initial}</text>`,
    minimalist: `<rect x="186" y="140" width="140" height="140" rx="20" fill="none" stroke="hsl(${hue},50%,50%)" stroke-width="2"/><text x="256" y="225" text-anchor="middle" fill="hsl(${hue},50%,55%)" font-size="48" font-weight="300" font-family="system-ui">${initial}</text>`,
    vintage: `<circle cx="256" cy="200" r="90" fill="none" stroke="hsl(${hue},30%,45%)" stroke-width="3"/><circle cx="256" cy="200" r="75" fill="none" stroke="hsl(${hue},30%,45%)" stroke-width="1"/><text x="256" y="215" text-anchor="middle" fill="hsl(${hue},30%,50%)" font-size="40" font-weight="700" font-family="Georgia,serif">${initial}</text><text x="256" y="245" text-anchor="middle" fill="hsl(${hue},20%,40%)" font-size="10" font-family="Georgia,serif" letter-spacing="6">EST. 2025</text>`,
    abstract: `<polygon points="256,120 340,280 172,280" fill="none" stroke="hsl(${hue},80%,55%)" stroke-width="3"/><polygon points="256,140 320,260 192,260" fill="hsl(${hue},80%,55%)" opacity="0.15"/><text x="256" y="240" text-anchor="middle" fill="hsl(${hue},80%,60%)" font-size="36" font-weight="800" font-family="system-ui">${initial}</text>`,
    playful: `<rect x="176" y="130" width="160" height="160" rx="40" fill="hsl(${hue},70%,55%)" opacity="0.2"/><rect x="186" y="140" width="140" height="140" rx="32" fill="hsl(${hue2},70%,55%)" opacity="0.2"/><text x="256" y="225" text-anchor="middle" fill="hsl(${hue},70%,60%)" font-size="56" font-weight="900" font-family="system-ui">${initial}</text>`,
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="hsl(${hue},10%,8%)" rx="24"/>
    <rect x="20" y="20" width="472" height="472" rx="16" fill="none" stroke="hsl(${hue},30%,15%)" stroke-width="1"/>
    ${shapes[style] || shapes.modern}
    <text x="256" y="340" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="18" font-weight="600" font-family="system-ui">${safeName}</text>
    <text x="256" y="370" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="10" font-family="monospace" letter-spacing="4">AI LOGO • SOLACE</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function AILogoGenerator({ onGenerate, setLoading }) {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const [localImage, setLocalImage] = useState(null);

  const styleOptions = [
    { id: 'modern', label: 'Modern', emoji: '🔷' },
    { id: 'minimalist', label: 'Minimalist', emoji: '⬜' },
    { id: 'vintage', label: 'Vintage', emoji: '📜' },
    { id: 'abstract', label: 'Abstract', emoji: '🔺' },
    { id: 'playful', label: 'Playful', emoji: '🎨' },
  ];

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setGenerating(true);
    setLocalImage(null);

    try {
      const result = await base44.functions.invoke('lumaLogoGenerator', { description, style });
      const url = result?.data?.image_url || result?.data?.url;
      if (url) { onGenerate({ type: 'image', url }); setLoading(false); setGenerating(false); return; }
    } catch (err) {
      console.warn('Cloud logo API unavailable, using local generation:', err.message);
    }

    try {
      const imgUrl = generateLocalLogo(description, style);
      setLocalImage(imgUrl);
      onGenerate({ type: 'image', url: imgUrl });
    } catch (err) { console.error('Local logo generation failed:', err); }
    finally { setLoading(false); setGenerating(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="bg-white/10 border-white/20 p-6">
        <h3 className="text-white font-bold mb-4">AI Logo Generator</h3>
        <div className="space-y-4">
          <Input placeholder="Describe your logo (e.g., 'tech startup named Nexus')..."
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />

          <div>
            <label className="text-white/60 text-xs mb-2 block">Logo Style</label>
            <div className="grid grid-cols-5 gap-2">
              {styleOptions.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`p-2 rounded-lg text-xs font-medium text-center transition-all ${style === s.id
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  <div className="text-lg mb-0.5">{s.emoji}</div>{s.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={!description.trim() || generating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 h-12">
            {generating ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Generating Logo...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Generate Logo</span>
            )}
          </Button>

          {localImage && (
            <div className="mt-4 rounded-xl overflow-hidden border border-purple-500/30">
              <img src={localImage} alt="Generated logo" className="w-full bg-black" />
              <div className="p-3 bg-purple-900/30 text-center">
                <p className="text-xs text-purple-300">AI-generated {style} logo</p>
                <a href={localImage} download={`logo_${Date.now()}.svg`}
                  className="text-xs text-purple-400 hover:text-purple-200 underline mt-1 inline-block">Download SVG</a>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}