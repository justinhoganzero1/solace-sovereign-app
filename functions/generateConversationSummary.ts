import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, conversationTitle } = await req.json();

    if (!messages || messages.length === 0) {
      return Response.json({ error: 'Messages required' }, { status: 400 });
    }

    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Oracle'}: ${msg.content}`)
      .join('\n\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a concise summary of this conversation about "${conversationTitle}":\n\n${conversationText}`,
      add_context_from_internet: false
    });

    return Response.json({ 
      summary: response,
      messageCount: messages.length
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});