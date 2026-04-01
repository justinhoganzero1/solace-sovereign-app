import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

export default function AIMuscleGenerator({ onGenerate, setLoading }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [muscleLevel, setMuscleLevel] = useState(5);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) return;

    setLoading(true);
    try {
      console.log('Uploading image...');
      const uploadedFile = await base44.integrations.Core.UploadFile({ file: imageFile });
      console.log('Image uploaded:', uploadedFile.file_url);
      
      console.log('Calling lumaMuscleGenerator function...');
      const result = await base44.functions.invoke('lumaMuscleGenerator', {
        image_url: uploadedFile.file_url,
        muscle_level: muscleLevel
      });

      console.log('Function response:', result);
      
      if (result.status !== 200) {
        alert(`Error: ${result.data?.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      const videoUrl = result.data?.video_url || result.data?.url;
      
      if (!videoUrl) {
        console.error('No video URL in response:', result.data);
        alert('Failed to generate video - no URL returned');
        setLoading(false);
        return;
      }
      
      console.log('Muscle video generated successfully:', videoUrl);
      onGenerate({ type: 'video', url: videoUrl });
      setLoading(false);
    } catch (error) {
      console.error('Error generating muscle video:', error);
      alert(`Error: ${error.message || 'Failed to generate video'}`);
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
        <h3 className="text-white font-bold mb-4">AI Muscle Generator</h3>
        
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-all"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-w-full h-40 mx-auto rounded-lg" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white/50" />
                <p className="text-white/70">Click to upload a body image</p>
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

          <div>
            <label className="text-white text-sm mb-2 block">Muscle Level: {muscleLevel}</label>
            <Slider
              value={[muscleLevel]}
              onValueChange={(val) => setMuscleLevel(val[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-white/50 text-xs mt-1">1 = Lean, 10 = Maximum Muscle</p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!imageFile}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600"
          >
            Generate Muscle Video
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}