import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, cashout_type } = await req.json();

    // Check tier requirement (Tier 140+)
    const subscriptions = await base44.entities.Subscription.filter({ created_by: user.email });
    if (subscriptions.length === 0 || subscriptions[0].tier_level < 140) {
      return Response.json({ error: 'Velocity Exit requires Tier 140+' }, { status: 403 });
    }

    // Calculate tax based on cashout type
    const taxRate = cashout_type === 'instant' ? 0.20 : 0.05; // 20% instant, 5% standard
    const taxAmount = amount * taxRate;
    const netPayout = amount - taxAmount;

    // Processing time
    const processingDays = cashout_type === 'instant' ? 0 : 7; // Standard takes 7 days
    const completeDate = new Date();
    completeDate.setDate(completeDate.getDate() + processingDays);

    // Create cashout request
    const cashout = await base44.entities.CashOutRequest.create({
      user_tier: subscriptions[0].tier_level,
      amount,
      cashout_type,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      net_payout: netPayout,
      request_date: new Date().toISOString(),
      processing_complete_date: completeDate.toISOString(),
      status: cashout_type === 'instant' ? 'completed' : 'pending'
    });

    // Deduct from user balance
    await base44.entities.EmpireCredit.create({
      transaction_type: 'spent',
      amount: amount,
      source: `Cash Out (${cashout_type})`,
      description: `${taxRate * 100}% ${cashout_type === 'instant' ? 'Impatience Tax' : 'Standard Tax'}`
    });

    // Collect tax
    await base44.entities.EmpireCredit.create({
      transaction_type: 'earned',
      amount: taxAmount,
      source: cashout_type === 'instant' ? 'Impatience Tax Collection' : 'Standard Processing Fee'
    });

    return Response.json({
      success: true,
      cashout,
      message: cashout_type === 'instant' 
        ? `Instant cashout complete. 20% Impatience Tax applied.`
        : `Standard cashout initiated. 5% fee. Completes in 7 days.`,
      net_payout: netPayout,
      tax_applied: `${taxRate * 100}%`,
      processing_time: `${processingDays} days`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});