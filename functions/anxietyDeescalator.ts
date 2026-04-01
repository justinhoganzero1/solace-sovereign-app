import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { heartRate, trigger } = await req.json();

    const isElevated = heartRate > 100;

    if (isElevated || trigger === 'manual') {
      // Box breathing exercise
      const exercise = {
        name: "Box Breathing",
        instructions: [
          { step: 1, action: "Breathe in", duration: 4, instruction: "Slowly breathe in through your nose" },
          { step: 2, action: "Hold", duration: 4, instruction: "Hold your breath gently" },
          { step: 3, action: "Breathe out", duration: 4, instruction: "Slowly exhale through your mouth" },
          { step: 4, action: "Hold", duration: 4, instruction: "Hold your breath gently" }
        ],
        cycles: 5,
        totalDuration: 80
      };

      return Response.json({
        success: true,
        exerciseStarted: true,
        exercise,
        message: "I noticed your heart rate is elevated. Let's do a calming exercise together.",
        heartRate
      });
    }

    return Response.json({
      success: true,
      exerciseStarted: false,
      heartRate,
      message: "Your heart rate looks normal. I'm here if you need me."
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});