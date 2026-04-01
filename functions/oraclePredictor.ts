import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prediction_query, market_type } = await req.json();

    // Check tier requirement (Tier 250 - Oracle Predictor)
    const subscriptions = await base44.entities.Subscription.filter({ created_by: user.email });
    if (subscriptions.length === 0 || subscriptions[0].tier_level < 250) {
      return Response.json({ error: 'Oracle Predictor requires Tier 250' }, { status: 403 });
    }

    // Advanced AI prediction mode
    const predictionPrompt = `ORACLE PREDICTOR MODE - TIER 250 EXCLUSIVE

Market Analysis Query: "${prediction_query}"
Market Type: ${market_type || 'general'}

Analyze using:
1. Real-time market trends and sentiment
2. Historical pattern recognition
3. Global economic indicators
4. Social sentiment analysis
5. Emerging signals

Provide:
- Prediction confidence (0-100%)
- Timeframe
- Key factors driving prediction
- Risk assessment
- Actionable recommendation

Format as JSON with keys: confidence, timeframe, prediction, factors (array), risk_level, recommendation`;

    const prediction = await base44.integrations.Core.InvokeLLM({
      prompt: predictionPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          confidence: { type: "number" },
          timeframe: { type: "string" },
          prediction: { type: "string" },
          factors: { type: "array", items: { type: "string" } },
          risk_level: { type: "string" },
          recommendation: { type: "string" }
        }
      }
    });

    // Store prediction
    await base44.entities.ChronosPrediction.create({
      prediction_type: market_type || 'market',
      confidence_score: prediction.confidence,
      prediction_text: prediction.prediction,
      recommended_action: prediction.recommendation,
      data_sources: ['real_time_markets', 'sentiment_analysis', 'historical_patterns']
    });

    return Response.json({
      success: true,
      oracle_tier: 'PREDICTOR (250)',
      prediction,
      message: 'Oracle Predictor Mode active. Sovereign-level insights unlocked.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});