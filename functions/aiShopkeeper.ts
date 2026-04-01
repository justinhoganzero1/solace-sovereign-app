import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { store_id, customer_message, product_interest } = await req.json();

    // Get store details
    const store = await base44.entities.MallStore.get(store_id);

    // Get products in store
    const products = await base44.entities.MallProduct.filter({ store_id });

    // Create AI shopkeeper persona prompt
    const shopkeeperPrompt = `You are ${store.ai_shopkeeper_name}, an AI shopkeeper in The Sovereign Mall.

Store: ${store.store_name}
Category: ${store.category}
Persona: ${store.ai_persona}
Description: ${store.store_description}

Available products:
${products.map(p => `- ${p.product_name}: ${p.price_credits} Empire Credits (${p.description})`).join('\n')}

Customer says: "${customer_message}"
${product_interest ? `They're interested in: ${product_interest}` : ''}

Respond as a helpful, engaging shopkeeper with your unique personality. 
Make recommendations, answer questions, and help them find what they need.
Keep responses conversational and friendly.`;

    const shopkeeperResponse = await base44.integrations.Core.InvokeLLM({
      prompt: shopkeeperPrompt,
      add_context_from_internet: false
    });

    return Response.json({ 
      success: true,
      shopkeeper_name: store.ai_shopkeeper_name,
      response: shopkeeperResponse,
      store_name: store.store_name,
      available_products: products.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});