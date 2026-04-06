import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Camera, Loader2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function LiveVision() {
  const [_user, setUser] = useState(null);
  const [_profile, setProfile] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [response, setResponse] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadUserData();
    return () => {
      stopCamera();
    };
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const startCamera = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera is not supported on this device or browser.');
        return;
      }

      // Request camera permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for metadata and play
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraActive(true);
          }).catch(err => {
            console.error('Play error:', err);
            alert('Could not start video playback.');
          });
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera found on this device.');
      } else {
        alert('Could not access camera: ' + error.message);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    setAnalyzing(true);
    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      
      // Upload image
      const uploadData = await base44.integrations.Core.UploadFile({ file: blob });
      
      // Analyze with AI
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Oracle's Live Vision mode. Analyze this image and provide:
1. What you see (objects, people, environment)
2. Any safety concerns or warnings
3. Helpful suggestions or information about what's visible
4. Context-aware assistance

Be detailed, helpful, and focus on practical information.`,
        file_urls: [uploadData.file_url],
        add_context_from_internet: true
      });

      setResponse(aiResponse);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(6,182,212,0.12)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#06b6d4,#22d3ee,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Live Vision</div>
              <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>AI CAMERA • OBJECT DETECTION • REAL-TIME</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {cameraActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'neonPulse 1.5s infinite', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }} />}
            <span style={{ color: cameraActive ? '#ef4444' : '#475569', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 600 }}>{cameraActive ? 'LIVE' : 'STANDBY'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {/* Camera viewport */}
        <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', background: 'rgba(6,6,16,0.9)', border: '1px solid rgba(6,182,212,0.1)', minHeight: '420px', flex: 1, marginBottom: '16px' }}>
          {cameraActive ? (
            <>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {/* Scanner overlay */}
              <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(6,182,212,0.15)', borderRadius: '18px', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', borderTop: '3px solid #22d3ee', borderLeft: '3px solid #22d3ee', borderRadius: '4px 0 0 0' }} />
                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderTop: '3px solid #22d3ee', borderRight: '3px solid #22d3ee', borderRadius: '0 4px 0 0' }} />
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '40px', height: '40px', borderBottom: '3px solid #22d3ee', borderLeft: '3px solid #22d3ee', borderRadius: '0 0 0 4px' }} />
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '40px', height: '40px', borderBottom: '3px solid #22d3ee', borderRight: '3px solid #22d3ee', borderRadius: '0 0 4px 0' }} />
              </div>
              {analyzing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <Loader2 style={{ width: '48px', height: '48px', color: '#22d3ee', animation: 'spinLoader 1s linear infinite' }} />
                  <span style={{ color: '#67e8f9', fontWeight: 600, fontSize: '0.9rem' }}>Oracle is analyzing...</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '420px', gap: '12px' }}>
              <Camera style={{ width: '56px', height: '56px', color: '#1e293b' }} />
              <span style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600 }}>Camera standby</span>
              <span style={{ color: '#1e293b', fontSize: '0.7rem' }}>Tap below to activate</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          {!cameraActive ? (
            <button onClick={startCamera} style={{ flex: 1, height: '54px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Camera size={20} /> Start Camera
            </button>
          ) : (
            <>
              <button onClick={captureAndAnalyze} disabled={analyzing} style={{ flex: 1, height: '54px', borderRadius: '14px', border: 'none', background: analyzing ? 'rgba(139,92,246,0.15)' : 'linear-gradient(135deg,#8b5cf6,#a855f7)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: analyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: analyzing ? 0.5 : 1 }}>
                <Eye size={20} /> Analyze Now
              </button>
              <button onClick={stopCamera} style={{ padding: '0 24px', height: '54px', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                Stop
              </button>
            </>
          )}
        </div>

        {/* Response */}
        {response && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(6,6,16,0.85)', borderRadius: '18px', padding: '24px', border: '1px solid rgba(6,182,212,0.1)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Eye style={{ width: '18px', height: '18px', color: '#22d3ee' }} />
              <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.1em' }}>ORACLE ANALYSIS</span>
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.7 }}>
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </motion.div>
        )}

        <div style={{ textAlign: 'center', padding: '8px 0', color: '#1e293b', fontSize: '0.7rem' }}>
          Real-time visual assistance • Object identification • Safety assessments
        </div>
      </div>
    </div>
  );
}