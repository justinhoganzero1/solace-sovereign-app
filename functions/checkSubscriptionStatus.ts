import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await base44.entities.Subscription.filter({ 
      created_by: user.email 
    });

    let subscription = null;
    if (subscriptions.length > 0) {
      subscription = subscriptions[0];
    }

    // Check trial status
    const isInTrial = subscription?.is_trial_active || false;
    const trialEndDate = subscription?.trial_end_date;
    const isTrialExpired = trialEndDate ? new Date(trialEndDate) < new Date() : true;

    // Check if user is a paying member
    const isActiveMember = subscription?.subscription_status === 'active' && !isInTrial;

    // Enhanced features available during trial or with active subscription
    const hasEnhancedFeatures = (isInTrial && !isTrialExpired) || isActiveMember;

    return Response.json({
      is_trial: isInTrial && !isTrialExpired,
      is_active_member: isActiveMember,
      has_enhanced_features: hasEnhancedFeatures,
      trial_end_date: trialEndDate,
      subscription_status: subscription?.subscription_status || 'none',
      tier_level: subscription?.tier_level || 0
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});