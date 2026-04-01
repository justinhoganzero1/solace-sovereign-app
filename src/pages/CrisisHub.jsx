import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Shield, AlertTriangle, Phone, MapPin, Mic, Camera, Siren } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb, FuturisticCloud } from '../components/ui/futuristic-cloud';

export default function CrisisHub() {
  const safetyFeatures = [
    { name: 'Ghost Follow', icon: Mic, color: 'purple', page: 'SafetyCenter2090' },
    { name: 'Evasion Navigator', icon: MapPin, color: 'red', page: 'SafetyCenter2090' },
    { name: 'Fake Call Proxy', icon: Phone, color: 'cyan', page: 'SafetyCenter2090' },
    { name: 'Domestic Guardian', icon: AlertTriangle, color: 'orange', page: 'SafetyCenter2090' },
    { name: 'Silent Witness', icon: Camera, color: 'yellow', page: 'SafetyCenter2090' },
    { name: 'Medical First-Responder', icon: Siren, color: 'red', page: 'SafetyCenter2090' },
    { name: 'Kidnap Lock', icon: Shield, color: 'red', page: 'SafetyCenter2090' },
    { name: 'Emergency Services', icon: Phone, color: 'red', page: 'SafetyCenter2090' },
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
              <FuturisticOrb size="sm" glowColor="red">
                <ArrowLeft className="w-6 h-6 text-red-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Shield className="w-24 h-24 text-red-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(239,68,68,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mb-4" style={{ textShadow: '0 0 100px rgba(239,68,68,0.6)' }}>
            Crisis Hub
          </h1>
          <p className="text-3xl text-red-300">Extreme Safety Protocol</p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
          {safetyFeatures.map((feature, idx) => {
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
                    <FuturisticOrb size="lg" glowColor={feature.color}>
                      <div className="text-center p-2">
                        <Icon className="w-8 h-8 text-black mx-auto mb-2" />
                        <p className="text-xs text-black font-bold leading-tight">{feature.name}</p>
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