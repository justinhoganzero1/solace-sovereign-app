import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, conversationId, context } = await req.json();

    if (action === 'store') {
      // Store context in conversation
      const conversation = await base44.entities.Conversation.get(conversationId);
      const updatedContext = [...(conversation.context_memory || []), context];
      
      await base44.entities.Conversation.update(conversationId, {
        context_memory: updatedContext.slice(-50) // Keep last 50 context items
      });

      return Response.json({ success: true, stored: context });
    }

    if (action === 'retrieve') {
      const conversation = await base44.entities.Conversation.get(conversationId);
      return Response.json({ 
        context: conversation.context_memory || [],
        summary: conversation.summary || ''
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});