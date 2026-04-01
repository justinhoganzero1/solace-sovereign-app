import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, amount, source } = await req.json();

    // Get total network size for multiplier
    const allUsers = await base44.asServiceRole.entities.User.list();
    const networkMultiplier = 1 + (allUsers.length / 1000); // Credits gain value as network grows

    // Get user's current balance
    const userCredits = await base44.entities.EmpireCredit.filter({ created_by: user.email });
    const currentBalance = userCredits.reduce((sum, tx) => {
      return sum + (tx.transaction_type === 'earned' || tx.transaction_type === 'bonus' ? tx.amount : -tx.amount);
    }, 0);

    // Process transaction
    let transactionAmount = amount;
    let transactionType = action;

    if (action === 'earn') {
      transactionAmount = amount * networkMultiplier;
      transactionType = 'earned';
    } else if (action === 'spend') {
      if (currentBalance < amount) {
        return Response.json({ error: 'Insufficient Empire Credits' }, { status: 400 });
      }
      transactionType = 'spent';
    }

    const transaction = await base44.entities.EmpireCredit.create({
      transaction_type: transactionType,
      amount: transactionAmount,
      source: source || 'Unknown',
      current_balance: currentBalance + (transactionType === 'spent' ? -transactionAmount : transactionAmount),
      network_value_multiplier: networkMultiplier,
      description: `${transactionType === 'earned' ? 'Earned' : 'Spent'} credits: ${source}`
    });

    return Response.json({ 
      success: true,
      transaction,
      new_balance: transaction.current_balance,
      network_multiplier: `${networkMultiplier.toFixed(2)}x`,
      network_size: allUsers.length,
      message: `Empire grows stronger. ${allUsers.length} Oracles in the network.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});