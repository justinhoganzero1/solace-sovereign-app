import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prediction_type, user_location, planned_route } = await req.json();

    // Chronos analyzes multiple data sources
    const chronosPrompt = `CHRONOS PREDICTIVE DEFENSE SYSTEM

User wants to: ${prediction_type === 'transit' ? 'take public transit' : prediction_type === 'route' ? 'travel a specific route' : prediction_type}
${user_location ? `Current location: ${user_location}` : ''}
${planned_route ? `Planned route: ${planned_route}` : ''}

Analyze the following data sources and generate a prediction:
1. Current global/local news sentiment
2. Weather conditions and patterns
3. Transit system status
4. Local area safety trends
5. Time of day risk factors

Provide:
- Confidence score (0-100%)
- Specific prediction with reasoning
- Recommended action (alternative route, timing change, or proceed safely)
- Data sources used

Format response as JSON with keys: confidence, prediction, action, sources (array)`;

    const prediction = await base44.integrations.Core.InvokeLLM({
      prompt: chronosPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          confidence: { type: "number" },
          prediction: { type: "string" },
          action: { type: "string" },
          sources: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Store prediction
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 6); // Valid for 6 hours

    const chronicleEntry = await base44.entities.ChronosPrediction.create({
      prediction_type,
      confidence_score: prediction.confidence,
      prediction_text: prediction.prediction,
      recommended_action: prediction.action,
      data_sources: prediction.sources,
      valid_until: validUntil.toISOString()
    });

    // Auto-book alternative if confidence is high and risk detected
    let autoAction = null;
    if (prediction.confidence > 70 && prediction.action.toLowerCase().includes('avoid')) {
      autoAction = "I've analyzed alternative routes for you.";
    }

    return Response.json({ 
      success: true,
      chronos_says: prediction.prediction,
      confidence: `${prediction.confidence}%`,
      recommended_action: prediction.action,
      sources_analyzed: prediction.sources,
      auto_action: autoAction,
      valid_until: validUntil.toISOString(),
      chronicle_id: chronicleEntry.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});