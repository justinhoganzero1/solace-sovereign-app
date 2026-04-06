import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedOracle({ gender = 'female', isSpeaking = false, audioUrl = null, autoPlay = false, minimal = false }) {
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
      const audioContext = new (window.AudioContext || window['webkitAudioContext'])();
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyserRef.current = analyser;
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  if (minimal) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1a0a1e 0%, #1e0a2e 50%, #0f0a2a 100%)' }}
        />
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 200 + i * 100, height: 200 + i * 100,
              background: `radial-gradient(circle, rgba(${236 - i * 30},${72 + i * 20},${153},0.15) 0%, transparent 70%)`,
              left: `${10 + i * 30}%`, top: `${20 + i * 20}%`,
            }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(236,72,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        {(isPlaying || isSpeaking) && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))' }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(236,72,153,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.12) 0%, transparent 50%), linear-gradient(180deg, #0a0a1a 0%, #1a0a20 50%, #0f0f23 100%)',
        }}
      />
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i} className="absolute w-1 h-1 rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: i % 2 === 0 ? 'rgba(236,72,153,0.4)' : 'rgba(168,85,247,0.4)' }}
          animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`orb-${i}`} className="absolute rounded-full blur-3xl"
          style={{
            width: 300 + i * 150, height: 300 + i * 150,
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
            left: `${i * 35}%`, top: `${20 + i * 25}%`,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {(isPlaying || isSpeaking) && (
        <>
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.25) 0%, transparent 60%)' }}
          />
          {/* Speech-pattern ripple rings */}
          {[0,1,2,3].map(r => (
            <motion.div
              key={`ripple-${r}`}
              className="absolute rounded-full border"
              style={{
                width: 120 + r * 80, height: 120 + r * 80,
                left: '50%', top: '50%',
                marginLeft: -(60 + r * 40), marginTop: -(60 + r * 40),
                borderColor: `rgba(236,72,153,${0.3 - r * 0.06})`,
              }}
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 0.1, 0.5] }}
              transition={{ duration: 1.2 + r * 0.3, repeat: Infinity, ease: "easeInOut", delay: r * 0.15 }}
            />
          ))}
        </>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}