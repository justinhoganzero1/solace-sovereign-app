import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, specialist = 'chat', language = 'en' } = await req.json();

    if (!title) {
      return Response.json({ error: 'Title required' }, { status: 400 });
    }

    const conversation = await base44.entities.Conversation.create({
      title,
      specialist,
      mode: specialist,
      language,
      messages: [],
      message_count: 0,
      is_archived: false
    });

    return Response.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});