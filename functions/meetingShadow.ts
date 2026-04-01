import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meetingTranscript, industry } = await req.json();

    // Translate jargon into basic explanations
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Meeting Shadow. Analyze this ${industry} meeting transcript and translate all jargon into simple explanations. Transcript: "${meetingTranscript}". Provide key takeaways, action items, and a jargon dictionary.`,
      response_json_schema: {
        type: "object",
        properties: {
          key_takeaways: { type: "array", items: { type: "string" } },
          action_items: { type: "array", items: { type: "string" } },
          jargon_dictionary: { type: "object" },
          meeting_summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      summary
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});