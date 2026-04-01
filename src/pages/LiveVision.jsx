import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPageUrl } from '../utils';
import { ArrowLeft, Camera, Loader2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function LiveVision() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-200">
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-gray-800 hover:bg-white/40">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Eye className="w-20 h-20 mx-auto mb-4 text-amber-600" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 mb-4">
              Live Vision
            </h1>
            <p className="text-xl text-gray-700">Let Oracle see what you see</p>
          </motion.div>

          <Card className="w-full bg-gray-900/80 border-cyan-500/50">
            <CardContent className="p-6 space-y-6">
              {/* Camera View */}
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full"
                    />
                    {analyzing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                          <p className="text-white">Oracle is analyzing...</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <Camera className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {!cameraActive ? (
                  <Button
                    onClick={startCamera}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white h-14 text-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={captureAndAnalyze}
                      disabled={analyzing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Analyze Now
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="text-white border-gray-600 hover:bg-red-600/20 h-14"
                    >
                      Stop
                    </Button>
                  </>
                )}
              </div>

              {/* Response */}
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500">
                    <CardContent className="p-4">
                      <h3 className="text-cyan-300 font-bold mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Oracle's Analysis
                      </h3>
                      <div className="text-white prose prose-invert max-w-none">
                        <ReactMarkdown>{response}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <p className="text-gray-600 text-sm text-center mt-6 max-w-2xl">
            Use Live Vision for real-time visual assistance, object identification, safety assessments, and contextual guidance
          </p>
        </div>
      </div>
    </div>
  );
}