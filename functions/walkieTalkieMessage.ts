import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sender_name, recipient_name, message_type, audio_url, text_content, priority } = await req.json();

    // Create family message
    const message = await base44.entities.FamilyMessage.create({
      sender_name,
      recipient_name,
      message_type,
      audio_url,
      text_content,
      priority: priority || 'normal',
      is_read: false
    });

    return Response.json({ 
      success: true, 
      message,
      notification: `Message sent from ${sender_name} to ${recipient_name}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});