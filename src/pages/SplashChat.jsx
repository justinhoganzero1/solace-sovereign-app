import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, MessageSquare } from 'lucide-react';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { base44 } from '@/api/base44Client';

export default function SplashChat() {
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
          className="text-center max-w-2xl"
        >
          <div className="mb-4 flex justify-center">
            <MessageSquare className="w-16 h-16 text-yellow-300" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Real-Time Chat
          </h1>
          
          <p className="text-lg md:text-xl text-yellow-100 mb-6 drop-shadow-lg">
            Speak with the Oracle in real-time. Get instant responses, wisdom, and guidance whenever you need it.
          </p>

          <div className="space-y-4 mb-8 text-left bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="text-white font-bold">Text & Voice Chat</h3>
                <p className="text-yellow-100 text-sm">Type or speak naturally with the Oracle</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🎤</span>
              <div>
                <h3 className="text-white font-bold">Voice Synthesis</h3>
                <p className="text-yellow-100 text-sm">Hear responses in your preferred voice and language</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-white font-bold">Instant Responses</h3>
                <p className="text-yellow-100 text-sm">Get answers in seconds with AI-powered intelligence</p>
              </div>
            </div>
          </div>

          <Link to={createPageUrl('Chat')}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-full shadow-2xl inline-flex items-center gap-2"
            >
              Enter Chat <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}