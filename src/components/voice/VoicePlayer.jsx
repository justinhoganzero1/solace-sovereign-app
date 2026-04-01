import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Pause, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoicePlayer({ audioUrl, autoPlay = false, className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, autoPlay]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleProgressChange = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200 ${className}`}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlayPause}
        className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </Button>

      <div className="flex-1 space-y-1">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleProgressChange}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-purple-700">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMute}
          className="h-8 w-8 text-purple-600 hover:text-purple-700"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume * 100]}
          max={100}
          step={1}
          onValueChange={(val) => setVolume(val[0] / 100)}
          className="w-20"
        />
      </div>
    </motion.div>
  );
}