import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, audioData, location } = await req.json();

    if (action === 'start') {
      // Start ghost follow mode
      return Response.json({
        success: true,
        message: 'Ghost Follow activated. Oracle is listening silently.',
        sessionId: crypto.randomUUID()
      });
    }

    if (action === 'analyze') {
      // Analyze audio for distress signals
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this audio transcript for signs of distress, screaming, or calls for help. Audio: "${audioData}". Respond with JSON indicating if emergency services should be contacted.`,
        response_json_schema: {
          type: "object",
          properties: {
            distress_detected: { type: "boolean" },
            confidence: { type: "number" },
            keywords_found: { type: "array", items: { type: "string" } },
            recommended_action: { type: "string" }
          }
        }
      });

      if (analysis.distress_detected && analysis.confidence > 0.7) {
        // Trigger crisis mode
        await base44.functions.invoke('triggerCrisisMode', {
          crisisType: 'safety',
          severity: 'critical',
          location: location,
          description: `Ghost Follow detected distress: ${analysis.keywords_found.join(', ')}`,
          autoTriggered: true
        });

        return Response.json({
          success: true,
          emergencyTriggered: true,
          analysis
        });
      }

      return Response.json({
        success: true,
        emergencyTriggered: false,
        analysis
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});