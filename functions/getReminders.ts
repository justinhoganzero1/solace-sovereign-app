import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminders = await base44.entities.Reminder.filter({
      created_by: user.email,
      is_active: true,
      is_completed: false
    });

    const upcoming = reminders.filter(r => new Date(r.scheduled_time) > new Date());
    const overdue = reminders.filter(r => new Date(r.scheduled_time) <= new Date());

    return Response.json({
      success: true,
      upcoming: upcoming.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time)),
      overdue: overdue.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time)),
      total: reminders.length
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});