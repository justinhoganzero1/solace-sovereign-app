import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mood, duration } = await req.json();

    // Predefined music library URLs (can be replaced with actual hosted files)
    const musicLibrary = {
      "upbeat": "https://example.com/music/upbeat.mp3",
      "calm": "https://example.com/music/calm.mp3",
      "dramatic": "https://example.com/music/dramatic.mp3",
      "energetic": "https://example.com/music/energetic.mp3",
      "ambient": "https://example.com/music/ambient.mp3"
    };

    const music_url = musicLibrary[mood] || musicLibrary["calm"];

    return Response.json({ 
      music_url,
      mood,
      duration 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});