import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { suggestion_text, suggestion_type, voice_recording_url } = await req.json();

    // Generate Oracle response to suggestion with uniqueness guarantee
    const varietySeed = Date.now().toString().slice(-6);
    const oraclePrompt = `A user has submitted this suggestion for the Oracle AI app:

"${suggestion_text}"

Type: ${suggestion_type}

CRITICAL: Provide a completely unique response. Never repeat the same answer twice. Use fresh language, new metaphors, and creative perspectives each time.

As the Oracle, provide:
1. An acknowledgment that validates their idea
2. Whether this is technically feasible
3. A creative expansion of their idea (what else could we add?)
4. An inspiring closing message

Keep it encouraging and visionary. This is a sovereign empire they're building.

Variety seed: ${varietySeed}`;

    const oracleResponse = await base44.integrations.Core.InvokeLLM({
      prompt: oraclePrompt,
      add_context_from_internet: false
    });

    // Store suggestion
    const suggestion = await base44.entities.OracleSuggestion.create({
      suggestion_text,
      suggestion_type,
      voice_recording_url,
      oracle_response: oracleResponse,
      status: 'submitted'
    });

    // Reward user with Empire Credits for contributing
    await base44.entities.EmpireCredit.create({
      transaction_type: 'earned',
      amount: 10,
      source: 'Feature suggestion submitted'
    });

    return Response.json({ 
      success: true,
      suggestion,
      oracle_says: oracleResponse,
      credits_earned: 10,
      message: 'Your voice shapes the Empire. +10 Empire Credits awarded.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});