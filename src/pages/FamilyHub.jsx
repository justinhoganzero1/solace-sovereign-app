import React from 'react';
import { ArrowLeft, Home, Dog, Baby, ShoppingCart, Utensils, Lightbulb, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function FamilyHub() {
  const familyFeatures = [
    { name: 'Fatty Monitor', icon: Dog, color: 'yellow', page: 'Home' },
    { name: 'Grocery Ghost', icon: ShoppingCart, color: 'green', page: 'Home' },
    { name: 'Recipe Translator', icon: Utensils, color: 'orange', page: 'Home' },
    { name: 'Chore Negotiator', icon: Calendar, color: 'cyan', page: 'Home' },
    { name: 'Kid-Safe Oracle', icon: Baby, color: 'pink', page: 'Home' },
    { name: 'Plant Parent', icon: Lightbulb, color: 'green', page: 'Home' },
    { name: 'Family Emergency', icon: Users, color: 'red', page: 'SafetyCenter2090' },
    { name: 'Storytime AI', icon: Home, color: 'purple', page: 'Home' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => window.history.back()}>
            <FuturisticOrb size="sm" glowColor="yellow">
              <ArrowLeft className="w-6 h-6 text-yellow-400" />
            </FuturisticOrb>
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Home className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(234,179,8,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-4" style={{ textShadow: '0 0 100px rgba(234,179,8,0.6)' }}>
            Family Hub
          </h1>
          <p className="text-3xl text-yellow-300">Home & Pet Protocol</p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
          {familyFeatures.map((feature, idx) => {
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