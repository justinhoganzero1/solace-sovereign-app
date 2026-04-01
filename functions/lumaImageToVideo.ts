import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { image_url, prompt, duration } = await req.json();
    const lumaApiKey = Deno.env.get('LUMA_API_KEY');

    const res = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lumaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        keyframes: {
          frame0: {
            type: 'image',
            url: image_url
          }
        },
        aspect_ratio: '16:9'
      })
    });

    const data = await res.json();
    console.log('Luma API response:', data);
    
    if (!res.ok) {
      return Response.json({ error: 'Luma API error', details: data }, { status: res.status });
    }
    
    const generationId = data.id;
    if (!generationId) {
      return Response.json({ error: 'No generation ID', details: data }, { status: 500 });
    }
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusRes = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: { 'Authorization': `Bearer ${lumaApiKey}` }
      });
      
      const statusData = await statusRes.json();
      console.log('Generation status:', statusData.state);
      
      if (statusData.state === 'completed') {
        const videoUrl = statusData.assets?.video;
        if (!videoUrl) {
          return Response.json({ error: 'No video URL in completed generation' }, { status: 500 });
        }
        return Response.json({ video_url: videoUrl });
      } else if (statusData.state === 'failed') {
        return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
      }
      
      attempts++;
    }
    
    return Response.json({ error: 'Video generation timed out' }, { status: 504 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});