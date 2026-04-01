import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { image_url } = await req.json();
    const lumaApiKey = Deno.env.get('LUMA_API_KEY');

    const res = await fetch('https://api.lumalabs.ai/image/to-prompt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lumaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url })
    });

    const data = await res.json();
    return Response.json({ prompt: data.prompt || data.description });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});