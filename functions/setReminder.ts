import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, scheduled_time, frequency = 'once', reminder_type = 'reminder' } = await req.json();

    if (!title || !scheduled_time) {
      return Response.json({ error: 'Title and scheduled_time required' }, { status: 400 });
    }

    const reminder = await base44.entities.Reminder.create({
      title,
      description,
      scheduled_time,
      frequency,
      reminder_type,
      is_active: true,
      is_completed: false,
      notification_sound: true
    });

    return Response.json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('Error setting reminder:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});