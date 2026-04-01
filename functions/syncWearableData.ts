import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wearableData = await req.json();

    // Store wearable data
    const dataEntry = await base44.entities.WearableData.create({
      ...wearableData,
      last_sync: new Date().toISOString()
    });

    const triggers = [];

    // Auto-trigger wellness features based on health data
    if (wearableData.auto_trigger_enabled) {
      
      // High heart rate -> Anxiety De-escalator
      if (wearableData.heart_rate && wearableData.heart_rate > 100) {
        triggers.push({
          feature: 'anxiety_deescalator',
          reason: `Elevated heart rate detected (${wearableData.heart_rate} BPM)`,
          recommended_action: 'Start breathing exercise to lower heart rate'
        });
      }

      // High stress -> Breath Monitor
      if (wearableData.stress_level && wearableData.stress_level > 70) {
        triggers.push({
          feature: 'breath_monitor',
          reason: `High stress level detected (${wearableData.stress_level}/100)`,
          recommended_action: 'Guided breathing to reduce stress'
        });
      }

      // Poor sleep -> Sleep Soundscape
      if (wearableData.sleep_quality === 'poor' || (wearableData.sleep_hours && wearableData.sleep_hours < 6)) {
        triggers.push({
          feature: 'sleep_soundscape',
          reason: `Poor sleep detected (${wearableData.sleep_hours || 0} hours, ${wearableData.sleep_quality || 'unknown'} quality)`,
          recommended_action: 'Evening relaxation routine recommended'
        });
      }

      // Low activity -> Motivational support
      if (wearableData.steps && wearableData.steps < 3000) {
        triggers.push({
          feature: 'motivational_support',
          reason: `Low activity today (${wearableData.steps} steps)`,
          recommended_action: 'Gentle movement encouragement'
        });
      }
    }

    // Generate wellness insights
    const insightsPrompt = `Based on this health data, provide 3 personalized wellness insights:
    - Heart rate: ${wearableData.heart_rate || 'N/A'} BPM
    - Sleep: ${wearableData.sleep_hours || 'N/A'} hours (${wearableData.sleep_quality || 'N/A'})
    - Steps: ${wearableData.steps || 'N/A'}
    - Activity: ${wearableData.activity_minutes || 'N/A'} minutes
    - Stress: ${wearableData.stress_level || 'N/A'}/100

Keep insights positive, actionable, and encouraging.`;

    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: insightsPrompt,
      add_context_from_internet: false
    });

    return Response.json({ 
      success: true,
      data_entry: dataEntry,
      auto_triggers: triggers,
      wellness_insights: insights,
      triggered_count: triggers.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});