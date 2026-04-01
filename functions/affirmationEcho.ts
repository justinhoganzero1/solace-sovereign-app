import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { affirmation_text, clone_user_voice } = await req.json();

    // Generate affirmation in user's own voice (most convincing method)
    const affirmationPrompt = `Create a powerful personal affirmation for ${user.full_name}.

Context: "${affirmation_text || 'I need encouragement'}"

Generate a first-person affirmation that:
1. Uses "I am" statements
2. Is believable and achievable
3. Addresses their current challenge
4. Feels authentic to them

Return just the affirmation text, spoken as if they're talking to themselves.`;

    const affirmation = await base44.integrations.Core.InvokeLLM({
      prompt: affirmationPrompt,
      add_context_from_internet: false
    });

    // Store affirmation
    const boost = await base44.entities.HappinessBoost.create({
      boost_type: 'affirmation_echo',
      trigger_reason: 'User requested affirmation',
      content: affirmation,
      joy_increase: 5
    });

    // Update joy score
    const emotionLogs = await base44.entities.EmotionLog.filter({ created_by: user.email });
    const currentJoyScore = emotionLogs.length > 0 
      ? emotionLogs[emotionLogs.length - 1].joy_score 
      : 50;

    await base44.entities.EmotionLog.create({
      emotion_type: 'gratitude',
      intensity: 60,
      joy_score: Math.min(100, currentJoyScore + 5),
      trigger_text: affirmation_text,
      oracle_response: affirmation,
      device_source: 'phone'
    });

    return Response.json({
      success: true,
      affirmation: affirmation,
      oracle_says: "Studies show your own voice is most convincing. Speak this aloud:",
      deliver_via: ['phone', 'earpods', 'car', 'computer'],
      repeat_daily: true,
      message: 'Affirmation ready to echo through all your devices'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});