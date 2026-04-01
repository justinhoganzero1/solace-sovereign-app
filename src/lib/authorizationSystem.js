/**
 * Authorization and Role-Based Access Control System
 * Owner vs User separation with strict security controls
 */

export const OWNER_EMAIL = 'justinhoganzero1@gmail.com'; // Owner's email - CHANGE THIS

export const USER_ROLES = {
  OWNER: 'owner',
  FREE_FOR_LIFE: 'free_for_life',
  TOP_TIER: 'top_tier',
  PREMIUM: 'premium',
  BASIC: 'basic',
  TRIAL: 'trial',
  FREE: 'free'
};

export const SUBSCRIPTION_TIERS = {
  TOP_TIER: {
    name: 'Top Tier',
    price: 200,
    interval: 'month',
    features: [
      'Unlimited app generation',
      'All 200 multilingual voices',
      'Unlimited movie generation (up to 120min)',
      'All wearables integration',
      'Priority support',
      'Advanced analytics',
      'White-label options',
      'API access',
      'Custom branding',
      'No watermarks'
    ],
    limits: {
      appsPerMonth: -1, // unlimited
      moviesPerMonth: -1,
      movieMaxDuration: 7200,
      voicesAccess: 200,
      storageGB: 1000
    }
  },
  PREMIUM: {
    name: 'Premium',
    price: 50,
    interval: 'month',
    features: [
      '50 apps per month',
      '100 multilingual voices',
      '20 movies per month (up to 60min)',
      'Standard wearables integration',
      'Email support',
      'Basic analytics'
    ],
    limits: {
      appsPerMonth: 50,
      moviesPerMonth: 20,
      movieMaxDuration: 3600,
      voicesAccess: 100,
      storageGB: 100
    }
  },
  BASIC: {
    name: 'Basic',
    price: 15,
    interval: 'month',
    features: [
      '10 apps per month',
      '20 multilingual voices',
      '5 movies per month (up to 10min)',
      'Basic features only',
      'Community support'
    ],
    limits: {
      appsPerMonth: 10,
      moviesPerMonth: 5,
      movieMaxDuration: 600,
      voicesAccess: 20,
      storageGB: 10
    }
  },
  TRIAL: {
    name: 'Trial',
    price: 0,
    interval: 'trial',
    duration: 3, // days
    features: [
      '3 apps during trial',
      '10 voices',
      '2 movies (up to 5min)',
      'All features unlocked for 3 days',
      'Frequent upgrade prompts'
    ],
    limits: {
      appsPerMonth: 3,
      moviesPerMonth: 2,
      movieMaxDuration: 300,
      voicesAccess: 10,
      storageGB: 1
    }
  },
  FREE: {
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      '1 app per month',
      '5 voices',
      'No movie generation',
      'Basic features only',
      'Watermarked outputs'
    ],
    limits: {
      appsPerMonth: 1,
      moviesPerMonth: 0,
      movieMaxDuration: 0,
      voicesAccess: 5,
      storageGB: 0.5
    }
  }
};

export const SAFETY_FEATURES = [
  'panic_button',
  'emergency_mode',
  'stalking_protection',
  'harassment_protection',
  'elderly_safety',
  'crisis_hub',
  'location_tracking_emergency',
  'emergency_contacts'
];

export const RESTRICTED_FEATURES = {
  // Features only owner can access
  OWNER_ONLY: [
    'build_app_maker',
    'clone_solace',
    'owner_dashboard',
    'user_management',
    'revenue_analytics',
    'system_settings',
    'api_key_management',
    'database_access',
    'security_settings',
    'windsurf_integration'
  ],
  
  // Features requiring top tier
  TOP_TIER_ONLY: [
    'unlimited_generation',
    'white_label',
    'api_access',
    'custom_branding',
    'priority_support'
  ],
  
  // Features requiring premium or higher
  PREMIUM_PLUS: [
    'advanced_wearables',
    'long_movies',
    'bulk_generation',
    'analytics_dashboard'
  ],
  
  // Features requiring paid subscription
  PAID_ONLY: [
    'remove_watermarks',
    'commercial_use',
    'export_source_code',
    'cloud_storage'
  ]
};

