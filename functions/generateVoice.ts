import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice_id, model_id = "eleven_multilingual_v2", stability = 0.5, similarity_boost = 0.75 } = await req.json();
    
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 500 });
    }

    if (!text || !voice_id) {
      return Response.json({ error: 'Missing required parameters: text and voice_id' }, { status: 400 });
    }

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: model_id,
        voice_settings: {
          stability: stability,
          similarity_boost: similarity_boost
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `ElevenLabs API error: ${error}` }, { status: 500 });
    }

    // Get audio as base64 data URL for direct playback
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return Response.json({
      audio_url: audioUrl,
      voice_id: voice_id,
      text_length: text.length
    });
  } catch (error) {
    console.error('Voice generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});