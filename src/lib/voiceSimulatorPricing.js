/**
 * Voice Simulator Standalone Pricing
 * One-time fees for voice generation features
 * Top tier: $20 one-time payment
 */

export const VOICE_SIMULATOR_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    oneTime: true,
    features: [
      '5 basic voices',
      'Standard quality',
      'Web Speech API only',
      'Watermarked outputs',
      '30 second limit'
    ],
    limits: {
      voices: 5,
      quality: 'standard',
      maxDuration: 30,
      watermark: true
    }
  },
  BASIC: {
    name: 'Basic',
    price: 5,
    oneTime: true,
    features: [
      '20 voices',
      'High quality',
      'Human voices included',
      '2 minute limit',
      'No watermark'
    ],
    limits: {
      voices: 20,
      quality: 'high',
      maxDuration: 120,
      watermark: false
    }
  },
  PREMIUM: {
    name: 'Premium',
    price: 10,
    oneTime: true,
    features: [
      '100 multilingual voices',
      'Premium quality',
      'Human + Party voices',
      '10 minute limit',
      'Voice customization',
      'Export to file'
    ],
    limits: {
      voices: 100,
      quality: 'premium',
      maxDuration: 600,
      watermark: false,
      customization: true,
      export: true
    }
  },
  TOP_TIER: {
    name: 'Top Tier',
    price: 20,
    oneTime: true,
    features: [
      'All 200 multilingual voices',
      'Ultra quality',
      'Human + Party + Custom voices',
      'Unlimited duration',
      'Advanced customization',
      'Voice cloning',
      'Commercial license',
      'API access',
      'Priority processing'
    ],
    limits: {
      voices: 200,
      quality: 'ultra',
      maxDuration: -1, // unlimited
      watermark: false,
      customization: true,
      voiceCloning: true,
      commercial: true,
      apiAccess: true,
      export: true
    }
  }
};

export class VoiceSimulatorPricing {
  constructor() {
    this.userPurchases = new Map();
  }

  async initialize(userId) {
    await this.loadUserPurchases(userId);
  }

  async loadUserPurchases(userId) {
    try {
      const purchases = await base44.entities.VoiceSimulatorPurchase.filter({
        user_id: userId
      });

      purchases.forEach(purchase => {
        this.userPurchases.set(purchase.tier, purchase);
      });

    } catch (error) {
      console.error('Error loading voice purchases:', error);
    }
  }

  getUserTier(userId) {
    // Determine highest tier user has purchased
    const tiers = ['TOP_TIER', 'PREMIUM', 'BASIC', 'FREE'];
    
    for (const tier of tiers) {
      if (this.userPurchases.has(tier)) {
        return tier;
      }
    }

    return 'FREE';
  }

  getTierConfig(tier) {
    return VOICE_SIMULATOR_TIERS[tier] || VOICE_SIMULATOR_TIERS.FREE;
  }

  async purchaseTier(userId, tier, paymentMethod = 'stripe') {
    const tierConfig = VOICE_SIMULATOR_TIERS[tier];
    
    if (!tierConfig) {
      throw new Error('Invalid tier');
    }

    // Check if already purchased
    if (this.userPurchases.has(tier)) {
      return {
        success: false,
        error: 'Tier already purchased',
        alreadyOwned: true
      };
    }

    try {
      // Process one-time payment
      const payment = await this.processOneTimePayment(
        userId,
        tierConfig.price,
        `Voice Simulator ${tierConfig.name} - One-time purchase`
      );

      if (!payment.success) {
        throw new Error('Payment failed');
      }

      // Record purchase
      const purchase = await base44.entities.VoiceSimulatorPurchase.create({
        user_id: userId,
        tier,
        price: tierConfig.price,
        purchased_at: new Date().toISOString(),
        payment_id: payment.paymentId,
        one_time: true
      });

      this.userPurchases.set(tier, purchase);

      return {
        success: true,
        tier,
        purchase
      };

    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processOneTimePayment(userId, amount, description) {
    // Process one-time payment through Stripe
    const { stripeIntegration } = await import('./stripeIntegration');
    
    return await stripeIntegration.createOneTimePayment(
      amount,
      description,
      userId
    );
  }

  canAccessVoice(userId, voiceId) {
    const userTier = this.getUserTier(userId);
    const tierConfig = this.getTierConfig(userTier);
    
    // Check if voice is within user's limit
    const voiceNumber = parseInt(voiceId.split('_')[1]);
    return voiceNumber <= tierConfig.limits.voices;
  }

  canGenerateVoice(userId, durationSeconds) {
    const userTier = this.getUserTier(userId);
    const tierConfig = this.getTierConfig(userTier);
    
    const maxDuration = tierConfig.limits.maxDuration;
    
    if (maxDuration === -1) return { allowed: true }; // unlimited
    
    if (durationSeconds > maxDuration) {
      return {
        allowed: false,
        reason: 'duration_exceeds_limit',
        maxDuration,
        currentTier: userTier,
        upgradeRequired: true
      };
    }

    return { allowed: true };
  }

  getUpgradeOptions(currentTier) {
    const tiers = ['FREE', 'BASIC', 'PREMIUM', 'TOP_TIER'];
    const currentIndex = tiers.indexOf(currentTier);
    
    return tiers
      .slice(currentIndex + 1)
      .map(tier => ({
        tier,
        config: VOICE_SIMULATOR_TIERS[tier]
      }));
  }

  getPricingDisplay() {
    return Object.entries(VOICE_SIMULATOR_TIERS).map(([tier, config]) => ({
      tier,
      name: config.name,
      price: config.price,
      oneTime: config.oneTime,
      features: config.features,
      recommended: tier === 'PREMIUM'
    }));
  }
}

export const voiceSimulatorPricing = new VoiceSimulatorPricing();
