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
    <div style={{ minHeight: '100vh', background: '#000', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(6,182,212,0.15)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#06b6d4,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Video Studio</div>
              <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LUMA AI • STYLE TRANSFER • GENERATION</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', color: '#22d3ee', fontSize: '0.72rem', fontWeight: 600 }}>
              {tools.length} Tools
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {!selectedTool ? (
            <VideoToolSelector tools={tools} onSelect={setSelectedTool} />
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={() => { setSelectedTool(null); setGeneratedMedia(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#67e8f9', cursor: 'pointer', marginBottom: '20px', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <ArrowLeft className="w-4 h-4" /> Back to Tools
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: generatedMedia ? '2fr 1fr' : '1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {renderToolComponent()}
                  {generatedMedia && generatedMedia.type === 'video' && (
                    <button onClick={() => setShowEditingTools(!showEditingTools)}
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid rgba(6,182,212,0.2)', background: 'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(139,92,246,0.1))', color: '#22d3ee', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                      {showEditingTools ? '▲ Hide' : '▼ Show'} Editing Tools
                    </button>
                  )}
                  {showEditingTools && generatedMedia && generatedMedia.type === 'video' && (
                    <VideoEditingTools videoUrl={generatedMedia.url} />
                  )}
                </div>

                {generatedMedia && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    style={{ background: 'rgba(6,6,16,0.8)', borderRadius: '18px', padding: '24px', border: '1px solid rgba(6,182,212,0.1)', backdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '16px' }}>GENERATED OUTPUT</div>
                    {generatedMedia.type === 'video' ? (
                      <video src={generatedMedia.url} controls style={{ width: '100%', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    ) : (
                      <img src={generatedMedia.url} alt="Generated" style={{ width: '100%', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    )}
                    <button onClick={handleDownload}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', marginBottom: '8px', fontSize: '0.85rem' }}>
                      ⬇ Download
                    </button>
                    <button onClick={() => window.history.back()}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                      📚 View in Library
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, flexDirection: 'column', gap: '16px' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <Loader2 style={{ width: '48px', height: '48px', color: '#22d3ee' }} />
          </motion.div>
          <p style={{ color: '#67e8f9', fontSize: '1rem', fontWeight: 600 }}>Generating with Luma AI...</p>
          <div style={{ width: '200px', height: '3px', borderRadius: '2px', background: 'rgba(6,182,212,0.15)', overflow: 'hidden' }}>
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg,transparent,#22d3ee,transparent)' }} />
          </div>
        </div>
      )}
    </div>
  );
}