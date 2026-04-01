import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Brain, Heart, Coffee, Moon, Zap, Target, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function MindHub() {
  const mindFeatures = [
    { name: 'Wellness Center', icon: Heart, color: 'pink', page: 'WellnessCenter' },
    { name: 'ADHD Body Double', icon: Coffee, color: 'cyan', page: 'WellnessCenter' },
    { name: 'Anxiety De-escalator', icon: Zap, color: 'purple', page: 'WellnessCenter' },
    { name: 'Gratitude Vault', icon: Heart, color: 'yellow', page: 'WellnessCenter' },
    { name: 'Sleep Soundscape', icon: Moon, color: 'cyan', page: 'WellnessCenter' },
    { name: 'Focus Veil', icon: Target, color: 'orange', page: 'WellnessCenter' },
    { name: 'Habit Hero', icon: TrendingUp, color: 'green', page: 'WellnessCenter' },
    { name: 'Social Battery', icon: Clock, color: 'purple', page: 'WellnessCenter' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FuturisticOrb size="sm" glowColor="pink">
                <ArrowLeft className="w-6 h-6 text-pink-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Brain className="w-24 h-24 text-pink-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(236,72,153,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-4" style={{ textShadow: '0 0 100px rgba(236,72,153,0.6)' }}>
            Mind Hub 2090
          </h1>
          <p className="text-3xl text-pink-300">Neural Wellness Protocol</p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
          {mindFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={createPageUrl(feature.page)}>
                  <motion.div whileHover={{ y: -15, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <FuturisticOrb size="xl" glowColor={feature.color}>
                      <div className="text-center p-2">
                        <Icon className="w-10 h-10 text-white mx-auto mb-2" />
                        <p className="text-xs text-white font-bold leading-tight">{feature.name}</p>
                      </div>
                    </FuturisticOrb>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}