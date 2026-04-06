/* ═══════════════════════════════════════════════════════════
   SOLACE MONETIZATION ENGINE
   Tiered pricing, Stripe integration, paywall management,
   family freebies, and feature gating.
   ═══════════════════════════════════════════════════════════ */

const STRIPE_PUBLIC_KEY = 'pk_live_REPLACE_WITH_YOUR_STRIPE_KEY'; // Replace with real key

// ── PRICING TIERS ──
const TIERS = {
  free: {
    id: 'free',
    name: 'Free Explorer',
    price: 0,
    interval: null,
    features: [
      'Basic Oracle chat (50 msgs/day)',
      '3 AI friend personalities',
      'Basic voice synthesis',
      'Limited diagnostics',
      'Community hub access',
    ],
    limits: {
      messagesPerDay: 50,
      aiFriends: 3,
      voiceMinutes: 5,
      movieMaker: false,
      videoEditor: false,
      avatarCustomizer: false,
      liveVision: false,
      inventorFull: false,
      roomDecoration: false,
    },
  },
  tier1: {
    id: 'tier1',
    name: 'Solace Plus',
    prices: {
      monthly: { amount: 2000, label: '$20/month', stripePriceId: 'price_tier1_monthly' },
      quarterly: { amount: 6000, label: '$60/3 months ($20/mo)', stripePriceId: 'price_tier1_quarterly' },
    },
    features: [
      'Unlimited Oracle chat',
      '20 AI friend personalities',
      'Voice-only mode',
      'Movie Maker access',
      'Video Editor access',
      'Basic avatar customizer',
      'Full diagnostics',
      'All specialist access',
      'Priority response times',
    ],
    limits: {
      messagesPerDay: Infinity,
      aiFriends: 20,
      voiceMinutes: 60,
      movieMaker: true,
      videoEditor: true,
      avatarCustomizer: true,
      liveVision: true,
      inventorFull: false,
      roomDecoration: false,
    },
  },
  tier2: {
    id: 'tier2',
    name: 'Solace Pro',
    prices: {
      sixMonth: { amount: 10000, label: '$100/6 months (~$16.67/mo)', stripePriceId: 'price_tier2_6month' },
      yearly: { amount: 12000, label: '$120/year ($10/mo)', stripePriceId: 'price_tier2_yearly' },
    },
    features: [
      'Everything in Plus',
      'ALL 100+ AI personalities',
      'Girlfriend/Boyfriend avatar with animated room',
      'Room decoration ($5 partial / $20 full)',
      'Full Inventor/App Maker',
      'Multi-AI engine (10+ models)',
      'Wearable mood sync',
      'Owner dashboard analytics',
      'Marketing Hub',
      'Professional Hub full access',
      'Priority voice synthesis',
      'Unlimited storage',
    ],
    limits: {
      messagesPerDay: Infinity,
      aiFriends: Infinity,
      voiceMinutes: Infinity,
      movieMaker: true,
      videoEditor: true,
      avatarCustomizer: true,
      liveVision: true,
      inventorFull: true,
      roomDecoration: true,
    },
  },
  owner: {
    id: 'owner',
    name: 'Owner',
    price: 0,
    features: ['Everything unlocked', 'Admin dashboard', 'Revenue analytics', 'Family freebies management'],
    limits: {
      messagesPerDay: Infinity,
      aiFriends: Infinity,
      voiceMinutes: Infinity,
      movieMaker: true,
      videoEditor: true,
      avatarCustomizer: true,
      liveVision: true,
      inventorFull: true,
      roomDecoration: true,
    },
  },
};

// ── IN-APP PURCHASES ──
const IAP = {
  room_partial: { id: 'room_partial', name: 'Partial Room Furnishing', price: 500, label: '$5', stripePriceId: 'price_room_partial' },
  room_full: { id: 'room_full', name: 'Full Room Furnishing', price: 2000, label: '$20', stripePriceId: 'price_room_full' },
  extra_friends_pack: { id: 'extra_friends_pack', name: '10 Extra AI Friends', price: 500, label: '$5', stripePriceId: 'price_friends_pack' },
  premium_voice: { id: 'premium_voice', name: 'Premium Voice Pack', price: 300, label: '$3', stripePriceId: 'price_premium_voice' },
  avatar_outfit: { id: 'avatar_outfit', name: 'Avatar Outfit Pack', price: 200, label: '$2', stripePriceId: 'price_avatar_outfit' },
};

// ── FAMILY FREEBIES ──
const OWNER_EMAIL = 'justinbretthogan@gmail.com';
const FAMILY_STORAGE_KEY = 'solace_family_members';

