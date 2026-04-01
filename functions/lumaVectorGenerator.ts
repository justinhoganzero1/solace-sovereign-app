import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { description, color_palette, complexity } = await req.json();
    const lumaApiKey = Deno.env.get('LUMA_API_KEY');

    const prompt = `Create a vector graphic: ${description} with ${color_palette} colors and ${complexity} complexity level`;
    const res = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lumaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: '1:1'
      })
    });

    const data = await res.json();
    if (!res.ok) return Response.json({ error: 'API error', details: data }, { status: res.status });
    
    const generationId = data.id;
    if (!generationId) return Response.json({ error: 'No generation ID' }, { status: 500 });
    
    let attempts = 0;
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusRes = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: { 'Authorization': `Bearer ${lumaApiKey}` }
      });
      const statusData = await statusRes.json();
      if (statusData.state === 'completed') {
        const imageUrl = statusData.assets?.video || statusData.assets?.image;
        return Response.json({ image_url: imageUrl });
      }
      if (statusData.state === 'failed') return Response.json({ error: 'Failed' }, { status: 500 });
      attempts++;
    }
    return Response.json({ error: 'Timeout' }, { status: 504 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});