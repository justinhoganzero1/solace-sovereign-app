# SOLACE Security & Monetization System

## 🔒 Security Architecture

### Owner vs User Separation

**Owner Email**: `justinhoganzero1@gmail.com` (configured in `src/lib/authorizationSystem.js`)

#### Owner-Only Features (RESTRICTED)
- ✅ Build app makers
- ✅ Clone SOLACE app
- ✅ Access Owner Dashboard
- ✅ User management
- ✅ Revenue analytics
- ✅ System settings
- ✅ API key management
- ✅ Database access
- ✅ Security controls
- ✅ Unlimited usage (no limits tracked)

#### User Restrictions
- ❌ **CANNOT** build app makers
- ❌ **CANNOT** clone SOLACE
- ❌ **CANNOT** access Owner Dashboard
- ❌ **CANNOT** bypass paywalls
- ❌ **CANNOT** exceed tier limits
- ✅ Can use features within their subscription tier
- ✅ See paywalls and upgrade prompts

### Authorization System (`src/lib/authorizationSystem.js`)

```javascript
// Check if user can build app maker
authSystem.canBuildAppMaker() // Only returns true for owner

// Check if user can clone SOLACE
authSystem.canCloneSolace() // Only returns true for owner

// Check feature access
authSystem.canAccessFeature('feature_name')

// Check generation limits
await authSystem.canGenerateApp()
await authSystem.canGenerateMovie(durationSeconds)
```

## 💰 Monetization System

### Subscription Tiers

#### 1. **Top Tier** - $200/month
- Unlimited app generation
- All 200 multilingual voices
- Unlimited movie generation (up to 120min)
- All wearables integration
- Priority support
- Advanced analytics
- White-label options
- API access
- Custom branding
- No watermarks

**Limits:**
- Apps: Unlimited
- Movies: Unlimited
- Movie Duration: 120 minutes
- Voices: 200
- Storage: 1TB

#### 2. **Premium** - $50/month (RECOMMENDED)
- 50 apps per month
- 100 multilingual voices
- 20 movies per month (up to 60min)
- Standard wearables integration
- Email support
- Basic analytics

**Limits:**
- Apps: 50/month
- Movies: 20/month
- Movie Duration: 60 minutes
- Voices: 100
- Storage: 100GB

#### 3. **Basic** - $15/month
- 10 apps per month
- 20 multilingual voices
- 5 movies per month (up to 10min)
- Basic features only
- Community support

**Limits:**
- Apps: 10/month
- Movies: 5/month
- Movie Duration: 10 minutes
- Voices: 20
- Storage: 10GB

#### 4. **Trial** - FREE for 3 days
- 3 apps during trial
- 10 voices
- 2 movies (up to 5min)
- All features unlocked for 3 days
- **Frequent upgrade prompts**

**Limits:**
- Apps: 3 total
- Movies: 2 total
- Movie Duration: 5 minutes
- Voices: 10
- Storage: 1GB

#### 5. **Free** - Forever
- 1 app per month
- 5 voices
- **No movie generation**
- Basic features only
- **Watermarked outputs**

**Limits:**
- Apps: 1/month
- Movies: 0
- Voices: 5
- Storage: 500MB

### Paywall System (`src/components/Paywall.jsx`)

**Paywall Triggers:**
- Monthly limit reached
- Trial expired
- Feature locked (premium only)
- Random prompts for trial/free users

**Paywall Frequency:**
- Owner: Never
- Top Tier: Never
- Premium: Never
- Basic: Never
- Trial: 30% of interactions
- Free: 50% of interactions

### Stripe Integration (`src/lib/stripeIntegration.js`)

```javascript
// Create subscription
await stripeIntegration.createSubscription('PREMIUM', userEmail)

// One-time payment (e.g., movie generation)
await stripeIntegration.createOneTimePayment(amount, description, userEmail)

// Cancel subscription
await stripeIntegration.cancelSubscription(subscriptionId)

// Update payment method
await stripeIntegration.updatePaymentMethod(customerId)

// Access billing portal
const url = await stripeIntegration.getBillingPortalUrl(customerId)
```

**Required Environment Variables:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
```

**Backend Endpoints Needed:**
- `/api/stripe/create-subscription`
- `/api/stripe/create-payment`
- `/api/stripe/cancel-subscription`
- `/api/stripe/update-payment-method`
- `/api/stripe/billing-portal`

### Movie Pricing
- **FREE**: Up to 10 seconds
- **PAID**: $3 per minute after 10 seconds

Example: 90-second movie = $4 (80 seconds charged = 2 minutes × $3)

## 🌐 Offline Failsafe System (`src/lib/offlineFailsafe.js`)

### Features
- **Connection Monitoring**: Checks every 5 seconds
- **Alternative Connection Methods**:
  - WebRTC P2P
  - Bluetooth Tethering
  - USB Tethering
  - Fallback DNS
  - Proxy Servers
- **Offline Queue**: Saves operations when offline, syncs when online
- **Local Cache**: IndexedDB for offline data storage

### Offline Capabilities
- ✅ App generation (limited, queued for online processing)
- ✅ Voice generation (basic Web Speech API)
- ✅ File storage (IndexedDB)
- ✅ Location services (Browser Geolocation)
- ❌ Movie generation (requires online)
- ❌ Payment processing (requires online)
- ❌ Sharing (requires online)

### Usage
```javascript
// Initialize offline system
await offlineFailsafe.initialize()

