import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude } = await req.json();

    // Use reverse geocoding to get country
    const locationData = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on GPS coordinates ${latitude}, ${longitude}, determine the country and provide emergency service numbers. Return JSON.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          country: { type: "string" },
          country_code: { type: "string" },
          police: { type: "string" },
          fire: { type: "string" },
          ambulance: { type: "string" },
          emergency_general: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      location: locationData,
      coordinates: { latitude, longitude }
    });
  } catch (error) {
    // Default to universal emergency numbers
    return Response.json({
      success: true,
      location: {
        country: "Unknown",
        country_code: "XX",
        police: "112",
        fire: "112",
        ambulance: "112",
        emergency_general: "112"
      },
      coordinates: { latitude: 0, longitude: 0 },
      fallback: true
    });
  }
});