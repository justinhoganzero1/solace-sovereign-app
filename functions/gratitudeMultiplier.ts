import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, win_text } = await req.json();

    if (action === 'record_win') {
      // Record a win/gratitude moment
      await base44.entities.HappinessBoost.create({
        boost_type: 'gratitude_replay',
        trigger_reason: 'User mentioned a win',
        content: win_text,
        joy_increase: 3
      });

      return Response.json({
        success: true,
        message: "Win recorded! I'll replay this when you need it most.",
        stored_in_vault: true
      });
    } else if (action === 'replay_wins') {
      // Get user's lowest energy day this week
      const emotionLogs = await base44.entities.EmotionLog.filter({ 
        created_by: user.email 
      });

      const currentJoyScore = emotionLogs.length > 0 
        ? emotionLogs[emotionLogs.length - 1].joy_score 
        : 50;

      if (currentJoyScore > 60) {
        return Response.json({
          message: "You're doing great! I'll save these wins for when you really need them."
        });
      }

      // Get all recorded wins
      const wins = await base44.entities.HappinessBoost.filter({
        created_by: user.email,
        boost_type: 'gratitude_replay'
      });

      if (wins.length === 0) {
        return Response.json({
          message: "No wins recorded yet. Tell me about your victories!"
        });
      }

      // Replay wins
      const winsList = wins.slice(-5).map(w => w.content);

      return Response.json({
        success: true,
        your_wins: winsList,
        oracle_says: `${user.full_name}, remember these moments. You've overcome challenges before. You'll do it again.`,
        joy_boost: 10
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});