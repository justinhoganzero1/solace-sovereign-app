import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_name, specialist, duration, message_count } = await req.json();

    // Use base44 analytics to track
    base44.analytics.track({
      eventName: event_name || 'conversation_completed',
      properties: {
        specialist: specialist || 'chat',
        duration_minutes: duration || 0,
        message_count: message_count || 0,
        user_email: user.email
      }
    });

    return Response.json({
      success: true,
      tracked: true
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});