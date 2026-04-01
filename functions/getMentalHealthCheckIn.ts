import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mood, stress_level, sleep_quality } = await req.json();

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide a compassionate mental health check-in response. The user reports:
        - Mood: ${mood || 'Not specified'}
        - Stress Level: ${stress_level || 'Not specified'}
        - Sleep Quality: ${sleep_quality || 'Not specified'}
        
        Provide:
        1. Acknowledgment of their feelings
        2. Gentle advice or encouragement
        3. A suggested self-care activity
        4. Crisis resources if needed
        
        Be warm, supportive, and non-judgmental.`,
      add_context_from_internet: false
    });

    return Response.json({
      success: true,
      check_in_response: response,
      recorded_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in mental health check-in:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});