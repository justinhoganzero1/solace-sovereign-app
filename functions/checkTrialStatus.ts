import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create subscription
    let subscriptions = await base44.entities.Subscription.filter({ created_by: user.email });
    let subscription;

    if (subscriptions.length === 0) {
      // Create new trial subscription (4 weeks = 28 days)
      const now = new Date();
      const trialEnd = new Date(now.getTime() + (28 * 24 * 60 * 60 * 1000));

      subscription = await base44.entities.Subscription.create({
        tier_level: 0,
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        is_trial_active: true,
        subscription_status: 'trial',
        tier_benefits_unlocked: ['full_access_trial']
      });
    } else {
      subscription = subscriptions[0];
    }

    // Check if trial has expired
    const now = new Date();
    const trialEnd = new Date(subscription.trial_end_date);
    const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

    if (subscription.is_trial_active && now > trialEnd) {
      // Trial expired - trigger tier selection
      await base44.entities.Subscription.update(subscription.id, {
        is_trial_active: false,
        subscription_status: 'expired'
      });

      return Response.json({
        trial_active: false,
        trial_expired: true,
        days_remaining: 0,
        message: 'Your 4-week trial has ended. Choose your Sovereign Tier to continue.',
        action_required: 'select_tier'
      });
    }

    return Response.json({
      trial_active: subscription.is_trial_active,
      trial_expired: false,
      days_remaining: daysRemaining > 0 ? daysRemaining : 0,
      tier_level: subscription.tier_level,
      subscription_status: subscription.subscription_status,
      benefits: subscription.tier_benefits_unlocked
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});