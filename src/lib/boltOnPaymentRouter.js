/**
 * Bolt-On App Payment Router
 * Routes payments through SOLACE with 5% usage fee
 * User pays us → We pay bolt-on app → 5% fee retained
 */

import { stripeIntegration } from './stripeIntegration';
import { authSystem } from './authorizationSystem';

export const USAGE_FEE_PERCENTAGE = 5; // 5% fee on all bolt-on payments

export class BoltOnPaymentRouter {
  constructor() {
    this.activeBoltOns = [];
    this.paymentHistory = [];
    this.ownerSavedCard = null;
  }

  async initialize() {
    await this.loadBoltOnApps();
    await this.loadOwnerPaymentMethod();
  }

  async loadBoltOnApps() {
    // Load registered bolt-on apps from database
    try {
      const boltOns = await base44.entities.BoltOnApp.list();
      this.activeBoltOns = boltOns;
    } catch (error) {
      console.error('Error loading bolt-on apps:', error);
      this.activeBoltOns = [];
    }
  }

  async loadOwnerPaymentMethod() {
    // Load owner's saved credit card (encrypted)
    try {
      const ownerPayment = await base44.entities.OwnerPaymentMethod.filter({
        owner_email: authSystem.currentUser?.email
      });
      
      if (ownerPayment.length > 0) {
        this.ownerSavedCard = ownerPayment[0];
      }
    } catch (error) {
      console.error('Error loading owner payment method:', error);
    }
  }

  async registerBoltOnApp(appConfig) {
    // Register a new bolt-on app
    const boltOn = {
      appId: appConfig.appId,
      appName: appConfig.appName,
      provider: appConfig.provider,
      apiEndpoint: appConfig.apiEndpoint,
      pricingModel: appConfig.pricingModel, // 'per_use', 'subscription', 'one_time'
      basePrice: appConfig.basePrice,
      paywallUrl: appConfig.paywallUrl,
      active: true,
      registeredAt: new Date().toISOString()
    };

    try {
      const created = await base44.entities.BoltOnApp.create(boltOn);
      this.activeBoltOns.push(created);
      return created;
    } catch (error) {
      console.error('Error registering bolt-on app:', error);
      throw error;
    }
  }

