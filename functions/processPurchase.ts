import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id, payment_method, use_oracle_agent } = await req.json();

    // Get product
    const product = await base44.entities.MallProduct.get(product_id);

    // Check if paying with Empire Credits
    if (payment_method === 'empire_credits') {
      const userCredits = await base44.entities.EmpireCredit.filter({ created_by: user.email });
      const balance = userCredits.reduce((sum, tx) => {
        return sum + (tx.transaction_type === 'earned' || tx.transaction_type === 'bonus' ? tx.amount : -tx.amount);
      }, 0);

      if (balance < product.price_credits) {
        return Response.json({ error: 'Insufficient Empire Credits' }, { status: 400 });
      }

      // Deduct credits
      await base44.entities.EmpireCredit.create({
        transaction_type: 'spent',
        amount: product.price_credits,
        source: `Purchase: ${product.product_name}`,
        current_balance: balance - product.price_credits
      });
    }

    // Create purchase record in Dark Vault (encrypted)
    const purchase = await base44.entities.Purchase.create({
      product_id,
      product_name: product.product_name,
      store_id: product.store_id,
      payment_method,
      amount_paid: payment_method === 'empire_credits' ? product.price_credits : product.price_usd,
      currency: payment_method === 'empire_credits' ? 'credits' : 'usd',
      vault_encrypted: true,
      purchase_status: 'completed'
    });

    // Update store sales
    const store = await base44.entities.MallStore.get(product.store_id);
    await base44.entities.MallStore.update(product.store_id, {
      total_sales: (store.total_sales || 0) + product.price_credits
    });

    return Response.json({ 
      success: true,
      purchase,
      message: 'Purchase completed and secured in Dark Vault',
      remaining_credits: payment_method === 'empire_credits' ? 
        (userCredits.reduce((sum, tx) => sum + tx.amount, 0) - product.price_credits) : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});