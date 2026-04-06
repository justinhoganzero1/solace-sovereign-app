/* ═══════════════════════════════════════════════════════════
   SOLACE APP INTEGRATION ENGINE
   - Users connect any external app/service into SOLACE
   - Stripe proxy billing: 10% admin fee, rest goes to app
   - Auto-paywall detection and pass-through payments
   - AI hooks everything up automatically
   ═══════════════════════════════════════════════════════════ */

const CONNECTED_APPS_KEY = 'solace_connected_apps';
const APP_TRANSACTIONS_KEY = 'solace_app_transactions';
const ADMIN_FEE_PERCENT = 10; // SOLACE keeps 10%

// ── CONNECTED APPS MANAGEMENT ──

function getConnectedApps() {
  try { return JSON.parse(localStorage.getItem(CONNECTED_APPS_KEY) || '[]'); }
  catch { return []; }
}

function saveConnectedApps(apps) {
  localStorage.setItem(CONNECTED_APPS_KEY, JSON.stringify(apps));
}

function connectApp(appData) {
  const apps = getConnectedApps();
  const newApp = {
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: appData.name,
    url: appData.url,
    category: appData.category || 'general',
    description: appData.description || '',
    icon: appData.icon || '📱',
    monthlyPrice: appData.monthlyPrice || 0, // in cents
    oneTimePrice: appData.oneTimePrice || 0,
    paymentType: appData.paymentType || 'free', // free | subscription | one_time | usage
    apiEndpoint: appData.apiEndpoint || null,
    apiKey: appData.apiKey || null,
    webhookUrl: appData.webhookUrl || null,
    stripeConnectId: appData.stripeConnectId || null,
    status: 'active',
    connectedAt: new Date().toISOString(),
    lastUsed: null,
    totalSpent: 0,
    usageCount: 0,
    // Billing config
    billing: {
      adminFeePercent: ADMIN_FEE_PERCENT,
      autoPayEnabled: true,
      maxMonthlySpend: appData.maxMonthlySpend || 10000, // $100 default cap
    },
  };
  apps.push(newApp);
  saveConnectedApps(apps);
  logAppTransaction(newApp.id, 'connect', 0, `Connected ${newApp.name}`);
  return newApp;
}

function disconnectApp(appId) {
  const apps = getConnectedApps();
  const idx = apps.findIndex(a => a.id === appId);
  if (idx >= 0) {
    apps[idx].status = 'disconnected';
    apps[idx].disconnectedAt = new Date().toISOString();
    saveConnectedApps(apps);
    logAppTransaction(appId, 'disconnect', 0, `Disconnected ${apps[idx].name}`);
  }
}

function getActiveApps() {
  return getConnectedApps().filter(a => a.status === 'active');
}

function getAppById(appId) {
  return getConnectedApps().find(a => a.id === appId);
}

function updateApp(appId, updates) {
  const apps = getConnectedApps();
  const idx = apps.findIndex(a => a.id === appId);
  if (idx >= 0) {
    apps[idx] = { ...apps[idx], ...updates };
    saveConnectedApps(apps);
  }
}

// ── TRANSACTION LOGGING ──

function logAppTransaction(appId, type, amountCents, description) {
  try {
    const log = JSON.parse(localStorage.getItem(APP_TRANSACTIONS_KEY) || '[]');
    const adminFee = Math.ceil(amountCents * ADMIN_FEE_PERCENT / 100);
    const appPayout = amountCents - adminFee;
    log.push({
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      appId,
      type, // connect | disconnect | subscription | one_time | usage | paywall
      totalAmount: amountCents,
      adminFee,
      appPayout,
      description,
      timestamp: new Date().toISOString(),
      status: 'completed',
    });
    localStorage.setItem(APP_TRANSACTIONS_KEY, JSON.stringify(log));

    // Update app total spent
    if (amountCents > 0) {
      const apps = getConnectedApps();
      const idx = apps.findIndex(a => a.id === appId);
      if (idx >= 0) {
        apps[idx].totalSpent = (apps[idx].totalSpent || 0) + amountCents;
        apps[idx].usageCount = (apps[idx].usageCount || 0) + 1;
        apps[idx].lastUsed = new Date().toISOString();
        saveConnectedApps(apps);
      }
    }
  } catch {}
}

