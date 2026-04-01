import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chore_id, child_message } = await req.json();

    // Get the chore
    const chore = await base44.entities.Chore.get(chore_id);

    // Generate AI negotiation response using child-safe mode
    const negotiationPrompt = `You are a friendly, patient family assistant helping negotiate chores with a child. 
    The chore is: "${chore.title}" - ${chore.description}
    The child says: "${child_message}"
    
    Respond in a warm, encouraging way that motivates the child while being fair. 
    Offer creative compromises, suggest making it fun, or explain why the chore is important.
    Keep language simple and child-friendly.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: negotiationPrompt,
      add_context_from_internet: false
    });

    // Update chore with negotiation history
    const updatedHistory = chore.negotiation_history || [];
    updatedHistory.push({
      timestamp: new Date().toISOString(),
      child_message,
      ai_response: aiResponse,
    });

    await base44.entities.Chore.update(chore_id, {
      negotiation_history: updatedHistory,
      status: 'negotiating'
    });

    return Response.json({ 
      success: true, 
      ai_response: aiResponse,
      encouragement: "Keep the conversation going! I'm here to help find a solution."
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});