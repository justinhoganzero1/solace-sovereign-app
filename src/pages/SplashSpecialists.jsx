import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Sparkles } from 'lucide-react';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { base44 } from '@/api/base44Client';

export default function SplashSpecialists() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  const specialists = [
    { icon: '💬', name: 'Chat Specialist', desc: 'General conversation & guidance' },
    { icon: '🌐', name: 'Interpreter', desc: 'Language translation & learning' },
    { icon: '🧠', name: 'Advisor', desc: 'Thoughtful counsel & wisdom' },
    { icon: '🛡️', name: 'Guardian', desc: 'Safety & well-being focused' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Oracle Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center p-6 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-3xl"
        >
          <div className="mb-4 flex justify-center">
            <Sparkles className="w-16 h-16 text-yellow-300" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            200+ AI Specialists
          </h1>
          
          <p className="text-lg md:text-xl text-yellow-100 mb-8 drop-shadow-lg">
            Choose from our diverse team of AI experts, each with unique personality and expertise.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {specialists.map((spec, idx) => (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-left hover:bg-white/20 transition-all"
              >
                <div className="text-3xl mb-2">{spec.icon}</div>
                <h3 className="text-white font-bold text-base mb-1">{spec.name}</h3>
                <p className="text-yellow-100 text-xs">{spec.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-white font-bold text-lg mb-3">Specialist Modes:</h3>
            <ul className="space-y-2 text-yellow-100 text-sm">
              <li className="flex gap-2">
                <span>✓</span>
                <span><strong>Chat:</strong> Warm, engaging conversation & support</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span><strong>Interpreter:</strong> Language translation & cultural insights</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span><strong>Advisor:</strong> Wise counsel & thoughtful guidance</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span><strong>Guardian:</strong> Safety-focused & protective advice</span>
              </li>
            </ul>
          </div>

          <Link to={createPageUrl('Dashboard')}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-full shadow-2xl inline-flex items-center gap-2"
            >
              Explore Specialists <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}