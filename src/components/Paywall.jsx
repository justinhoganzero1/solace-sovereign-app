import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Crown, Zap, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { stripeIntegration } from '../lib/stripeIntegration';
import { SUBSCRIPTION_TIERS } from '../lib/authorizationSystem';

export default function Paywall({ 
  isOpen, 
  onClose, 
  feature, 
  userRole,
  trialDaysRemaining = 0,
  reason = 'upgrade_required'
}) {
  const [selectedTier, setSelectedTier] = useState('PREMIUM');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const result = await stripeIntegration.createSubscription(selectedTier, user.email);
      if (result.success) {
        // Stripe will redirect to checkout
      } else {
        alert('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPaywallMessage = () => {
    if (reason === 'monthly_limit_reached') {
      return {
        title: 'Monthly Limit Reached',
        message: 'You\'ve used all your credits for this month. Upgrade to continue creating!',
        urgency: 'high'
      };
    }

    if (reason === 'trial_expired') {
      return {
        title: 'Trial Expired',
        message: 'Your 3-day trial has ended. Upgrade now to keep using all features!',
        urgency: 'critical'
      };
    }

    if (reason === 'feature_locked') {
      return {
        title: 'Premium Feature',
        message: `${feature} is only available on paid plans. Upgrade to unlock!`,
        urgency: 'medium'
      };
    }

    if (userRole === 'trial') {
      return {
        title: `Trial: ${trialDaysRemaining} Days Left`,
        message: 'Upgrade now to keep full access when your trial ends!',
        urgency: 'medium'
      };
    }

    return {
      title: 'Unlock Premium Features',
      message: 'Get unlimited access to all tools and remove watermarks',
      urgency: 'low'
    };
  };

  const paywallContent = getPaywallMessage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="bg-gradient-to-br from-gray-900 to-purple-900 border-purple-500">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    <div>
                      <h2 className="text-3xl font-bold text-white">{paywallContent.title}</h2>
                      <p className="text-purple-200">{paywallContent.message}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Pricing Tiers */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Basic Tier */}
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedTier === 'BASIC' 
                        ? 'bg-blue-900/50 border-blue-400 border-2' 
                        : 'bg-gray-800/50 border-gray-600'
                    }`}
                    onClick={() => setSelectedTier('BASIC')}
                  >
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <Zap className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                        <h3 className="text-2xl font-bold text-white mb-1">Basic</h3>
                        <div className="text-3xl font-bold text-blue-400">$15</div>
                        <div className="text-sm text-gray-400">per month</div>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {SUBSCRIPTION_TIERS.BASIC.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300">
                            <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Premium Tier - Recommended */}
                  <Card 
                    className={`cursor-pointer transition-all relative ${
                      selectedTier === 'PREMIUM' 
                        ? 'bg-purple-900/50 border-purple-400 border-2 scale-105' 
                        : 'bg-gray-800/50 border-gray-600'
                    }`}
                    onClick={() => setSelectedTier('PREMIUM')}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                      RECOMMENDED
                    </div>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <Star className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                        <h3 className="text-2xl font-bold text-white mb-1">Premium</h3>
                        <div className="text-3xl font-bold text-purple-400">$50</div>
                        <div className="text-sm text-gray-400">per month</div>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {SUBSCRIPTION_TIERS.PREMIUM.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300">
                            <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Top Tier */}
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedTier === 'TOP_TIER' 
                        ? 'bg-yellow-900/50 border-yellow-400 border-2' 
                        : 'bg-gray-800/50 border-gray-600'
                    }`}
                    onClick={() => setSelectedTier('TOP_TIER')}
                  >
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <Crown className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                        <h3 className="text-2xl font-bold text-white mb-1">Top Tier</h3>
                        <div className="text-3xl font-bold text-yellow-400">$200</div>
                        <div className="text-sm text-gray-400">per month</div>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {SUBSCRIPTION_TIERS.TOP_TIER.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300">
                            <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg"
                  >
                    {loading ? 'Processing...' : `Upgrade to ${SUBSCRIPTION_TIERS[selectedTier].name}`}
                  </Button>
                  {userRole === 'free' && (
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Continue with Free
                    </Button>
                  )}
                </div>

                {/* Trial Notice */}
                {userRole === 'trial' && (
                  <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                    <p className="text-yellow-200 text-sm text-center">
                      ⚠️ Your trial expires in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}. 
                      Upgrade now to avoid losing access to premium features!
                    </p>
                  </div>
                )}

                {/* Money Back Guarantee */}
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    💯 30-day money-back guarantee • Cancel anytime • Secure payment via Stripe
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
