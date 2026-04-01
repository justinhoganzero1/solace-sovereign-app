import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount_requested } = await req.json();

    // Get user's trust score
    let trustScores = await base44.entities.TrustScore.filter({ 
      created_by: user.email 
    });

    if (trustScores.length === 0) {
      // Create initial trust score
      const trustScore = await base44.entities.TrustScore.create({
        entity_identifier: user.email,
        score: 50,
        score_category: 'neutral',
        factors: ['new_user'],
        safety_streak_days: 0,
        lending_eligible: false,
        max_borrow_amount: 0
      });
      trustScores = [trustScore];
    }

    const trustScore = trustScores[0];

    // Calculate lending eligibility based on safety score
    const baseAmount = 100;
    const maxBorrow = baseAmount * (trustScore.score / 10) * (trustScore.safety_streak_days / 7);

    // Update eligibility
    const eligible = trustScore.score >= 60 && trustScore.safety_streak_days >= 14;
    
    await base44.entities.TrustScore.update(trustScore.id, {
      lending_eligible: eligible,
      max_borrow_amount: maxBorrow
    });

    if (!eligible) {
      return Response.json({
        success: false,
        error: 'Trust-based lending requires 60+ Trust Score and 14+ day safety streak',
        current_score: trustScore.score,
        safety_streak: trustScore.safety_streak_days,
        requirements: {
          min_score: 60,
          min_streak_days: 14
        }
      });
    }

    if (amount_requested > maxBorrow) {
      return Response.json({
        success: false,
        error: 'Requested amount exceeds trust-based limit',
        max_borrow_amount: maxBorrow,
        requested: amount_requested
      });
    }

    // Approve loan
    const interestRate = Math.max(2, 10 - (trustScore.score / 10)); // Lower rate for higher trust

    await base44.entities.EmpireCredit.create({
      transaction_type: 'earned',
      amount: amount_requested,
      source: 'Trust-Based Loan Approved',
      description: `${interestRate}% interest based on ${trustScore.score} Trust Score`
    });

    return Response.json({
      success: true,
      approved_amount: amount_requested,
      interest_rate: interestRate,
      trust_score: trustScore.score,
      repayment_required: amount_requested * (1 + interestRate/100),
      message: `Loan approved based on your ${trustScore.safety_streak_days}-day safety streak.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});