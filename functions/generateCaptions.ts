import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { video_url } = await req.json();

    // Use AI to analyze video and generate captions
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this video and generate appropriate captions/subtitles. Create timestamps and text for key moments. Return as JSON array with format: [{"time": "00:00", "text": "Caption text"}]`,
      file_urls: [video_url],
      response_json_schema: {
        type: "object",
        properties: {
          captions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string" },
                text: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ captions: result.captions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});