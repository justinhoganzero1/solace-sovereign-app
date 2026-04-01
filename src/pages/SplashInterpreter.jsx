import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe } from 'lucide-react';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { base44 } from '@/api/base44Client';

export default function SplashInterpreter() {
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

  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic'];

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
            <Globe className="w-16 h-16 text-yellow-300" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            AI Interpreter
          </h1>
          
          <p className="text-lg md:text-xl text-yellow-100 mb-6 drop-shadow-lg">
            Translate between 12+ languages instantly with real-time voice synthesis.
          </p>

          <div className="mb-8">
            <p className="text-yellow-200 mb-3 font-semibold text-sm">Supported Languages:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {languages.map((lang) => (
                <motion.div
                  key={lang}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 text-white text-sm font-semibold hover:bg-white/20 transition-all"
                >
                  {lang}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-8 text-left bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="text-white font-bold">12+ Languages</h3>
                <p className="text-yellow-100 text-sm">Translate between any of our supported languages</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-white font-bold">Instant Translation</h3>
                <p className="text-yellow-100 text-sm">Real-time translation with AI accuracy</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🎵</span>
              <div>
                <h3 className="text-white font-bold">Voice Output</h3>
                <p className="text-yellow-100 text-sm">Hear translations spoken naturally</p>
              </div>
            </div>
          </div>

          <Link to={createPageUrl('Interpreter')}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-full shadow-2xl inline-flex items-center gap-2"
            >
              Start Translating <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}