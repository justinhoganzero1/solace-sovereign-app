import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audioTranscript, location } = await req.json();

    // Analyze audio for domestic violence indicators
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this audio for signs of domestic violence: breaking glass, aggressive shouting, threatening language. Audio: "${audioTranscript}". Return JSON with threat assessment.`,
      response_json_schema: {
        type: "object",
        properties: {
          threat_detected: { type: "boolean" },
          threat_type: { type: "string" },
          confidence: { type: "number" },
          recommended_action: { type: "string" }
        }
      }
    });

    if (analysis.threat_detected && analysis.confidence > 0.6) {
      // Start Black Box recording
      const crisisLog = await base44.entities.CrisisLog.create({
        crisis_type: 'safety',
        severity: 'critical',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
        description: `Domestic Guardian: ${analysis.threat_type} detected`,
        auto_triggered: true,
        resolved: false
      });

      return Response.json({
        success: true,
        blackBoxActive: true,
        crisisId: crisisLog.id,
        analysis
      });
    }

    return Response.json({
      success: true,
      blackBoxActive: false,
      analysis
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});