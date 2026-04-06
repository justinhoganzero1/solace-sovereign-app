import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoToolSelector from '../components/video/VideoToolSelector.jsx';
import VideoStyleTransfer from '../components/video/VideoStyleTransfer.jsx';
import AIASMRGenerator from '../components/video/AIASMRGenerator.jsx';
import AIDanceGenerator from '../components/video/AIDanceGenerator.jsx';
import AIVideoFilter from '../components/video/AIVideoFilter.jsx';
import AIMuscleGenerator from '../components/video/AIMuscleGenerator.jsx';
import ImageToVideo from '../components/video/ImageToVideo.jsx';
import ImageToPrompt from '../components/video/ImageToPrompt.jsx';
import AIGirlGenerator from '../components/video/AIGirlGenerator.jsx';
import AILogoGenerator from '../components/video/AILogoGenerator.jsx';
import AIImageBlender from '../components/video/AIImageBlender.jsx';
import AIProfilePictureGenerator from '../components/video/AIProfilePictureGenerator.jsx';
import AIVectorGenerator from '../components/video/AIVectorGenerator.jsx';
import VideoEditingTools from '../components/video/VideoEditingTools.jsx';

export default function VideoEditor() {
  const [_profile, setProfile] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [generatedMedia, setGeneratedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditingTools, setShowEditingTools] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };



  const handleMediaGenerated = async (media) => {
     console.log('Media generated:', media);
     setGeneratedMedia(media);
   };

  const handleDownload = async () => {
    if (!generatedMedia?.url) return;
    
    try {
      const response = await fetch(generatedMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${selectedTool}-${Date.now()}.${generatedMedia.type === 'video' ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to direct link
      window.open(generatedMedia.url, '_blank');
    }
  };

  const tools = [
    { id: 'style-transfer', name: 'Video Style Transfer', category: 'Video', icon: '🎨' },
    { id: 'asmr', name: 'AI ASMR Video', category: 'Video', icon: '🎧' },
    { id: 'dance', name: 'AI Dance Generator', category: 'Video', icon: '💃' },
    { id: 'filter', name: 'AI Video Filter', category: 'Video', icon: '✨' },
    { id: 'muscle', name: 'AI Muscle Video', category: 'Video', icon: '💪' },
    { id: 'image-to-video', name: 'Image to Video', category: 'Video', icon: '🎬' },
    { id: 'image-to-prompt', name: 'Image to Prompt', category: 'Image', icon: '📝' },
    { id: 'girl', name: 'AI Girl Generator', category: 'Image', icon: '👧' },
    { id: 'logo', name: 'AI Logo Generator', category: 'Image', icon: '🏷️' },
    { id: 'blender', name: 'AI Image Blender', category: 'Image', icon: '🎭' },
    { id: 'profile', name: 'AI Profile Picture', category: 'Image', icon: '👤' },
    { id: 'vector', name: 'AI Vector Generator', category: 'Image', icon: '📐' },
  ];

  const renderToolComponent = () => {
    switch (selectedTool) {
      case 'style-transfer':
        return <VideoStyleTransfer onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'asmr':
        return <AIASMRGenerator onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'dance':
        return <AIDanceGenerator onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'filter':
        return <AIVideoFilter onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'muscle':
        return <AIMuscleGenerator onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'image-to-video':
        return <ImageToVideo onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'image-to-prompt':
        return <ImageToPrompt onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'girl':
        return <AIGirlGenerator onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'logo':
        return <AILogoGenerator onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'blender':
        return <AIImageBlender onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'profile':
        return <AIProfilePictureGenerator onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      case 'vector':
        return <AIVectorGenerator onGenerate={handleMediaGenerated} setLoading={setLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700">
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button onClick={() => window.history.back()} className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-all">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Luma AI Video Editor</h1>
            <button onClick={() => window.history.back()} className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-all text-sm">
                📚 Library
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            {!selectedTool ? (
              <VideoToolSelector tools={tools} onSelect={setSelectedTool} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => {
                    setSelectedTool(null);
                    setGeneratedMedia(null);
                  }}
                  className="mb-6 text-white hover:text-purple-300 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Tools
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {renderToolComponent()}
                    
                    {generatedMedia && generatedMedia.type === 'video' && (
                      <button
                        onClick={() => setShowEditingTools(!showEditingTools)}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        {showEditingTools ? 'Hide' : 'Show'} Editing Tools
                      </button>
                    )}
                    
                    {showEditingTools && generatedMedia && generatedMedia.type === 'video' && (
                      <VideoEditingTools videoUrl={generatedMedia.url} />
                    )}
                  </div>

                  {generatedMedia && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                    >
                      <h3 className="text-white font-bold mb-4">Generated Media</h3>
                      {generatedMedia.type === 'video' ? (
                        <video
                          src={generatedMedia.url}
                          controls
                          className="w-full rounded-lg mb-4"
                        />
                      ) : (
                        <img
                          src={generatedMedia.url}
                          alt="Generated"
                          className="w-full rounded-lg mb-4"
                        />
                      )}
                      <button
                        onClick={handleDownload}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors mb-2"
                      >
                        Download
                      </button>
                      <button onClick={() => window.history.back()} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition-colors">
                          View in Library
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 text-purple-400" />
            <p className="text-white text-lg">Generating with Luma AI...</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}