function getAppTransactions(appId) {
  try {
    const log = JSON.parse(localStorage.getItem(APP_TRANSACTIONS_KEY) || '[]');
    return appId ? log.filter(t => t.appId === appId) : log;
  } catch { return []; }
}

function getTransactionSummary() {
  const transactions = getAppTransactions();
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.totalAmount > 0;
  });

  return {
    totalTransactions: transactions.filter(t => t.totalAmount > 0).length,
    monthlyTransactions: thisMonth.length,
    totalVolume: transactions.reduce((s, t) => s + (t.totalAmount || 0), 0),
    monthlyVolume: thisMonth.reduce((s, t) => s + (t.totalAmount || 0), 0),
    totalAdminFees: transactions.reduce((s, t) => s + (t.adminFee || 0), 0),
    monthlyAdminFees: thisMonth.reduce((s, t) => s + (t.adminFee || 0), 0),
    totalAppPayouts: transactions.reduce((s, t) => s + (t.appPayout || 0), 0),
    monthlyAppPayouts: thisMonth.reduce((s, t) => s + (t.appPayout || 0), 0),
  };
}

// ── STRIPE PROXY BILLING ──

async function processAppPayment(appId, amountCents, description) {
  const app = getAppById(appId);
  if (!app) throw new Error('App not found');
  if (app.status !== 'active') throw new Error('App is disconnected');

  // Calculate split
  const adminFee = Math.ceil(amountCents * ADMIN_FEE_PERCENT / 100);
  const appPayout = amountCents - adminFee;

  // Check monthly spending cap
  const monthlyTxns = getAppTransactions(appId).filter(t => {
    const d = new Date(t.timestamp);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlySpent = monthlyTxns.reduce((s, t) => s + (t.totalAmount || 0), 0);
  if (monthlySpent + amountCents > (app.billing?.maxMonthlySpend || 10000)) {
    throw new Error(`Monthly spending cap reached for ${app.name}. Current: $${(monthlySpent / 100).toFixed(2)}, Cap: $${((app.billing?.maxMonthlySpend || 10000) / 100).toFixed(2)}`);
  }

  // In production: Stripe Connect would handle the actual split payment
  // stripe.paymentIntents.create({
  //   amount: amountCents,
  //   currency: 'usd',
  //   application_fee_amount: adminFee,
  //   transfer_data: { destination: app.stripeConnectId },
  // });

  // Log the transaction
  logAppTransaction(appId, description?.includes('paywall') ? 'paywall' : 'usage', amountCents, description || `Payment to ${app.name}`);

  return {
    success: true,
    totalCharged: amountCents,
    adminFee,
    appPayout,
    app: app.name,
  };
}

// ── PAYWALL PASS-THROUGH ──

async function handlePaywall(appId, paywallInfo) {
  const app = getAppById(appId);
  if (!app) throw new Error('App not found');

  const originalPrice = paywallInfo.price || 0; // in cents
  const withAdminFee = Math.ceil(originalPrice * (1 + ADMIN_FEE_PERCENT / 100));

  return {
    originalPrice,
    solacePrice: withAdminFee,
    adminFee: withAdminFee - originalPrice,
    appName: app.name,
    description: paywallInfo.description || `${app.name} premium feature`,
    canProceed: true,
  };
}

async function payPaywall(appId, paywallInfo) {
  const pricing = await handlePaywall(appId, paywallInfo);
  return processAppPayment(appId, pricing.solacePrice, `Paywall: ${pricing.description}`);
}

// ── APP DISCOVERY / CATALOG ──

const APP_CATALOG = [
  { name: 'Spotify', url: 'https://open.spotify.com', category: 'music', icon: '🎵', description: 'Music streaming', monthlyPrice: 1099, paymentType: 'subscription' },
  { name: 'Netflix', url: 'https://netflix.com', category: 'entertainment', icon: '🎬', description: 'Movie & TV streaming', monthlyPrice: 1549, paymentType: 'subscription' },
  { name: 'Canva', url: 'https://canva.com', category: 'design', icon: '🎨', description: 'Graphic design tools', monthlyPrice: 1299, paymentType: 'subscription' },
  { name: 'ChatGPT Plus', url: 'https://chat.openai.com', category: 'ai', icon: '🤖', description: 'Advanced AI chat', monthlyPrice: 2000, paymentType: 'subscription' },
  { name: 'Notion', url: 'https://notion.so', category: 'productivity', icon: '📝', description: 'Notes & project management', monthlyPrice: 800, paymentType: 'subscription' },
  { name: 'Figma', url: 'https://figma.com', category: 'design', icon: '✏️', description: 'UI/UX design tool', monthlyPrice: 1200, paymentType: 'subscription' },
  { name: 'Midjourney', url: 'https://midjourney.com', category: 'ai', icon: '🖼️', description: 'AI image generation', monthlyPrice: 1000, paymentType: 'subscription' },
  { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', category: 'dev', icon: '💻', description: 'AI code assistant', monthlyPrice: 1000, paymentType: 'subscription' },
  { name: 'Grammarly', url: 'https://grammarly.com', category: 'writing', icon: '📖', description: 'AI writing assistant', monthlyPrice: 1200, paymentType: 'subscription' },
  { name: 'Adobe Creative Cloud', url: 'https://adobe.com', category: 'design', icon: '🎯', description: 'Professional creative suite', monthlyPrice: 5499, paymentType: 'subscription' },
  { name: 'Uber', url: 'https://uber.com', category: 'transport', icon: '🚗', description: 'Ride sharing', monthlyPrice: 0, paymentType: 'usage' },
  { name: 'DoorDash', url: 'https://doordash.com', category: 'food', icon: '🍕', description: 'Food delivery', monthlyPrice: 0, paymentType: 'usage' },
  { name: 'Amazon', url: 'https://amazon.com', category: 'shopping', icon: '📦', description: 'Online shopping', monthlyPrice: 0, paymentType: 'usage' },
  { name: 'Duolingo Plus', url: 'https://duolingo.com', category: 'education', icon: '🦉', description: 'Language learning', monthlyPrice: 699, paymentType: 'subscription' },
  { name: 'Calm', url: 'https://calm.com', category: 'wellness', icon: '🧘', description: 'Meditation & sleep', monthlyPrice: 1499, paymentType: 'subscription' },
  { name: 'Peloton', url: 'https://onepeloton.com', category: 'fitness', icon: '🚴', description: 'Fitness classes', monthlyPrice: 1299, paymentType: 'subscription' },
  { name: 'LinkedIn Premium', url: 'https://linkedin.com/premium', category: 'professional', icon: '💼', description: 'Professional networking', monthlyPrice: 2999, paymentType: 'subscription' },
  { name: 'Dropbox Plus', url: 'https://dropbox.com', category: 'storage', icon: '☁️', description: 'Cloud storage', monthlyPrice: 1199, paymentType: 'subscription' },
  { name: 'Custom App', url: '', category: 'custom', icon: '🔧', description: 'Connect any web app or API', monthlyPrice: 0, paymentType: 'free' },
];

const APP_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌐' },
  { id: 'ai', label: 'AI Tools', emoji: '🤖' },
  { id: 'design', label: 'Design', emoji: '🎨' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'productivity', label: 'Productivity', emoji: '📝' },
  { id: 'dev', label: 'Developer', emoji: '💻' },
  { id: 'writing', label: 'Writing', emoji: '📖' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'fitness', label: 'Fitness', emoji: '🚴' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'shopping', label: 'Shopping', emoji: '📦' },
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'storage', label: 'Storage', emoji: '☁️' },
  { id: 'custom', label: 'Custom', emoji: '🔧' },
];

function searchCatalog(query, category) {
  let results = [...APP_CATALOG];
  if (category && category !== 'all') {
    results = results.filter(a => a.category === category);
  }
  if (query) {
    const lower = query.toLowerCase();
    results = results.filter(a =>
      a.name.toLowerCase().includes(lower) ||
      a.description.toLowerCase().includes(lower) ||
      a.category.toLowerCase().includes(lower)
    );
  }
  return results;
}

// ── PRICE WITH ADMIN FEE ──
function getPriceWithFee(basePriceCents) {
  const fee = Math.ceil(basePriceCents * ADMIN_FEE_PERCENT / 100);
  return {
    base: basePriceCents,
    fee,
    total: basePriceCents + fee,
    feePercent: ADMIN_FEE_PERCENT,
  };
}

export {
  ADMIN_FEE_PERCENT,
  getConnectedApps, connectApp, disconnectApp, getActiveApps, getAppById, updateApp,
  getAppTransactions, getTransactionSummary, logAppTransaction,
  processAppPayment, handlePaywall, payPaywall,
  APP_CATALOG, APP_CATEGORIES, searchCatalog,
  getPriceWithFee,
};
