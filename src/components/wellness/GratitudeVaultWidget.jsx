import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, Lock, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { FuturisticCloud, FuturisticOrb } from '../ui/futuristic-cloud';

export default function GratitudeVaultWidget() {
  const [entry, setEntry] = useState('');
  const [prompt, setPrompt] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPrompt();
  }, []);

  const loadPrompt = async () => {
    try {
      const { data } = await base44.functions.invoke('gratitudeVault', { action: 'prompt' });
      setPrompt(data.prompt);
    } catch (error) {
      setPrompt("What are you grateful for today?");
    }
  };

  const saveEntry = async () => {
    if (!entry.trim()) return;

    try {
      await base44.functions.invoke('gratitudeVault', {
        action: 'save',
        entry,
        mood: 'grateful'
      });

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setEntry('');
        loadPrompt();
      }, 3000);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <FuturisticCloud size="lg" glowColor="pink">
      <div className="text-center w-full">
        <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-pink-300 mb-6">Gratitude Vault</h3>

        {saved ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="space-y-4"
          >
            <Lock className="w-12 h-12 text-green-400 mx-auto" />
            <p className="text-green-300 text-lg font-semibold">
              Encrypted & Saved! 🔒
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <p className="text-pink-200 text-sm italic">"{prompt}"</p>

            <div className="relative">
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Write your gratitude here..."
                className="w-full h-32 bg-black/40 border-2 border-pink-400/30 rounded-2xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-pink-400/60 resize-none"
                style={{
                  boxShadow: '0 0 20px rgba(236,72,153,0.2)'
                }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveEntry}
              disabled={!entry.trim()}
            >
              <FuturisticOrb size="md" glowColor="pink">
                <div className="text-center">
                  <Send className="w-6 h-6 text-pink-400 mx-auto" />
                  <p className="text-white text-xs mt-1">Save</p>
                </div>
              </FuturisticOrb>
            </motion.button>

            <p className="text-xs text-pink-200/50">
              Entries are encrypted and saved to your Dark Vault
            </p>
          </div>
        )}
      </div>
    </FuturisticCloud>
  );
}