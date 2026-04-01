import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedOracle({ gender = 'female', isSpeaking = false, audioUrl = null, autoPlay = false }) {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mouthOpenness, setMouthOpenness] = useState(0);

  const oracleImage = gender === 'male' 
    ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69659706b6fcdcdebe2d7e2f/94de49b14_e579ab8c-7d30-423c-9610-4bd9393b5dcd.png'
    : 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69659706b6fcdcdebe2d7e2f/326040f4d_c605241b-51a2-4d40-9ed0-dc08a2504e2c.png';

  useEffect(() => {
    if (audioUrl && autoPlay) {
      playAudio();
    }
  }, [audioUrl, autoPlay]);

  const playAudio = async () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      const audio = audioRef.current;
      audio.src = audioUrl;
      
      // Create audio context for analysis
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyserRef.current = analyser;

      await audio.play();
      setIsPlaying(true);
      startLipSync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const startLipSync = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      if (!audioRef.current || audioRef.current.paused) {
        setMouthOpenness(0);
        setIsPlaying(false);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume from frequency data
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalized = Math.min(average / 128, 1); // Normalize to 0-1
      
      setMouthOpenness(normalized);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setMouthOpenness(0);
  };

  return (
    <div className="relative w-full h-full">
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        className="hidden"
      />
      
      {/* Full-screen Oracle Image */}
      <img
        src={oracleImage}
        alt="Oracle"
        className="w-full h-full object-cover"
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Animated Glow Effect when speaking */}
      {(isPlaying || isSpeaking) && (
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-amber-500/30"
        />
      )}
    </div>
  );
}