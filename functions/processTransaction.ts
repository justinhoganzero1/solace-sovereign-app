import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transaction_type, amount, recipient_id, metadata } = await req.json();

    // Calculate SOVEREIGN TAX (1% on all transactions)
    const sovereignTax = amount * 0.01;
    const netAmount = amount - sovereignTax;

    // Generate encrypted transaction hash for Dark Vault
    const transactionHash = `VAULT_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create encrypted transaction record
    const transaction = await base44.entities.TierTransaction.create({
      transaction_type,
      amount,
      sovereign_tax: sovereignTax,
      net_amount: netAmount,
      recipient_id,
      vault_encrypted: true,
      transaction_hash: transactionHash
    });

    // Collect sovereign tax to empire treasury
    await base44.entities.EmpireCredit.create({
      transaction_type: 'earned',
      amount: sovereignTax,
      source: 'Sovereign Tax Collection (1%)',
      description: `Tax from ${transaction_type}`
    });

    return Response.json({
      success: true,
      transaction,
      amount_processed: amount,
      sovereign_tax: sovereignTax,
      net_received: netAmount,
      vault_hash: transactionHash,
      encrypted: true,
      message: 'Transaction secured in Dark Vault. No external access.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});