import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `ElevenLabs API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    
    return Response.json({
      voices: data.voices || [],
      count: data.voices?.length || 0
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});