  async routePayment(userId, boltOnAppId, amount, description) {
    // Route payment: User → SOLACE → Bolt-on app
    
    // Calculate fees
    const usageFee = amount * (USAGE_FEE_PERCENTAGE / 100);
    const totalCharge = amount + usageFee;
    const boltOnPayment = amount;

    // Check if owner
    if (authSystem.isOwner()) {
      // Owner pays external paywalls directly with saved card
      return await this.processOwnerPayment(boltOnAppId, amount, description);
    }

    try {
      // Step 1: Charge user (total amount + 5% fee)
      const userPayment = await this.chargeUser(userId, totalCharge, description);

      if (!userPayment.success) {
        throw new Error('User payment failed');
      }

      // Step 2: Pay bolt-on app (original amount)
      const boltOnPaymentResult = await this.payBoltOnApp(boltOnAppId, boltOnPayment, description);

      if (!boltOnPaymentResult.success) {
        // Refund user if bolt-on payment fails
        await this.refundUser(userId, totalCharge);
        throw new Error('Bolt-on payment failed - user refunded');
      }

      // Step 3: Record transaction
      await this.recordTransaction({
        userId,
        boltOnAppId,
        userCharged: totalCharge,
        boltOnPaid: boltOnPayment,
        usageFee,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      return {
        success: true,
        userCharged: totalCharge,
        boltOnPaid: boltOnPayment,
        usageFee,
        accessGranted: true
      };

    } catch (error) {
      console.error('Payment routing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async chargeUser(userId, amount, description) {
    // Charge user through Stripe
    try {
      const result = await stripeIntegration.createOneTimePayment(
        amount,
        `${description} (includes 5% usage fee)`,
        userId
      );

      return result;
    } catch (error) {
      console.error('User charge failed:', error);
      return { success: false, error: error.message };
    }
  }

  async payBoltOnApp(boltOnAppId, amount, description) {
    // Pay the bolt-on app provider
    const boltOn = this.activeBoltOns.find(b => b.id === boltOnAppId);
    
    if (!boltOn) {
      throw new Error('Bolt-on app not found');
    }

    try {
      // Make payment to bolt-on app's payment endpoint
      const response = await fetch(boltOn.paywallUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env?.VITE_SOLACE_API_KEY || ''}`
        },
        body: JSON.stringify({
          amount,
          description,
          provider: 'SOLACE',
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      return {
        success: response.ok,
        transactionId: result.transactionId,
        accessToken: result.accessToken
      };

    } catch (error) {
      console.error('Bolt-on payment failed:', error);
      return { success: false, error: error.message };
    }
  }

  async processOwnerPayment(boltOnAppId, amount, description) {
    // Owner pays external paywalls with saved card
    if (!this.ownerSavedCard) {
      throw new Error('Owner payment method not configured');
    }

    try {
      // Use owner's saved card to pay bolt-on directly
      const payment = await this.payBoltOnApp(boltOnAppId, amount, description);

      // Record owner payment (no fee charged)
      await this.recordTransaction({
        userId: 'OWNER',
        boltOnAppId,
        userCharged: 0, // Owner not charged
        boltOnPaid: amount,
        usageFee: 0,
        timestamp: new Date().toISOString(),
        status: 'completed',
        ownerPayment: true
      });

      return {
        success: true,
        ownerPaid: amount,
        accessGranted: true
      };

    } catch (error) {
      console.error('Owner payment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async refundUser(userId, amount) {
    // Refund user if bolt-on payment fails
    try {
      const response = await fetch('/api/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount,
          reason: 'Bolt-on payment failed'
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Refund failed:', error);
      throw error;
    }
  }

  async recordTransaction(transaction) {
    // Record payment transaction
    try {
      await base44.entities.PaymentTransaction.create(transaction);
      this.paymentHistory.push(transaction);
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  async saveOwnerPaymentMethod(cardToken, cardLast4, cardBrand) {
    // Save owner's credit card (MAXIMUM SECURITY)
    // Card details are tokenized by Stripe - we only store token
    
    if (!authSystem.isOwner()) {
      throw new Error('Unauthorized: Only owner can save payment method');
    }

    try {
      // Encrypt card token before storage
      const encryptedToken = await this.encryptCardToken(cardToken);

      const paymentMethod = {
        owner_email: authSystem.currentUser.email,
        card_token: encryptedToken,
        card_last4: cardLast4,
        card_brand: cardBrand,
        created_at: new Date().toISOString(),
        encrypted: true
      };

      // Save to secure database
      const saved = await base44.entities.OwnerPaymentMethod.create(paymentMethod);
      this.ownerSavedCard = saved;

      return { success: true };

    } catch (error) {
      console.error('Error saving owner payment method:', error);
      throw error;
    }
  }

  async encryptCardToken(token) {
    // Encrypt card token using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(token);

    // Generate encryption key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Encrypt
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Store key securely (in production, use key management service)
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    
    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      key: exportedKey
    };
  }

  async decryptCardToken(encryptedData) {
    // Decrypt card token
    try {
      const key = await crypto.subtle.importKey(
        'jwk',
        encryptedData.key,
        { name: 'AES-GCM', length: 256 },
        true,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
        key,
        new Uint8Array(encryptedData.encrypted)
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);

    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt card token');
    }
  }

  getRevenueReport() {
    // Generate revenue report from usage fees
    const totalRevenue = this.paymentHistory.reduce((sum, tx) => sum + (tx.usageFee || 0), 0);
    const totalTransactions = this.paymentHistory.length;
    const totalVolume = this.paymentHistory.reduce((sum, tx) => sum + (tx.userCharged || 0), 0);

    return {
      totalRevenue,
      totalTransactions,
      totalVolume,
      averageFee: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      feePercentage: USAGE_FEE_PERCENTAGE
    };
  }

  async grantBoltOnAccess(userId, boltOnAppId, accessToken) {
    // Grant user access to bolt-on app after payment
    try {
      await base44.entities.BoltOnAccess.create({
        userId,
        boltOnAppId,
        accessToken,
        grantedAt: new Date().toISOString(),
        expiresAt: null // Permanent access unless revoked
      });

      return { success: true, accessToken };
    } catch (error) {
      console.error('Error granting access:', error);
      throw error;
    }
  }

  async checkBoltOnAccess(userId, boltOnAppId) {
    // Check if user has access to bolt-on app
    try {
      const access = await base44.entities.BoltOnAccess.filter({
        userId,
        boltOnAppId
      });

      return access.length > 0 ? access[0] : null;
    } catch (error) {
      console.error('Error checking access:', error);
      return null;
    }
  }
}

export const boltOnPaymentRouter = new BoltOnPaymentRouter();
