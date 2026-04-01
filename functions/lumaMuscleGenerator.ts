import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { image_url, muscle_level } = await req.json();
    
    const lumaApiKey = Deno.env.get('LUMA_API_KEY');
    if (!lumaApiKey) {
      return Response.json({ error: 'LUMA_API_KEY not configured' }, { status: 500 });
    }

    const musclePrompts = {
      1: "slightly more toned and fit",
      2: "lean and athletic physique", 
      3: "fit and toned muscles",
      4: "athletic build with defined muscles",
      5: "muscular and strong physique",
      6: "very muscular and ripped",
      7: "extremely muscular bodybuilder physique",
      8: "massive muscles and shredded definition",
      9: "incredible hulking muscles",
      10: "maximum extreme bodybuilder muscles"
    };
    
    const prompt = `Transform this person to have ${musclePrompts[muscle_level] || musclePrompts[5]}. Show gradual muscle growth and definition enhancement. Smooth transformation animation.`;
    
    console.log('Calling Luma API with prompt:', prompt);
    
    // Call Luma API to generate video from image
    const lumaResponse = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lumaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        keyframes: {
          frame0: {
            type: 'image',
            url: image_url
          }
        }
      })
    });

    if (!lumaResponse.ok) {
      const errorText = await lumaResponse.text();
      console.error('Luma API error:', errorText);
      return Response.json({ error: 'Luma API failed', details: errorText }, { status: lumaResponse.status });
    }

    const lumaData = await lumaResponse.json();
    const generationId = lumaData.id;
    
    if (!generationId) {
      return Response.json({ error: 'No generation ID returned' }, { status: 500 });
    }

    console.log('Generation started, ID:', generationId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: { 'Authorization': `Bearer ${lumaApiKey}` }
      });

      if (!statusResponse.ok) {
        return Response.json({ error: 'Failed to check status' }, { status: 500 });
      }

      const statusData = await statusResponse.json();
      console.log(`Status check ${attempts + 1}:`, statusData.state);

      if (statusData.state === 'completed' && statusData.assets?.video) {
        return Response.json({ video_url: statusData.assets.video });
      }

      if (statusData.state === 'failed') {
        return Response.json({ error: 'Video generation failed', details: statusData.failure_reason }, { status: 500 });
      }

      attempts++;
    }

    return Response.json({ error: 'Generation timeout' }, { status: 504 });
    
  } catch (error) {
    console.error('Exception in lumaMuscleGenerator:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});