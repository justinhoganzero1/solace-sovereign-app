import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImageToPrompt({ onGenerate, setLoading }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState('');
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
      const uploadedFile = await base44.integrations.Core.UploadFile({ file: imageFile });
      const result = await base44.functions.invoke('lumaImageToPrompt', {
        image_url: uploadedFile.file_url
      });

      setPrompt(result.data.prompt || result.data.description || '');
      onGenerate({ type: 'text', text: result.data.prompt || result.data.description || '' });
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
        <h3 className="text-white font-bold mb-4">Image to Prompt</h3>
        
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
                <p className="text-white/70">Click to upload an image</p>
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

          <Button
            onClick={handleGenerate}
            disabled={!imageFile}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600"
          >
            Generate Prompt
          </Button>

          {prompt && (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">Generated Prompt:</p>
              <p className="text-white">{prompt}</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}