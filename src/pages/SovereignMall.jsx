import React, { useState, useEffect } from 'react';
import { ArrowLeft, Store, Users, Coins, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';
import OracleEye from '../components/mall/OracleEye';
import PrivacyToggle from '../components/mall/PrivacyToggle';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';

export default function SovereignMall() {
  const [stores, setStores] = useState([]);
  const [empireBalance, setEmpireBalance] = useState(0);

  useEffect(() => {
    loadMallData();
  }, []);

  const loadMallData = async () => {
    try {
      // Load stores
      const mallStores = await base44.entities.MallStore.filter({ is_active: true });
      setStores(mallStores);

      // Load Empire Credits
      const credits = await base44.entities.EmpireCredit.filter({});
      const balance = credits.reduce((sum, tx) => {
        return sum + (tx.transaction_type === 'earned' || tx.transaction_type === 'bonus' ? tx.amount : -tx.amount);
      }, 0);
      setEmpireBalance(balance);
    } catch (error) {
      console.error('Failed to load mall:', error);
    }
  };

  const mallSections = [
    { name: 'Stores', icon: Store, color: 'purple', page: 'MallStores' },
    { name: 'Friends World', icon: Users, color: 'cyan', page: 'FriendsWorld' },
    { name: 'My Vault', icon: Coins, color: 'yellow', page: 'DarkVault' },
    { name: 'Live Map', icon: Map, color: 'green', page: 'FriendsWorld' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <PrivacyToggle />
      <OracleEye />

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

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Store className="w-24 h-24 text-purple-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(168,85,247,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-4" style={{ textShadow: '0 0 100px rgba(168,85,247,0.6)' }}>
            The Sovereign Mall
          </h1>
          <p className="text-3xl text-cyan-300">3D Digital Marketplace</p>
        </motion.div>

        {/* Empire Balance */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-2 border-purple-400/50 backdrop-blur-xl">
            <CardContent className="p-6 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Empire Credits</p>
              <p className="text-4xl font-black text-yellow-400">{empireBalance.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Mall Plaza - 3D Style Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center mb-12">
          {mallSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.name}
                initial={{ opacity: 0, scale: 0, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: idx * 0.15, type: 'spring' }}
              >
                <motion.div
                    whileHover={{ y: -20, scale: 1.15, rotateY: 15 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ transformStyle: 'preserve-3d', cursor: 'pointer' }}
                    onClick={() => window.dispatchEvent(new CustomEvent('solace-navigate', { detail: { page: section.page } }))}
                  >
                    <FuturisticOrb size="xl" glowColor={section.color}>
                      <div className="text-center p-4">
                        <Icon className="w-12 h-12 text-white mx-auto mb-2" />
                        <p className="text-sm text-white font-bold">{section.name}</p>
                      </div>
                    </FuturisticOrb>
                  </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Active Stores Preview */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Featured Stores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.slice(0, 3).map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-400/30 backdrop-blur-md hover:border-purple-400 transition-all">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{store.store_name}</h3>
                    <p className="text-sm text-gray-300 mb-2">{store.category}</p>
                    <p className="text-xs text-cyan-300">AI: {store.ai_shopkeeper_name}</p>
                    <p className="text-xs text-gray-400 mt-2">{store.store_description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}