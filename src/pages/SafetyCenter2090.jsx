import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import EmergencyServicesWidget2090 from '../components/safety/EmergencyServicesWidget2090';
import GhostFollowWidget2090 from '../components/safety/GhostFollowWidget2090';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function SafetyCenter2090() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
            animate={{
              y: [0, -1000],
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
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
              <FuturisticOrb size="sm" glowColor="cyan">
                <ArrowLeft className="w-6 h-6 text-cyan-400" />
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
            <div className="flex items-center justify-center gap-4 mb-4">
              <Shield className="w-20 h-20 text-red-400 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
            </div>
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mb-4" style={{
              textShadow: '0 0 80px rgba(239,68,68,0.5)'
            }}>
              Safety Protocol 2090
            </h1>
            <p className="text-2xl text-cyan-300">Neural Protection Grid Active</p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-12">
            <EmergencyServicesWidget2090 />
            <GhostFollowWidget2090 />
          </div>
        </div>
      </div>
    </div>
  );
}