import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, stake_id, amount, period_days } = await req.json();

    if (action === 'create') {
      // Check user has funds
      const credits = await base44.entities.EmpireCredit.filter({ created_by: user.email });
      const balance = credits.reduce((sum, tx) => {
        return sum + (tx.transaction_type === 'earned' || tx.transaction_type === 'bonus' ? tx.amount : -tx.amount);
      }, 0);

      if (balance < amount) {
        return Response.json({ error: 'Insufficient funds to stake' }, { status: 400 });
      }

      // Create stake
      const stake = await base44.entities.VaultStaking.create({
        staked_amount: amount,
        stake_start_date: new Date().toISOString(),
        interest_rate: 5.0,
        stake_period_days: period_days || 90,
        funds_mall_startups: true,
        status: 'active'
      });

      // Deduct from balance
      await base44.entities.EmpireCredit.create({
        transaction_type: 'spent',
        amount: amount,
        source: 'Vault Staking - Funds Mall Startups'
      });

      return Response.json({
        success: true,
        stake,
        interest_rate: '5% annual',
        funds_purpose: 'Supporting Sovereign Mall entrepreneurs',
        maturity_date: new Date(Date.now() + period_days * 24 * 60 * 60 * 1000).toISOString()
      });
    } else if (action === 'withdraw') {
      const stake = await base44.entities.VaultStaking.get(stake_id);
      const stakeStart = new Date(stake.stake_start_date);
      const now = new Date();
      const daysStaked = (now - stakeStart) / (1000 * 60 * 60 * 24);

      let finalAmount = stake.staked_amount;
      let penalty = 0;

      if (daysStaked < stake.stake_period_days) {
        // Early withdrawal - 10% penalty
        penalty = stake.staked_amount * stake.early_withdrawal_penalty;
        finalAmount = stake.staked_amount - penalty;
      } else {
        // Matured - add interest
        const interest = (stake.staked_amount * stake.interest_rate / 100) * (daysStaked / 365);
        finalAmount = stake.staked_amount + interest;
      }

      await base44.entities.VaultStaking.update(stake_id, {
        status: 'withdrawn'
      });

      await base44.entities.EmpireCredit.create({
        transaction_type: 'earned',
        amount: finalAmount,
        source: 'Vault Stake Withdrawal'
      });

      if (penalty > 0) {
        await base44.entities.EmpireCredit.create({
          transaction_type: 'earned',
          amount: penalty,
          source: 'Early Withdrawal Penalty Collection'
        });
      }

      return Response.json({
        success: true,
        withdrawn_amount: finalAmount,
        penalty_applied: penalty,
        days_staked: Math.floor(daysStaked),
        message: penalty > 0 
          ? '10% early withdrawal penalty applied'
          : 'Stake matured successfully with interest'
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});