// Check if feature available offline
offlineFailsafe.isFeatureAvailableOffline('appGeneration')

// Generate app offline (queued)
await offlineFailsafe.generateAppOffline(appData)

// Get offline voices
const voices = await offlineFailsafe.getOfflineVoices()
```

## 🔑 API Key Audit (`src/lib/apiKeyAudit.js`)

### Standalone Operation Score: **80%**

### Removed External APIs
- ✅ **Eleven Labs** → Replaced with built-in voice synthesis
- ✅ **Google Maps** → Replaced with Browser Geolocation API
- ✅ **AWS S3** → Replaced with IndexedDB + Base44 storage

### Required APIs (Only 2!)
- **Base44**: Core platform API (required)
- **Stripe**: Payment processing (required for monetization)

### Browser APIs Used (No External Dependency)
- Web Speech API
- IndexedDB
- Service Workers
- Geolocation API
- Web Audio API
- WebRTC
- Bluetooth API
- USB API
- Notifications API
- Clipboard API
- File System Access API

## 📊 Usage Tracking

### Tracked Metrics
- Apps generated per month
- Movies generated per month
- Storage used (GB)

### Enforcement
```javascript
// Check before generation
const canGenerate = await authSystem.canGenerateApp()
if (!canGenerate.allowed) {
  // Show paywall with reason
  setShowPaywall(true)
}

// Track after generation
await authSystem.trackUsage('app', 1)
```

## 🎯 Implementation Checklist

### Security
- ✅ Owner email configured
- ✅ Role-based access control
- ✅ Owner-only app maker building
- ✅ Owner-only SOLACE cloning
- ✅ Separate Owner Dashboard
- ✅ User authorization checks
- ✅ Feature restrictions by tier

### Monetization
- ✅ 5 subscription tiers defined
- ✅ Stripe integration ready
- ✅ Paywall component created
- ✅ Usage tracking system
- ✅ Limit enforcement
- ✅ Movie pricing ($3/min)
- ⚠️ Backend Stripe endpoints needed

### Offline
- ✅ Offline detection
- ✅ Alternative connections
- ✅ Local cache (IndexedDB)
- ✅ Offline queue
- ✅ Service worker ready
- ✅ Basic offline features

### Standalone
- ✅ API audit complete
- ✅ External APIs removed
- ✅ Browser APIs utilized
- ✅ 80% standalone score

## 🚀 Next Steps

1. **Deploy Backend Stripe Endpoints**
   - Create subscription endpoint
   - Create payment endpoint
   - Webhook handlers

2. **Configure Stripe**
   - Create products and prices
   - Set up webhook endpoints
   - Test payment flows

3. **Test Security**
   - Verify owner-only restrictions
   - Test user limits
   - Validate paywall triggers

4. **Test Offline**
   - Simulate network failures
   - Verify alternative connections
   - Test offline queue

5. **Monitor Usage**
   - Track conversions
   - Analyze paywall effectiveness
   - Optimize pricing

## 📝 Configuration

### Owner Email
Change in `src/lib/authorizationSystem.js`:
```javascript
export const OWNER_EMAIL = 'your-email@example.com';
```

### Stripe Keys
Add to `.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
```

### Subscription Prices
Update in `src/lib/stripeIntegration.js`:
```javascript
const priceIds = {
  TOP_TIER: 'price_YOUR_TOP_TIER_ID',
  PREMIUM: 'price_YOUR_PREMIUM_ID',
  BASIC: 'price_YOUR_BASIC_ID'
};
```

## 🔐 Security Best Practices

1. **Never expose owner email in client code** - Consider moving to backend
2. **Validate all permissions server-side** - Client checks are UI only
3. **Encrypt sensitive data** - Use HTTPS everywhere
4. **Rate limit API calls** - Prevent abuse
5. **Monitor for suspicious activity** - Log all owner actions
6. **Regular security audits** - Review access logs
7. **Keep dependencies updated** - Security patches

## 💡 Revenue Optimization

### Conversion Strategies
1. **Trial users**: Show upgrade prompts 30% of time
2. **Free users**: Show upgrade prompts 50% of time
3. **Feature locks**: Premium features clearly marked
4. **Usage limits**: Clear communication when approaching limits
5. **Value demonstration**: Show what they're missing

### Pricing Psychology
- Premium tier marked as "RECOMMENDED"
- Top tier for serious businesses
- Basic tier for hobbyists
- Free tier to attract users
- Trial to convert users

### Upsell Opportunities
- Movie generation over 10 seconds
- Additional storage
- Priority support
- White-label options
- API access
