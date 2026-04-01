import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topics = ['technology', 'science', 'world'] } = await req.json();

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide a brief daily news summary for these topics: ${topics.join(', ')}. 
        Format as 3-5 bullet points with the most important news items.
        Keep each point to 1-2 sentences.`,
      add_context_from_internet: true
    });

    return Response.json({
      success: true,
      news_summary: response,
      topics,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating news summary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});