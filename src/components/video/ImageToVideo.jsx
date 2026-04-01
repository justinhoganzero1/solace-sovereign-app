import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Upload, Sparkles } from 'lucide-react';

export default function ImageToVideo({ onGenerate, setLoading }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [motionPrompt, setMotionPrompt] = useState('');
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageFile || !motionPrompt.trim()) return;

    try {
      setLoading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
      
      const result = await base44.functions.invoke('lumaImageToVideo', {
        image_url: file_url,
        prompt: motionPrompt
      });

      const videoUrl = result.data.video_url || result.data.url || result.data.videoUrl;
      console.log('Image to Video generated:', videoUrl);
      
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
      console.error('Error generating video:', error);
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
      <h2 className="text-2xl font-bold text-white mb-6">Image to Video</h2>

      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-white font-semibold mb-3">Upload Image</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full max-h-48 rounded-lg object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white/50" />
                <p className="text-white/70">Click to upload image</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Motion Prompt */}
        <div>
          <label className="block text-white font-semibold mb-3">Motion Description</label>
          <textarea
            value={motionPrompt}
            onChange={(e) => setMotionPrompt(e.target.value)}
            placeholder="e.g., 'Camera zoom in slowly', 'Character walks forward', 'Ocean waves moving'..."
            className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!imageFile || !motionPrompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generate Video
        </button>
      </div>
    </motion.div>
  );
}