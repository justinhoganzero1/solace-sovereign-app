import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Crown, Lock, Unlock, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb, FuturisticCloud } from '../components/ui/futuristic-cloud';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TierSystem() {
  const [subscription, setSubscription] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await base44.functions.invoke('checkTrialStatus');
      setTrialStatus(data);

      const subs = await base44.entities.Subscription.filter({});
      if (subs.length > 0) setSubscription(subs[0]);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeTier = async (tier) => {
    try {
      const { data } = await base44.functions.invoke('upgradeTier', {
        new_tier: tier,
        payment_method: 'empire_credits'
      });
      toast.success(data.message);
      checkStatus();
    } catch {
      toast.error('Upgrade failed');
    }
  };

  const tiers = [
    { level: 60, name: '60-Day Float', benefit: 'Liquidity Pool Access', color: 'cyan' },
    { level: 140, name: 'Velocity Exit', benefit: 'Instant Cash-Out', color: 'yellow' },
    { level: 210, name: 'Inter-Titan', benefit: 'P2P Lending', color: 'purple' },
    { level: 250, name: 'Oracle Predictor', benefit: 'Market AI Predictions', color: 'red' },
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
              <FuturisticOrb size="sm" glowColor="yellow">
                <ArrowLeft className="w-6 h-6 text-yellow-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(234,179,8,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-4">
            Sovereign Tiers
          </h1>
          <p className="text-2xl text-purple-300">251 Levels of Power</p>
        </motion.div>

        {/* Trial Status */}
        {trialStatus && (
          <div className="max-w-4xl mx-auto mb-12">
            <FuturisticCloud size="md" glowColor={trialStatus.trial_active ? "green" : "red"}>
              <div className="text-center p-6">
                {trialStatus.trial_active ? (
                  <>
                    <Unlock className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Trial Active</h3>
                    <p className="text-green-300 text-lg">{trialStatus.days_remaining} days remaining</p>
                    <p className="text-sm text-gray-300 mt-2">Full access to all features</p>
                  </>
                ) : (
                  <>
                    <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Trial Ended</h3>
                    <p className="text-red-300">Choose your Sovereign Tier</p>
                  </>
                )}
              </div>
            </FuturisticCloud>
          </div>
        )}

        {/* Current Tier */}
        {subscription && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-gradient-to-r from-purple-900/30 to-yellow-900/30 border-2 border-yellow-400/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-yellow-400 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Current Tier: {subscription.tier_level}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subscription.tier_benefits_unlocked?.map((benefit, i) => (
                    <p key={i} className="text-green-400 text-sm">✓ {benefit.replace(/_/g, ' ').toUpperCase()}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Major Tiers */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, idx) => {
            const unlocked = subscription?.tier_level >= tier.level;
            return (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`bg-gradient-to-br ${unlocked ? 'from-green-900/30' : 'from-gray-900/30'} to-black border ${unlocked ? 'border-green-400' : 'border-gray-600'}`}>
                  <CardContent className="p-6 text-center">
                    {unlocked ? (
                      <Unlock className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    ) : (
                      <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    )}
                    <h3 className="text-xl font-bold text-white mb-2">Tier {tier.level}</h3>
                    <p className="text-sm text-gray-300 mb-2">{tier.name}</p>
                    <p className="text-xs text-cyan-300 mb-4">{tier.benefit}</p>
                    {!unlocked && (
                      <Button
                        onClick={() => upgradeTier(tier.level)}
                        size="sm"
                        className={`bg-${tier.color}-600 hover:bg-${tier.color}-700`}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Upgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Sovereign Tax Notice */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-red-900/20 border-2 border-red-500/50">
            <CardContent className="p-6 text-center">
              <p className="text-red-300 text-sm">
                ⚠️ All transactions subject to 1% Sovereign Tax
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Encrypted and secured in Dark Vault. Zero external access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}