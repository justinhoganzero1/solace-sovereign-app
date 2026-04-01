import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIVideoFilter({ onGenerate, setLoading }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [filterStyle, setFilterStyle] = useState('vintage');
  const fileInputRef = useRef(null);

  const filterStyles = [
    'vintage', 'noir', 'cyberpunk', 'nature', 'abstract', 'cinematic', 'anime', 'watercolor'
  ];

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setVideoPreview(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!videoFile) return;

    setLoading(true);
    try {
      const uploadedFile = await base44.integrations.Core.UploadFile({ file: videoFile });
      const result = await base44.functions.invoke('lumaVideoFilter', {
        video_url: uploadedFile.file_url,
        filter_style: filterStyle
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
        <h3 className="text-white font-bold mb-4">AI Video Filter</h3>
        
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-all"
          >
            {videoPreview ? (
              <video src={videoPreview} className="max-w-full h-40 mx-auto rounded-lg" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white/50" />
                <p className="text-white/70">Click to upload a video</p>
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

          <div>
            <label className="text-white text-sm mb-2 block">Filter Style</label>
            <div className="grid grid-cols-2 gap-2">
              {filterStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => setFilterStyle(style)}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    filterStyle === style
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!videoFile}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600"
          >
            Apply Filter
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}