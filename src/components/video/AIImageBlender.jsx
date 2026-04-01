import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIImageBlender({ onGenerate, setLoading }) {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);

  const handleImageUpload = (file, setImage, setPreview) => {
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image1 || !image2) return;

    setLoading(true);
    try {
      const file1 = await base44.integrations.Core.UploadFile({ file: image1 });
      const file2 = await base44.integrations.Core.UploadFile({ file: image2 });

      const result = await base44.functions.invoke('lumaImageBlender', {
        image1_url: file1.file_url,
        image2_url: file2.file_url
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
        <h3 className="text-white font-bold mb-4">AI Image Blender</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image 1 Upload */}
            <div
              onClick={() => fileInput1Ref.current?.click()}
              className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-white/50 transition-all"
            >
              {preview1 ? (
                <img src={preview1} alt="Preview 1" className="max-w-full h-32 mx-auto rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-white/50" />
                  <p className="text-white/70 text-sm">Upload Image 1</p>
                </div>
              )}
              <input
                ref={fileInput1Ref}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0], setImage1, setPreview1)}
                className="hidden"
              />
            </div>

            {/* Image 2 Upload */}
            <div
              onClick={() => fileInput2Ref.current?.click()}
              className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-white/50 transition-all"
            >
              {preview2 ? (
                <img src={preview2} alt="Preview 2" className="max-w-full h-32 mx-auto rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-white/50" />
                  <p className="text-white/70 text-sm">Upload Image 2</p>
                </div>
              )}
              <input
                ref={fileInput2Ref}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0], setImage2, setPreview2)}
                className="hidden"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!image1 || !image2}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600"
          >
            Blend Images
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}