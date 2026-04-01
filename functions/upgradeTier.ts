import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { new_tier, payment_method } = await req.json();

    // Get current subscription
    const subscriptions = await base44.entities.Subscription.filter({ created_by: user.email });
    let subscription = subscriptions[0];

    // Tier pricing structure
    const tierPricing = {
      1: 10, 10: 50, 20: 100, 30: 200, 40: 350, 50: 500,
      60: 750, 70: 1000, 80: 1500, 90: 2000, 100: 2500,
      120: 3500, 140: 5000, 160: 7500, 180: 10000, 200: 15000,
      210: 20000, 230: 30000, 250: 50000, 251: 100000
    };

    const cost = tierPricing[new_tier] || 0;

    // Unlock tier-specific benefits
    const benefits = [];
    if (new_tier >= 60) benefits.push('60_day_float_liquidity');
    if (new_tier >= 140) benefits.push('velocity_exit_cashout');
    if (new_tier >= 210) benefits.push('inter_titan_lending');
    if (new_tier >= 250) benefits.push('oracle_predictor_mode');

    // Update subscription
    await base44.entities.Subscription.update(subscription.id, {
      tier_level: new_tier,
      subscription_status: 'active',
      is_trial_active: false,
      tier_benefits_unlocked: benefits,
      subscription_start: new Date().toISOString()
    });

    // Process payment
    if (cost > 0) {
      await base44.entities.EmpireCredit.create({
        transaction_type: 'spent',
        amount: cost,
        source: `Tier ${new_tier} Upgrade`
      });
    }

    return Response.json({
      success: true,
      new_tier,
      benefits_unlocked: benefits,
      cost,
      message: `Welcome to Tier ${new_tier}. Sovereign powers activated.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});