export class AuthorizationSystem {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.subscriptionTier = null;
    this.trialStartDate = null;
    this.usageLimits = null;
  }

  async initialize(user) {
    this.currentUser = user;
    await this.determineRole();
    await this.loadSubscription();
    await this.checkTrialStatus();
    await this.loadUsageLimits();
  }

  async determineRole() {
    if (!this.currentUser) {
      this.userRole = null;
      return;
    }

    // Check if owner
    if (this.currentUser.email === OWNER_EMAIL) {
      this.userRole = USER_ROLES.OWNER;
      return;
    }

    // Check subscription status
    const subscription = await this.getActiveSubscription();
    if (subscription) {
      this.userRole = subscription.tier;
    } else {
      // Check if in trial
      const trialStatus = await this.getTrialStatus();
      if (trialStatus && trialStatus.active) {
        this.userRole = USER_ROLES.TRIAL;
      } else {
        this.userRole = USER_ROLES.FREE;
      }
    }
  }

  async getActiveSubscription() {
    // Query database for active subscription
    try {
      const subscriptions = await base44.entities.Subscription.filter({
        user_email: this.currentUser.email,
        status: 'active'
      });
      return subscriptions.length > 0 ? subscriptions[0] : null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  async getTrialStatus() {
    try {
      const trials = await base44.entities.TrialStatus.filter({
        user_email: this.currentUser.email
      });
      
      if (trials.length === 0) return null;
      
      const trial = trials[0];
      const startDate = new Date(trial.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3); // 3 day trial
      
      const now = new Date();
      const active = now < endDate;
      
      return {
        active,
        startDate,
        endDate,
        daysRemaining: active ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 0
      };
    } catch (error) {
      console.error('Error fetching trial status:', error);
      return null;
    }
  }

  async loadSubscription() {
    const tierMap = {
      [USER_ROLES.TOP_TIER]: SUBSCRIPTION_TIERS.TOP_TIER,
      [USER_ROLES.PREMIUM]: SUBSCRIPTION_TIERS.PREMIUM,
      [USER_ROLES.BASIC]: SUBSCRIPTION_TIERS.BASIC,
      [USER_ROLES.TRIAL]: SUBSCRIPTION_TIERS.TRIAL,
      [USER_ROLES.FREE]: SUBSCRIPTION_TIERS.FREE
    };

    this.subscriptionTier = tierMap[this.userRole] || SUBSCRIPTION_TIERS.FREE;
  }

  async checkTrialStatus() {
    if (this.userRole === USER_ROLES.TRIAL) {
      const trialStatus = await this.getTrialStatus();
      this.trialStartDate = trialStatus?.startDate;
    }
  }

  async loadUsageLimits() {
    try {
      const usage = await base44.entities.UsageTracking.filter({
        user_email: this.currentUser.email,
        month: new Date().getMonth(),
        year: new Date().getFullYear()
      });

      this.usageLimits = usage.length > 0 ? usage[0] : {
        appsGenerated: 0,
        moviesGenerated: 0,
        storageUsedGB: 0
      };
    } catch (error) {
      console.error('Error loading usage limits:', error);
      this.usageLimits = {
        appsGenerated: 0,
        moviesGenerated: 0,
        storageUsedGB: 0
      };
    }
  }

  isOwner() {
    return this.userRole === USER_ROLES.OWNER;
  }

  canAccessFeature(featureName) {
    // Safety features are ALWAYS free for everyone
    if (SAFETY_FEATURES.includes(featureName)) {
      return true;
    }

    // Owner can access everything
    if (this.isOwner()) return true;

    // Free-for-life users get everything except owner-only features
    if (this.userRole === USER_ROLES.FREE_FOR_LIFE) {
      return !RESTRICTED_FEATURES.OWNER_ONLY.includes(featureName);
    }

    // Check owner-only features
    if (RESTRICTED_FEATURES.OWNER_ONLY.includes(featureName)) {
      return false;
    }

    // Check top tier features
    if (RESTRICTED_FEATURES.TOP_TIER_ONLY.includes(featureName)) {
      return this.userRole === USER_ROLES.TOP_TIER;
    }

    // Check premium+ features
    if (RESTRICTED_FEATURES.PREMIUM_PLUS.includes(featureName)) {
      return [USER_ROLES.TOP_TIER, USER_ROLES.PREMIUM].includes(this.userRole);
    }

    // Check paid features
    if (RESTRICTED_FEATURES.PAID_ONLY.includes(featureName)) {
      return ![USER_ROLES.FREE, USER_ROLES.TRIAL].includes(this.userRole);
    }

    return true;
  }

  canBuildAppMaker() {
    // ONLY owner can build app makers or clone SOLACE
    return this.isOwner();
  }

  canCloneSolace() {
    // ONLY owner can clone SOLACE
    return this.isOwner();
  }

  async canGenerateApp() {
    if (this.isOwner()) return { allowed: true };

    const limit = this.subscriptionTier.limits.appsPerMonth;
    if (limit === -1) return { allowed: true }; // unlimited

    if (this.usageLimits.appsGenerated >= limit) {
      return {
        allowed: false,
        reason: 'monthly_limit_reached',
        limit,
        used: this.usageLimits.appsGenerated,
        upgradeRequired: true
      };
    }

    return { allowed: true };
  }

  async canGenerateMovie(durationSeconds) {
    if (this.isOwner()) return { allowed: true, cost: 0 };

    const limit = this.subscriptionTier.limits.moviesPerMonth;
    const maxDuration = this.subscriptionTier.limits.movieMaxDuration;

    if (this.usageLimits.moviesGenerated >= limit) {
      return {
        allowed: false,
        reason: 'monthly_limit_reached',
        limit,
        used: this.usageLimits.moviesGenerated,
        upgradeRequired: true
      };
    }

    if (durationSeconds > maxDuration) {
      return {
        allowed: false,
        reason: 'duration_exceeds_limit',
        maxDuration,
        requested: durationSeconds,
        upgradeRequired: true
      };
    }

    // Calculate cost for videos over 10 seconds
    let cost = 0;
    if (durationSeconds > 10) {
      const chargeableMinutes = Math.ceil((durationSeconds - 10) / 60);
      cost = chargeableMinutes * 3;
    }

    return { allowed: true, cost };
  }

  async trackUsage(type, amount = 1) {
    // Don't track owner or free-for-life usage
    if (this.isOwner() || this.userRole === USER_ROLES.FREE_FOR_LIFE) return;

    try {
      const month = new Date().getMonth();
      const year = new Date().getFullYear();

      const usage = await base44.entities.UsageTracking.filter({
        user_email: this.currentUser.email,
        month,
        year
      });

      const updates = {};
      if (type === 'app') updates.appsGenerated = (this.usageLimits.appsGenerated || 0) + amount;
      if (type === 'movie') updates.moviesGenerated = (this.usageLimits.moviesGenerated || 0) + amount;
      if (type === 'storage') updates.storageUsedGB = (this.usageLimits.storageUsedGB || 0) + amount;

      if (usage.length > 0) {
        await base44.entities.UsageTracking.update(usage[0].id, updates);
      } else {
        await base44.entities.UsageTracking.create({
          user_email: this.currentUser.email,
          month,
          year,
          appsGenerated: type === 'app' ? amount : 0,
          moviesGenerated: type === 'movie' ? amount : 0,
          storageUsedGB: type === 'storage' ? amount : 0
        });
      }

      // Update local cache
      Object.assign(this.usageLimits, updates);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }

  shouldShowPaywall(context = 'general') {
    // Safety features never show paywalls
    if (SAFETY_FEATURES.includes(context)) return false;

    // Owner never sees paywalls
    if (this.isOwner()) return false;

    // Free-for-life users never see paywalls
    if (this.userRole === USER_ROLES.FREE_FOR_LIFE) return false;

    // Trial users see paywalls frequently
    if (this.userRole === USER_ROLES.TRIAL) {
      // Show paywall 30% of the time for trial users
      return Math.random() < 0.3;
    }

    // Free users see paywalls very frequently
    if (this.userRole === USER_ROLES.FREE) {
      // Show paywall 50% of the time for free users
      return Math.random() < 0.5;
    }

    return false;
  }

  getUpgradePrompt() {
    if (this.userRole === USER_ROLES.TRIAL) {
      const trialStatus = this.getTrialStatus();
      return {
        title: `Trial: ${trialStatus?.daysRemaining || 0} days left`,
        message: 'Upgrade now to keep full access to all features!',
        cta: 'Upgrade to Premium',
        urgency: 'high'
      };
    }

    if (this.userRole === USER_ROLES.FREE) {
      return {
        title: 'Unlock Premium Features',
        message: 'Get unlimited access to all tools and remove watermarks',
        cta: 'Start Your Trial',
        urgency: 'medium'
      };
    }

    if (this.userRole === USER_ROLES.BASIC) {
      return {
        title: 'Upgrade to Premium',
        message: 'Generate more apps and longer movies with Premium',
        cta: 'Upgrade Now',
        urgency: 'low'
      };
    }

    return null;
  }

  getDashboardRoute() {
    return this.isOwner() ? '/OwnerDashboard' : '/Dashboard';
  }

  async grantFreeForLife(userId, grantedBy) {
    // Grant free-for-life access to a user (owner only)
    if (!this.isOwner()) {
      throw new Error('Only owner can grant free-for-life access');
    }

    try {
      await base44.entities.FreeForLifeGrant.create({
        user_id: userId,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
        reason: 'Owner granted',
        security_restrictions: true // Always have security restrictions
      });

      return { success: true };
    } catch (error) {
      console.error('Error granting free-for-life:', error);
      throw error;
    }
  }

  async checkFreeForLifeStatus(userId) {
    // Check if user has free-for-life access
    try {
      const grants = await base44.entities.FreeForLifeGrant.filter({ user_id: userId });
      return grants.length > 0;
    } catch (error) {
      return false;
    }
  }

  getAccessibleFeatures() {
    const features = {
      appGeneration: this.canAccessFeature('app_generation'),
      movieGeneration: this.canAccessFeature('movie_generation'),
      voiceGeneration: this.canAccessFeature('voice_generation'),
      wearablesIntegration: this.canAccessFeature('wearables_integration'),
      analytics: this.canAccessFeature('analytics_dashboard'),
      apiAccess: this.canAccessFeature('api_access'),
      whiteLabel: this.canAccessFeature('white_label'),
      customBranding: this.canAccessFeature('custom_branding'),
      // Safety features always accessible
      panicButton: true,
      emergencyMode: true,
      stalkingProtection: true,
      elderlySafety: true
    };

    return features;
  }
}

export const authSystem = new AuthorizationSystem();