function getFamilyMembers() {
  try { return JSON.parse(localStorage.getItem(FAMILY_STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function addFamilyMember(email) {
  const members = getFamilyMembers();
  if (members.includes(email)) return false;
  members.push(email);
  localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(members));
  return true;
}

function removeFamilyMember(email) {
  const members = getFamilyMembers().filter(m => m !== email);
  localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(members));
}

function isFamilyMember(email) {
  return getFamilyMembers().includes(email);
}

// ── USER SUBSCRIPTION STATE ──
const SUB_KEY = 'solace_subscription';

function getSubscription() {
  try {
    const sub = JSON.parse(localStorage.getItem(SUB_KEY) || 'null');
    if (!sub) return { tier: 'free', active: true };
    // Check expiry
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
      return { tier: 'free', active: true, expired: true };
    }
    return sub;
  } catch { return { tier: 'free', active: true }; }
}

function setSubscription(tierId, interval, stripeSubId) {
  const durations = { monthly: 30, quarterly: 90, sixMonth: 180, yearly: 365 };
  const days = durations[interval] || 30;
  const sub = {
    tier: tierId,
    active: true,
    interval,
    stripeSubscriptionId: stripeSubId,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
  };
  localStorage.setItem(SUB_KEY, JSON.stringify(sub));
  return sub;
}

function isOwner(email) {
  return email === OWNER_EMAIL;
}

function getUserTier(email) {
  if (isOwner(email)) return 'owner';
  if (isFamilyMember(email)) return 'tier2'; // family gets pro
  return getSubscription().tier;
}

function getTierInfo(tierId) {
  return TIERS[tierId] || TIERS.free;
}

function canAccessFeature(email, feature) {
  const tier = getUserTier(email);
  const info = TIERS[tier];
  if (!info) return false;
  return info.limits[feature] === true || info.limits[feature] === Infinity;
}

function getMessageLimit(email) {
  const tier = getUserTier(email);
  return TIERS[tier]?.limits?.messagesPerDay || 50;
}

// ── STRIPE CHECKOUT ──
async function createCheckout(priceId, successUrl, cancelUrl) {
  // In production, this calls your backend to create a Stripe checkout session
  // For now, we'll use Stripe.js directly (requires backend for real payments)
  try {
    if (typeof window !== 'undefined' && window.Stripe) {
      const stripe = window.Stripe(STRIPE_PUBLIC_KEY);
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: successUrl || window.location.origin + '?payment=success',
        cancelUrl: cancelUrl || window.location.origin + '?payment=cancelled',
      });
      if (error) console.error('Stripe error:', error);
    } else {
      console.warn('Stripe not loaded. Add <script src="https://js.stripe.com/v3/"></script> to index.html');
      // Fallback: open Stripe payment link
      alert('Stripe checkout would open here. Configure your Stripe keys to enable payments.');
    }
  } catch (err) {
    console.error('Checkout error:', err);
  }
}

async function createOneTimePayment(priceId, successUrl, cancelUrl) {
  try {
    if (typeof window !== 'undefined' && window.Stripe) {
      const stripe = window.Stripe(STRIPE_PUBLIC_KEY);
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        successUrl: successUrl || window.location.origin + '?payment=success',
        cancelUrl: cancelUrl || window.location.origin + '?payment=cancelled',
      });
      if (error) console.error('Stripe error:', error);
    } else {
      alert('Stripe checkout would open here. Configure your Stripe keys to enable payments.');
    }
  } catch (err) {
    console.error('Payment error:', err);
  }
}

// ── REVENUE TRACKING (for owner dashboard) ──
const REVENUE_KEY = 'solace_revenue_log';

function logRevenue(amount, type, email, details) {
  try {
    const log = JSON.parse(localStorage.getItem(REVENUE_KEY) || '[]');
    log.push({
      amount, type, email, details,
      timestamp: new Date().toISOString(),
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    });
    localStorage.setItem(REVENUE_KEY, JSON.stringify(log));
  } catch {}
}

function getRevenueLog() {
  try { return JSON.parse(localStorage.getItem(REVENUE_KEY) || '[]'); }
  catch { return []; }
}

function getRevenueSummary() {
  const log = getRevenueLog();
  const now = new Date();
  const thisMonth = log.filter(r => {
    const d = new Date(r.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const total = log.reduce((s, r) => s + (r.amount || 0), 0);
  const monthly = thisMonth.reduce((s, r) => s + (r.amount || 0), 0);
  return {
    totalRevenue: total / 100,
    monthlyRevenue: monthly / 100,
    totalTransactions: log.length,
    monthlyTransactions: thisMonth.length,
    subscribers: [...new Set(log.filter(r => r.type === 'subscription').map(r => r.email))].length,
  };
}

export {
  TIERS, IAP, OWNER_EMAIL,
  getSubscription, setSubscription, getUserTier, getTierInfo,
  canAccessFeature, getMessageLimit, isOwner,
  getFamilyMembers, addFamilyMember, removeFamilyMember, isFamilyMember,
  createCheckout, createOneTimePayment,
  logRevenue, getRevenueLog, getRevenueSummary,
  STRIPE_PUBLIC_KEY,
};
