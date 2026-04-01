import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Ear, StopCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { FuturisticCloud, FuturisticOrb } from '../ui/futuristic-cloud';

export default function GhostFollowWidget2090() {
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.start(5000);

      setInterval(async () => {
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
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
    <FuturisticCloud size="lg" glowColor={isActive ? "green" : "purple"}>
      <div className="text-center">
        <Ear className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-purple-300 mb-6">Ghost Follow</h3>

        {isActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-4 h-4 bg-green-500 rounded-full"
              />
              <p className="text-white font-semibold text-lg">Oracle is Listening</p>
            </div>

            <p className="text-purple-200/70 text-sm">
              Silent protection active. Oracle will trigger emergency if distress detected.
            </p>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopGhostFollow}
            >
              <FuturisticOrb size="lg" glowColor="red">
                <div className="text-center">
                  <StopCircle className="w-8 h-8 text-red-400 mx-auto" />
                  <p className="text-white text-sm mt-2">Stop</p>
                </div>
              </FuturisticOrb>
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <p className="text-white/80 text-sm">
              Oracle listens silently while you walk. Auto-triggers emergency if scream or "Help" detected.
            </p>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGhostFollow}
            >
              <FuturisticOrb size="lg" glowColor="purple">
                <div className="text-center">
                  <Play className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="text-white text-sm mt-2">Activate</p>
                </div>
              </FuturisticOrb>
            </motion.button>
          </div>
        )}
      </div>
    </FuturisticCloud>
  );
}