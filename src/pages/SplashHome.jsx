import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Sparkles, MessageSquare } from 'lucide-react';
import AnimatedOracle from '../components/oracle/AnimatedOracle';

export default function SplashHome() {


  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700">
      {/* Oracle Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <div className="mb-4 flex justify-center">
            <Sparkles className="w-16 h-16 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
            Friends Only
          </h1>
          <p className="text-xl md:text-2xl text-yellow-200 drop-shadow-lg">
            Your AI Oracle Companion
          </p>
        </motion.div>

        {/* Main Chat Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Link to={createPageUrl('Chat')}>
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-400 hover:from-yellow-300 hover:via-yellow-200 hover:to-orange-300 text-black font-bold text-lg rounded-full shadow-2xl flex items-center gap-3 border-4 border-yellow-200/60 hover:border-yellow-100 transition-all">
              <MessageSquare className="w-6 h-6" />
              Chat with Oracle
            </button>
          </Link>
        </motion.div>

        {/* Login & Signup Circle Buttons */}
        <div className="flex gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button 
              onClick={() => window.location.href = createPageUrl('SplashLanding')}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl flex items-center justify-center text-white font-bold text-2xl border-4 border-cyan-300/60 hover:border-cyan-200 transition-all"
            >
              Log In
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={() => window.location.href = createPageUrl('SplashLanding')}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 shadow-2xl flex items-center justify-center text-white font-bold text-2xl border-4 border-pink-300/60 hover:border-pink-200 transition-all"
            >
              Sign Up
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}