import React from 'react';
import { ArrowLeft, ShoppingBag, Search, DollarSign, Shield, TrendingUp, Lock, Globe, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function DigitalMall() {
  const mallFeatures = [
    { name: 'Vibe-Search', icon: Search, color: 'purple', page: 'Home' },
    { name: 'Price Evasion', icon: DollarSign, color: 'green', page: 'Home' },
    { name: 'Authenticator', icon: Shield, color: 'cyan', page: 'Home' },
    { name: 'Sovereign Trade', icon: Crown, color: 'yellow', page: 'Home' },
    { name: 'Carbon Tracker', icon: Globe, color: 'green', page: 'Home' },
    { name: 'Privacy Auditor', icon: Lock, color: 'red', page: 'Home' },
    { name: 'Value Predictor', icon: TrendingUp, color: 'orange', page: 'Home' },
    { name: 'Empire Builder', icon: Crown, color: 'purple', page: 'Dashboard' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => window.history.back()}>
            <FuturisticOrb size="sm" glowColor="purple">
              <ArrowLeft className="w-6 h-6 text-purple-400" />
            </FuturisticOrb>
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <ShoppingBag className="w-24 h-24 text-purple-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(168,85,247,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 mb-4" style={{ textShadow: '0 0 100px rgba(168,85,247,0.6)' }}>
            Digital Mall 2090
          </h1>
          <p className="text-3xl text-purple-300">Sovereign Commerce Protocol</p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
          {mallFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <motion.div whileHover={{ y: -15, scale: 1.1 }} whileTap={{ scale: 0.9 }} className="cursor-pointer">
                  <FuturisticOrb size="xl" glowColor={feature.color}>
                    <div className="text-center p-2">
                      <Icon className="w-10 h-10 text-white mx-auto mb-2" />
                      <p className="text-xs text-white font-bold leading-tight">{feature.name}</p>
                    </div>
                  </FuturisticOrb>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}