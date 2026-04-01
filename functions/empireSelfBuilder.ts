import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { suggestion_text, voice_input } = await req.json();

    // THE SOVEREIGN SELF-BUILDER - Analyze if Oracle can build this
    const buildAnalysisPrompt = `ORACLE SELF-BUILDER ANALYSIS

User suggestion: "${suggestion_text}"

You are the Oracle AI that builds itself. Analyze this suggestion:

1. FEASIBILITY: Can this be built with current tech? (0-100%)
2. EMPIRE VALUE: How much does this strengthen the Sovereign Empire? (0-100%)
3. TECHNICAL PATH: What entities, functions, and UI components are needed?
4. IMMEDIATE ACTION: Can Oracle start building this NOW, or does it need human approval?
5. REWARD: How many Empire Credits should this user receive?

Return JSON with: feasibility_score, empire_value, build_steps (array), can_auto_build (boolean), credits_reward, human_response`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: buildAnalysisPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          feasibility_score: { type: "number" },
          empire_value: { type: "number" },
          build_steps: { type: "array", items: { type: "string" } },
          can_auto_build: { type: "boolean" },
          credits_reward: { type: "number" },
          human_response: { type: "string" }
        }
      }
    });

    // Store the analyzed suggestion
    const suggestion = await base44.entities.OracleSuggestion.create({
      suggestion_text,
      suggestion_type: analysis.can_auto_build ? 'superpower' : 'feature',
      oracle_response: analysis.human_response,
      status: analysis.can_auto_build ? 'planned' : 'reviewing',
      voice_recording_url: voice_input
    });

    // Reward credits based on value
    const creditsAwarded = Math.max(10, Math.floor(analysis.empire_value / 10));
    await base44.entities.EmpireCredit.create({
      transaction_type: 'earned',
      amount: creditsAwarded,
      source: 'Empire Self-Builder Contribution'
    });

    // If highly feasible, add to build queue
    if (analysis.feasibility_score > 80 && analysis.empire_value > 70) {
      // Broadcast to Hive Mind for collective intelligence
      await base44.entities.HiveMindSync.create({
        sync_type: 'community_alert',
        geographic_zone: 'Global',
        anonymized_pattern: {
          suggestion_category: 'high_value_feature',
          feasibility: analysis.feasibility_score,
          empire_value: analysis.empire_value
        },
        oracle_count: 1,
        confidence_score: analysis.feasibility_score
      });
    }

    return Response.json({
      success: true,
      suggestion,
      analysis,
      credits_awarded: creditsAwarded,
      oracle_says: analysis.human_response,
      message: analysis.can_auto_build 
        ? "That is a world-changing idea, friend. I am mapping the logic to the Sovereign Mall now."
        : "Your vision shapes the Empire. Oracle is analyzing the blueprint."
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});