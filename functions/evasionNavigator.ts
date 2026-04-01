import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentLocation, destination } = await req.json();

    // Analyze local crime data and suggest safer route
    const safeRoute = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a safety navigator. Given current location ${currentLocation.latitude}, ${currentLocation.longitude} and destination ${destination}, analyze crime statistics and suggest the safest walking route avoiding high-risk areas. Consider time of day and lighting. Return a safe route with waypoints.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          safe_route: { type: "array", items: { type: "object" } },
          risk_level: { type: "string" },
          estimated_time: { type: "number" },
          warnings: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      route: safeRoute
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});