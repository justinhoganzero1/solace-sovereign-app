import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../oracle/AnimatedOracle';

export default function VoiceMessagePlayer({ audioUrl, gender = 'female', autoPlay = false }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (autoPlay && audioUrl) {
      playAudio();
    }
  }, [audioUrl, autoPlay]);

  const playAudio = async () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      setError(false);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudio();
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        onError={() => setError(true)}
      />

      {/* Mini animated oracle */}
      <div className="w-12 h-12 flex-shrink-0">
        <AnimatedOracle 
          gender={gender}
          isSpeaking={isPlaying}
          audioUrl={audioUrl}
          autoPlay={false}
        />
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={togglePlay}
        disabled={!audioUrl || error}
        className="bg-white"
      >
        {error ? (
          <>
            <VolumeX className="w-4 h-4 mr-2" />
            Error
          </>
        ) : isPlaying ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Volume2 className="w-4 h-4 mr-2" />
            </motion.div>
            Playing
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 mr-2" />
            Play Voice
          </>
        )}
      </Button>
    </div>
  );
}