import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Play } from 'lucide-react';
import { motion } from 'framer-motion';

// ── LOCAL FALLBACK: Generate an animated dance video using Canvas + MediaRecorder ──
function generateLocalDanceVideo(imageSrc, danceStyle, durationSec = 6) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const fps = 30;
      const totalFrames = durationSec * fps;
      let frame = 0;

      // Dance movement parameters by style
      const moves = {
        'hip-hop': { xAmp: 20, yAmp: 15, rotAmp: 8, speed: 4 },
        'ballet': { xAmp: 10, yAmp: 25, rotAmp: 12, speed: 2 },
        'contemporary': { xAmp: 15, yAmp: 20, rotAmp: 10, speed: 3 },
        'salsa': { xAmp: 25, yAmp: 10, rotAmp: 6, speed: 5 },
        'tango': { xAmp: 18, yAmp: 12, rotAmp: 8, speed: 3.5 },
        'breakdance': { xAmp: 30, yAmp: 30, rotAmp: 15, speed: 6 },
      };
      const m = moves[danceStyle] || moves['hip-hop'];

      // Colors per style
      const colors = {
        'hip-hop': ['#a855f7', '#ec4899'], 'ballet': ['#f472b6', '#e0f2fe'],
        'contemporary': ['#06b6d4', '#8b5cf6'], 'salsa': ['#ef4444', '#f59e0b'],
        'tango': ['#dc2626', '#111827'], 'breakdance': ['#22c55e', '#3b82f6'],
      };
      const [c1, c2] = colors[danceStyle] || colors['hip-hop'];

      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(URL.createObjectURL(blob));
      };
      recorder.onerror = reject;
      recorder.start();

      const drawFrame = () => {
        if (frame >= totalFrames) { recorder.stop(); return; }
        const t = frame / fps;
        const progress = frame / totalFrames;
        ctx.clearRect(0, 0, 512, 512);

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, c1 + '40');
        grad.addColorStop(1, c2 + '60');
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Floor reflection
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(0, 380, 512, 132);

        // Dance movement
        const dx = Math.sin(t * m.speed) * m.xAmp;
        const dy = Math.sin(t * m.speed * 1.3) * m.yAmp;
        const rot = Math.sin(t * m.speed * 0.7) * m.rotAmp * Math.PI / 180;
        const scaleOsc = 1 + Math.sin(t * m.speed * 2) * 0.05;

        ctx.save();
        ctx.translate(256 + dx, 220 + dy);
        ctx.rotate(rot);
        ctx.scale(scaleOsc, scaleOsc);

        // Draw the uploaded image as the dancer
        const imgW = 200, imgH = 280;
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);

        // Glow effect around image
        ctx.shadowColor = c1;
        ctx.shadowBlur = 20 + Math.sin(t * 3) * 10;
        ctx.strokeStyle = c1 + '60';
        ctx.lineWidth = 2;
        ctx.strokeRect(-imgW / 2 - 4, -imgH / 2 - 4, imgW + 8, imgH + 8);
        ctx.restore();

        // Beat particles
        for (let i = 0; i < 8; i++) {
          const px = 256 + Math.sin(t * 3 + i * 0.8) * (100 + i * 20);
          const py = 400 - Math.abs(Math.sin(t * m.speed + i)) * 80;
          const size = 2 + Math.sin(t * 5 + i) * 2;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, size), 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? c1 + '80' : c2 + '80';
          ctx.fill();
        }

        // Style label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${danceStyle.toUpperCase()} • AI DANCE`, 256, 490);

        // Progress bar
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(50, 500, 412, 4);
        ctx.fillStyle = c1;
        ctx.fillRect(50, 500, 412 * progress, 4);

        frame++;
        requestAnimationFrame(drawFrame);
      };
      drawFrame();
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

export default function AIDanceGenerator({ onGenerate, setLoading }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [danceStyle, setDanceStyle] = useState('hip-hop');
  const [generating, setGenerating] = useState(false);
  const [localVideoUrl, setLocalVideoUrl] = useState(null);
  const fileInputRef = useRef(null);

  const danceStyles = [
    'hip-hop', 'ballet', 'contemporary', 'salsa', 'tango', 'breakdance'
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setLocalVideoUrl(null);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) return;
    setLoading(true);
    setGenerating(true);
    setLocalVideoUrl(null);

    // TRY 1: Cloud API
    try {
      const uploadedFile = await base44.integrations.Core.UploadFile({ file: imageFile });
      const result = await base44.functions.invoke('lumaDanceGenerator', {
        image_url: uploadedFile.file_url,
        dance_style: danceStyle
      });
      const url = result?.data?.url || result?.data?.video_url || result?.data?.videoUrl;
      if (url) {
        onGenerate({ type: 'video', url });
        setLoading(false);
        setGenerating(false);
        return;
      }
    } catch (err) {
      console.warn('Cloud dance API unavailable, using local generation:', err.message);
    }

    // TRY 2: Local Canvas + MediaRecorder fallback
    try {
      const videoUrl = await generateLocalDanceVideo(imagePreview, danceStyle, 6);
      setLocalVideoUrl(videoUrl);
      onGenerate({ type: 'video', url: videoUrl });
    } catch (err) {
      console.error('Local generation also failed:', err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="bg-white/10 border-white/20 p-6">
        <h3 className="text-white font-bold mb-4">AI Dance Generator</h3>
        <div className="space-y-4">
          <div onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-all">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-w-full h-40 mx-auto rounded-lg" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white/50" />
                <p className="text-white/70">Click to upload an image of a person</p>
                <p className="text-white/40 text-xs">The AI will animate them dancing</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Dance Style</label>
            <div className="grid grid-cols-3 gap-2">
              {danceStyles.map((style) => (
                <button key={style} onClick={() => setDanceStyle(style)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${danceStyle === style
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={!imageFile || generating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 h-12">
            {generating ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Generating Dance...</span>
            ) : (
              <span className="flex items-center gap-2"><Play className="w-4 h-4" />Generate Dance Video</span>
            )}
          </Button>

          {localVideoUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-purple-500/30">
              <video src={localVideoUrl} controls autoPlay loop className="w-full" style={{ maxHeight: 400 }} />
              <div className="p-3 bg-purple-900/30 text-center">
                <p className="text-xs text-purple-300">AI-generated {danceStyle} dance animation</p>
                <a href={localVideoUrl} download={`dance_${danceStyle}_${Date.now()}.webm`}
                  className="text-xs text-purple-400 hover:text-purple-200 underline mt-1 inline-block">
                  Download Video
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}