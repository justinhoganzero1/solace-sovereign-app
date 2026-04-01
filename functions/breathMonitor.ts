import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { breathingPattern, duration } = await req.json();

    // Analyze breathing pattern for apnea or panic attack
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze breathing pattern: Rate ${breathingPattern.rate} breaths/min, Depth ${breathingPattern.depth}, Irregularity ${breathingPattern.irregular}. Detect sleep apnea or panic attack signs.`,
      response_json_schema: {
        type: "object",
        properties: {
          condition_detected: { type: "string" },
          severity: { type: "string" },
          confidence: { type: "number" },
          recommendation: { type: "string" }
        }
      }
    });

    if (analysis.severity === "critical" || analysis.severity === "high") {
      await base44.entities.HealthMonitor.create({
        monitor_type: 'breath_monitor',
        severity: analysis.severity === "critical" ? "critical" : "warning",
        data: { breathingPattern, analysis },
        emergency_triggered: analysis.severity === "critical",
        notes: `${analysis.condition_detected}: ${analysis.recommendation}`
      });
    }

    return Response.json({
      success: true,
      analysis
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});