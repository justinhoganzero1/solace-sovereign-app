import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import GratitudeVaultWidget from '../components/wellness/GratitudeVaultWidget';
import AnxietyDeescalatorWidget from '../components/wellness/AnxietyDeescalatorWidget';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function WellnessCenter() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-pink-400/30 rounded-full"
            animate={{
              y: [0, -1000],
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 12 + 8,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FuturisticOrb size="sm" glowColor="pink">
                <ArrowLeft className="w-6 h-6 text-pink-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Brain className="w-20 h-20 text-pink-400 mx-auto mb-4 drop-shadow-[0_0_30px_rgba(236,72,153,0.8)]" />
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-4" style={{
              textShadow: '0 0 80px rgba(236,72,153,0.5)'
            }}>
              Wellness Protocol 2090
            </h1>
            <p className="text-2xl text-pink-300">Neural Health & Balance</p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-12">
            <GratitudeVaultWidget />
            <AnxietyDeescalatorWidget />
          </div>
        </div>
      </div>
    </div>
  );
}