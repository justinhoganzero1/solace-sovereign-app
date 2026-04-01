import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function FuturisticCloud({ children, className, glowColor = "cyan", size = "md", ...props }) {
  const sizes = {
    sm: "w-64 h-64",
    md: "w-80 h-80",
    lg: "w-96 h-96",
    xl: "w-[32rem] h-[32rem]"
  };

  const glows = {
    cyan: "shadow-[0_0_80px_rgba(34,211,238,0.6),0_0_120px_rgba(34,211,238,0.3)]",
    purple: "shadow-[0_0_80px_rgba(168,85,247,0.6),0_0_120px_rgba(168,85,247,0.3)]",
    pink: "shadow-[0_0_80px_rgba(236,72,153,0.6),0_0_120px_rgba(236,72,153,0.3)]",
    yellow: "shadow-[0_0_80px_rgba(234,179,8,0.6),0_0_120px_rgba(234,179,8,0.3)]",
    green: "shadow-[0_0_80px_rgba(34,197,94,0.6),0_0_120px_rgba(34,197,94,0.3)]",
    red: "shadow-[0_0_80px_rgba(239,68,68,0.6),0_0_120px_rgba(239,68,68,0.3)]",
    orange: "shadow-[0_0_80px_rgba(249,115,22,0.6),0_0_120px_rgba(249,115,22,0.3)]"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={cn("relative", sizes[size], className)}
      {...props}
    >
      {/* Neon glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-3xl opacity-60 animate-pulse",
        glows[glowColor]
      )} />
      
      {/* Flowing gradient underneath */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-2xl"
      />

      {/* Main cloud container */}
      <div className="relative h-full w-full rounded-full bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-xl border-2 border-white/10 overflow-hidden">
        {/* Inner flowing animation */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"
          style={{
            backgroundSize: '200% 200%'
          }}
        />
        
        {/* Content */}
        <div className="relative h-full w-full flex flex-col items-center justify-center p-6">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function FuturisticOrb({ children, className, glowColor = "cyan", size = "md", ...props }) {
  const sizes = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-32 h-32",
    xl: "w-36 h-36"
  };

  const glows = {
    cyan: "shadow-[0_0_40px_rgba(34,211,238,0.8)]",
    purple: "shadow-[0_0_40px_rgba(168,85,247,0.8)]",
    pink: "shadow-[0_0_40px_rgba(236,72,153,0.8)]",
    yellow: "shadow-[0_0_40px_rgba(234,179,8,0.8)]",
    green: "shadow-[0_0_40px_rgba(34,197,94,0.8)]",
    red: "shadow-[0_0_40px_rgba(239,68,68,0.8)]",
    orange: "shadow-[0_0_40px_rgba(249,115,22,0.8)]"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn("relative", sizes[size], className)}
      {...props}
    >
      <div className={cn("absolute inset-0 rounded-full blur-xl animate-pulse", glows[glowColor])} />
      <div className="relative h-full w-full rounded-full bg-red-600 backdrop-blur-md border border-white/20 flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
}