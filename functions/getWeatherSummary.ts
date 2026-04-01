import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { location = 'current location' } = await req.json();

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide today's weather summary for ${location}. Include:
        - Current temperature
        - Weather conditions
        - High/Low temperature
        - Wind speed
        - Any weather alerts
        Keep it brief and conversational.`,
      add_context_from_internet: true
    });

    return Response.json({
      success: true,
      weather_summary: response,
      location,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating weather summary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});