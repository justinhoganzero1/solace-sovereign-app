import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Upload, Sparkles } from 'lucide-react';

export default function VideoStyleTransfer({ onGenerate, setLoading }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [stylePrompt, setStylePrompt] = useState('');
  const fileInputRef = useRef(null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleGenerate = async () => {
    if (!videoFile || !stylePrompt.trim()) return;

    try {
      setLoading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
      
      const result = await base44.functions.invoke('lumaVideoStyleTransfer', {
        video_url: file_url,
        style_prompt: stylePrompt
      });

      const videoUrl = result.data.video_url || result.data.url || result.data.videoUrl;
      console.log('Style Transfer video generated:', videoUrl);

      if (!videoUrl) {
        alert('Error: No video URL returned. Check console for details.');
        console.error('Full response:', result.data);
        return;
      }

      onGenerate({
        url: videoUrl,
        type: 'video'
      });
    } catch (error) {
      console.error('Error generating styled video:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Video Style Transfer</h2>

      <div className="space-y-6">
        {/* Video Upload */}
        <div>
          <label className="block text-white font-semibold mb-3">Upload Video</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
          >
            {videoPreview ? (
              <video src={videoPreview} className="w-full max-h-48 rounded-lg" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white/50" />
                <p className="text-white/70">Click to upload video</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Style Prompt */}
        <div>
          <label className="block text-white font-semibold mb-3">Style Prompt</label>
          <textarea
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            placeholder="e.g., 'Oil painting style', 'Neon cyberpunk', 'Anime aesthetic'..."
            className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!videoFile || !stylePrompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generate Styled Video
        </button>
      </div>
    </motion.div>
  );
}