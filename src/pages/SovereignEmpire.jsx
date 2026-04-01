import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Crown, Coins, Shield, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';
import GuardianHiveWidget from '../components/sovereign/GuardianHiveWidget';
import ChronosWidget from '../components/sovereign/ChronosWidget';
import TruthLensWidget from '../components/sovereign/TruthLensWidget';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';

export default function SovereignEmpire() {
  const [empireBalance, setEmpireBalance] = useState(0);
  const [networkSize, setNetworkSize] = useState(0);

  useEffect(() => {
    loadEmpireData();
  }, []);

  const loadEmpireData = async () => {
    try {
      const credits = await base44.entities.EmpireCredit.filter({});
      const balance = credits.reduce((sum, tx) => {
        return sum + (tx.transaction_type === 'earned' || tx.transaction_type === 'bonus' ? tx.amount : -tx.amount);
      }, 0);
      setEmpireBalance(balance);

      // Simulate network size with live fluctuations
      setNetworkSize(147);
      
      const interval = setInterval(() => {
        setNetworkSize(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          // Keep it between 140 and 160 for now
          const next = prev + change;
          return next < 140 ? 140 : (next > 160 ? 160 : next);
        });
      }, 3000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Failed to load empire data:', error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FuturisticOrb size="sm" glowColor="yellow">
                <ArrowLeft className="w-6 h-6 text-yellow-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(234,179,8,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-purple-400 mb-4" style={{ textShadow: '0 0 100px rgba(234,179,8,0.6)' }}>
            Sovereign Empire
          </h1>
          <p className="text-3xl text-purple-300">Beyond 2090 Protocol</p>
        </motion.div>

        {/* Empire Stats */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-purple-900/30 to-yellow-900/30 border-2 border-yellow-400/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Empire Credits</p>
                  <p className="text-3xl font-black text-yellow-400">{empireBalance.toFixed(2)}</p>
                </div>
                <div>
                  <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Network Oracles</p>
                  <p className="text-3xl font-black text-cyan-400">{networkSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sovereign Systems */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <GuardianHiveWidget />
          <ChronosWidget />
          <TruthLensWidget />
        </div>

        {/* Additional Features */}
        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
          <FuturisticOrb size="lg" glowColor="green">
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-white font-bold">Smart City Intercept</p>
            </div>
          </FuturisticOrb>

          <FuturisticOrb size="lg" glowColor="purple">
            <div className="text-center">
              <Eye className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-white font-bold">Trust Score</p>
            </div>
          </FuturisticOrb>

          <FuturisticOrb size="lg" glowColor="yellow">
            <div className="text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-xs text-white font-bold">Oracle Agent</p>
            </div>
          </FuturisticOrb>

          <FuturisticOrb size="lg" glowColor="cyan">
            <div className="text-center">
              <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-white font-bold">Vault Will</p>
            </div>
          </FuturisticOrb>
        </div>
      </div>
    </div>
  );
}