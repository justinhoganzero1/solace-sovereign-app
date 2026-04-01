import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, conversation_context } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text required' }, { status: 400 });
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the mood/emotion in this text. Return a JSON object with:
        - mood: (happy, sad, anxious, angry, neutral, excited, stressed, confused)
        - sentiment: (positive, negative, neutral)
        - intensity: (low, medium, high)
        - suggested_response_tone: (supportive, calming, energetic, informative)
        
        Text: "${text}"
        
        Context: ${conversation_context || 'No context'}`,
      response_json_schema: {
        type: 'object',
        properties: {
          mood: { type: 'string' },
          sentiment: { type: 'string' },
          intensity: { type: 'string' },
          suggested_response_tone: { type: 'string' }
        }
      }
    });

    return Response.json({
      success: true,
      mood_analysis: response
    });
  } catch (error) {
    console.error('Error detecting mood:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});