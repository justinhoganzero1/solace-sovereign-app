import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, interest_rate, term_days, action, offer_id, borrower_email } = await req.json();

    // Check tier requirement (Tier 210+)
    const subscriptions = await base44.entities.Subscription.filter({ created_by: user.email });
    if (subscriptions.length === 0 || subscriptions[0].tier_level < 210) {
      return Response.json({ error: 'Inter-Titan Lending requires Tier 210+' }, { status: 403 });
    }

    if (action === 'create') {
      // Create lending offer
      const interbankFee = amount * 0.005; // 0.5% fee
      
      const offer = await base44.entities.LendingOffer.create({
        lender_email: user.email,
        lender_tier: subscriptions[0].tier_level,
        amount,
        interest_rate,
        term_days,
        interbank_fee: interbankFee,
        status: 'open'
      });

      return Response.json({
        success: true,
        offer,
        interbank_fee: interbankFee,
        message: 'Inter-Titan lending offer created'
      });
    } else if (action === 'accept') {
      // Accept existing offer
      const offer = await base44.entities.LendingOffer.get(offer_id);
      
      if (offer.status !== 'open') {
        return Response.json({ error: 'Offer no longer available' }, { status: 400 });
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + offer.term_days);
      
      const totalInterest = offer.amount * (offer.interest_rate / 100);
      const repaymentAmount = offer.amount + totalInterest;

      await base44.entities.LendingOffer.update(offer_id, {
        status: 'active',
        borrower_email: user.email,
        repayment_amount: repaymentAmount,
        due_date: dueDate.toISOString()
      });

      // Transfer funds (minus interbank fee)
      const interbankFee = offer.amount * 0.005;
      const borrowerReceives = offer.amount - interbankFee;

      await base44.entities.EmpireCredit.create({
        transaction_type: 'earned',
        amount: interbankFee,
        source: 'Inter-Titan Interbank Fee (0.5%)'
      });

      return Response.json({
        success: true,
        loan_amount: offer.amount,
        amount_received: borrowerReceives,
        repayment_amount: repaymentAmount,
        due_date: dueDate.toISOString(),
        interbank_fee: interbankFee
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});