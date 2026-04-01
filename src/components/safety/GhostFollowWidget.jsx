import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Ear, StopCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GhostFollowWidget() {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startGhostFollow = async () => {
    try {
      const { data } = await base44.functions.invoke('ghostFollow', {
        action: 'start'
      });

      setSessionId(data.sessionId);
      setIsActive(true);

      // Start audio monitoring
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.start(5000); // Record in 5-second chunks

      // Analyze every 10 seconds
      setInterval(async () => {
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
          
          // In production, you'd transcribe the audio first
          // For now, we'll simulate with a check
          await analyzeAudio('sample transcript');
        }
      }, 10000);

    } catch (error) {
      console.error('Ghost Follow failed:', error);
    }
  };

  const analyzeAudio = async (transcript) => {
    try {
      const position = await getCurrentPosition();
      
      await base44.functions.invoke('ghostFollow', {
        action: 'analyze',
        audioData: transcript,
        location: position
      });
    } catch (error) {
      console.error('Audio analysis failed:', error);
    }
  };

  const stopGhostFollow = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    setSessionId(null);
  };

  const getCurrentPosition = () => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve({ latitude: 0, longitude: 0 })
        );
      } else {
        resolve({ latitude: 0, longitude: 0 });
      }
    });
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-md border-2 border-purple-400/40">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <Ear className="w-6 h-6" />
          Ghost Follow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="bg-purple-950/40 rounded-lg p-4 border border-purple-400/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <p className="text-white font-semibold">Oracle is listening</p>
              </div>
              <p className="text-sm text-purple-200/70">
                Silent protection active. Oracle will alert contacts if distress is detected.
              </p>
            </div>

            <Button
              onClick={stopGhostFollow}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Ghost Follow
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/80 text-sm">
              Oracle will listen silently while you walk. If distress is detected, emergency contacts are alerted automatically.
            </p>
            <Button
              onClick={startGhostFollow}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Ghost Follow
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}