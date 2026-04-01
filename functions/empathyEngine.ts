import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_input, voice_pitch, breathing_rate, device_source } = await req.json();

    // 1. ANALYZE SENTIMENT with AI
    const sentimentPrompt = `Analyze the emotional state of this message:

"${user_input}"

Detect:
- Primary emotion (joy, sadness, anger, fear, anxiety, calm, gratitude, loneliness, pain, peace)
- Intensity (0-100)
- Pain indicators (trauma keywords, depression signals, panic patterns)
- Happiness indicators (excitement, gratitude, wins)

Return JSON with: emotion, intensity, is_pain, is_joy, trigger_words (array), recommended_response`;

    const sentiment = await base44.integrations.Core.InvokeLLM({
      prompt: sentimentPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          emotion: { type: "string" },
          intensity: { type: "number" },
          is_pain: { type: "boolean" },
          is_joy: { type: "boolean" },
          trigger_words: { type: "array", items: { type: "string" } },
          recommended_response: { type: "string" }
        }
      }
    });

    // 2. GET CURRENT JOY SCORE
    const emotionLogs = await base44.entities.EmotionLog.filter({ created_by: user.email });
    const currentJoyScore = emotionLogs.length > 0 
      ? emotionLogs[emotionLogs.length - 1].joy_score 
      : 50;

    let newJoyScore = currentJoyScore;
    let oracleResponse = sentiment.recommended_response;
    let supportModeTriggered = false;

    // 3. PAIN DETECTION & INTERVENTION
    if (sentiment.is_pain && sentiment.intensity > 60) {
      // Trigger support mode
      supportModeTriggered = true;
      newJoyScore = Math.max(0, currentJoyScore - 10);

      await base44.entities.PainMonitor.create({
        pain_type: sentiment.emotion === 'fear' ? 'panic' : sentiment.emotion,
        detection_method: 'keyword_analysis',
        severity: sentiment.intensity,
        intervention: 'Empathy mode activated',
        safe_memory_redirect: sentiment.trigger_words.some(w => w.includes('trauma'))
      });

      // Calm response
      oracleResponse = "I can hear that you're struggling. I'm here. The Mall is locked for 10 minutes. Let's just talk. What's on your mind?";
      
    } else if (sentiment.is_joy && sentiment.intensity > 70) {
      // 4. HAPPINESS BOOST
      newJoyScore = Math.min(100, currentJoyScore + 5);

      await base44.entities.HappinessBoost.create({
        boost_type: 'small_win',
        trigger_reason: `User expressed: ${sentiment.emotion}`,
        joy_increase: 5,
        content: user_input,
        delivered_to_device: device_source || 'phone'
      });

      oracleResponse = `I love that energy, ${user.full_name}. Keep going! 🌟`;
    }

    // 5. LOG EMOTION
    const emotionLog = await base44.entities.EmotionLog.create({
      emotion_type: sentiment.emotion,
      intensity: sentiment.intensity,
      joy_score: newJoyScore,
      trigger_text: user_input,
      sentiment_analysis: sentiment,
      oracle_response: oracleResponse,
      support_mode_triggered: supportModeTriggered,
      voice_pitch_hz: voice_pitch,
      breathing_pattern: breathing_rate,
      device_source: device_source || 'phone'
    });

    return Response.json({
      success: true,
      emotion: sentiment.emotion,
      intensity: sentiment.intensity,
      joy_score: newJoyScore,
      joy_change: newJoyScore - currentJoyScore,
      oracle_says: oracleResponse,
      support_mode: supportModeTriggered,
      visual_effect: sentiment.is_joy ? 'gold_stars' : supportModeTriggered ? 'calm_blue' : 'none'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});