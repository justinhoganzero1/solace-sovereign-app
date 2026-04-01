import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, taskName } = await req.json();

    if (action === 'start') {
      return Response.json({
        success: true,
        message: `Oracle is here with you while you ${taskName}. I'm on the line, just working quietly alongside you.`,
        sessionId: crypto.randomUUID(),
        checkIns: [
          "Still here with you...",
          "You're doing great, keep going",
          "I'm right here, stay focused",
          "Almost there, you've got this"
        ]
      });
    }

    if (action === 'checkin') {
      const encouragements = [
        "Still here! Keep up the good work.",
        "You're making progress. I'm proud of you.",
        "Doing awesome. I'm here if you need me.",
        "Great job staying focused!"
      ];
      
      return Response.json({
        success: true,
        message: encouragements[Math.floor(Math.random() * encouragements.length)]
      });
    }

    if (action === 'complete') {
      return Response.json({
        success: true,
        message: `Amazing work! You completed ${taskName}. I knew you could do it! 🎉`
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});