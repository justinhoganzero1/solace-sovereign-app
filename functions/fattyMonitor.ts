import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audioData, barkPattern } = await req.json();

    // Analyze dog bark for distress
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this dog bark audio pattern: ${barkPattern}. Determine if the bark sounds distressed, high-pitched, or indicates danger (vs. normal excitement/play). Return confidence level.`,
      response_json_schema: {
        type: "object",
        properties: {
          distressed: { type: "boolean" },
          bark_type: { type: "string" },
          confidence: { type: "number" },
          recommendation: { type: "string" }
        }
      }
    });

    if (analysis.distressed && analysis.confidence > 0.7) {
      // Alert user
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: '🐶 Fatty Alert - Possible Distress',
        body: `Fatty's bark pattern suggests distress. Type: ${analysis.bark_type}. Please check on your pet immediately.`
      });

      return Response.json({
        success: true,
        alert: true,
        analysis
      });
    }

    return Response.json({
      success: true,
      alert: false,
      analysis
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});