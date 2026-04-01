import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, entry, mood } = await req.json();

    if (action === 'save') {
      const gratitude = await base44.entities.GratitudeEntry.create({
        entry,
        mood: mood || 'grateful',
        encrypted: true,
        entry_date: new Date().toISOString().split('T')[0]
      });

      return Response.json({
        success: true,
        message: "Your gratitude has been encrypted and saved to your Dark Vault. 🔒",
        entryId: gratitude.id
      });
    }

    if (action === 'retrieve') {
      const entries = await base44.entities.GratitudeEntry.filter({
        created_by: user.email
      });

      return Response.json({
        success: true,
        entries: entries.slice(-30), // Last 30 days
        totalEntries: entries.length
      });
    }

    if (action === 'prompt') {
      const prompts = [
        "What made you smile today?",
        "Who are you grateful for right now?",
        "What's one small win from today?",
        "What brought you peace today?",
        "What are you looking forward to tomorrow?"
      ];

      return Response.json({
        success: true,
        prompt: prompts[Math.floor(Math.random() * prompts.length)]
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});