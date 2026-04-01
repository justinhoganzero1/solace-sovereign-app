import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Briefcase, FileText, DollarSign, Code, Mail, Calendar, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function ProfessionalHub() {
  const proFeatures = [
    { name: 'Email Tone-Shifter', icon: Mail, color: 'cyan', page: 'Dashboard' },
    { name: 'Meeting Shadow', icon: Users, color: 'purple', page: 'Dashboard' },
    { name: 'Ghostwriter', icon: FileText, color: 'yellow', page: 'Dashboard' },
    { name: 'Invoice Chaser', icon: DollarSign, color: 'green', page: 'Dashboard' },
    { name: 'Code Reviewer', icon: Code, color: 'orange', page: 'Dashboard' },
    { name: 'Networker', icon: Calendar, color: 'pink', page: 'Dashboard' },
    { name: 'Time Auditor', icon: TrendingUp, color: 'cyan', page: 'Dashboard' },
    { name: 'The Negotiator', icon: Briefcase, color: 'red', page: 'Dashboard' },
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
              <FuturisticOrb size="sm" glowColor="purple">
                <ArrowLeft className="w-6 h-6 text-purple-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Briefcase className="w-24 h-24 text-purple-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(168,85,247,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-4" style={{ textShadow: '0 0 100px rgba(168,85,247,0.6)' }}>
            Professional Hub 2090
          </h1>
          <p className="text-3xl text-purple-300">Sovereign Power Protocol</p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
          {proFeatures.map((feature, idx) => {
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