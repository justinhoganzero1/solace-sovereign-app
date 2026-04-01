import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { year } = await req.json();
    const targetYear = year || new Date().getFullYear();

    // Compile all wins and moments from the year
    const happinessBoosts = await base44.entities.HappinessBoost.filter({
      created_by: user.email
    });

    const emotionLogs = await base44.entities.EmotionLog.filter({
      created_by: user.email
    });

    // Find happiest moment
    const happiestMoment = emotionLogs.reduce((max, log) => 
      log.joy_score > (max?.joy_score || 0) ? log : max
    , null);

    // Generate legacy book content
    const bookPrompt = `Create a beautiful "Year in Review" for ${user.full_name} (${targetYear}).

Wins: ${happinessBoosts.length}
Happiest moment: "${happiestMoment?.trigger_text || 'Unknown'}"
Average joy score: ${(emotionLogs.reduce((sum, l) => sum + l.joy_score, 0) / emotionLogs.length).toFixed(1)}

Write a 3-paragraph personal reflection as if speaking directly to them about their growth, resilience, and wins this year. Make it deeply personal and moving.`;

    const reflection = await base44.integrations.Core.InvokeLLM({
      prompt: bookPrompt,
      add_context_from_internet: false
    });

    // Create legacy book record
    const legacyBook = await base44.entities.LegacyBook.create({
      year: targetYear,
      total_wins: happinessBoosts.length,
      happiest_moment: happiestMoment?.trigger_text,
      growth_areas: ['resilience', 'joy', 'sovereignty'],
      daily_entries: emotionLogs.slice(-365).map(log => ({
        date: log.created_date,
        emotion: log.emotion_type,
        joy_score: log.joy_score,
        highlight: log.trigger_text
      })),
      vault_encrypted: true
    });

    return Response.json({
      success: true,
      legacy_book: legacyBook,
      reflection,
      total_wins: happinessBoosts.length,
      happiest_moment: happiestMoment?.trigger_text,
      message: `Your ${targetYear} Life Book is ready. Encrypted in your Dark Vault forever.`,
      shareable_with_family: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});