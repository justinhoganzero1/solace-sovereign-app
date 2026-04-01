/**
 * Stripe Payment Integration
 * Handles subscriptions, one-time payments, and billing
 */

import { SUBSCRIPTION_TIERS } from './authorizationSystem';

export class StripeIntegration {
  constructor() {
    this.stripe = null;
    this.publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Load Stripe.js
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      this.stripe = window.Stripe(this.publishableKey);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  async createSubscription(tier, userEmail) {
    await this.initialize();

    const tierConfig = SUBSCRIPTION_TIERS[tier.toUpperCase()];
    if (!tierConfig) {
      throw new Error(`Invalid subscription tier: ${tier}`);
    }

    try {
      // Create checkout session via backend
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier.toUpperCase(),
          userEmail,
          priceId: this.getPriceId(tier),
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/subscription-cancelled`
        })
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await this.stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Subscription creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async createOneTimePayment(amount, description, userEmail) {
    await this.initialize();

    try {
      const response = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          description,
          userEmail,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/payment-cancelled`
        })
      });

      const { sessionId } = await response.json();

      const { error } = await this.stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Payment creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  getPriceId(tier) {
    // These would be your actual Stripe Price IDs
    const priceIds = {
      TOP_TIER: 'price_top_tier_monthly',
      PREMIUM: 'price_premium_monthly',
      BASIC: 'price_basic_monthly'
    };

    return priceIds[tier.toUpperCase()] || null;
  }

  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async updatePaymentMethod(customerId) {
    await this.initialize();

    try {
      const response = await fetch('/api/stripe/update-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin
        })
      });

      const { sessionId } = await response.json();

      const { error } = await this.stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Payment method update failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getBillingPortalUrl(customerId) {
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin
        })
      });

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Failed to get billing portal URL:', error);
      return null;
    }
  }

  formatPrice(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getSubscriptionDetails(tier) {
    const tierConfig = SUBSCRIPTION_TIERS[tier.toUpperCase()];
    if (!tierConfig) return null;

    return {
      name: tierConfig.name,
      price: this.formatPrice(tierConfig.price),
      interval: tierConfig.interval,
      features: tierConfig.features,
      limits: tierConfig.limits
    };
  }
}

export const stripeIntegration = new StripeIntegration();
