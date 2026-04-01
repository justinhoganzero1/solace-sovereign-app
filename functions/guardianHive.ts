import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threat_type, location_lat, location_lng, severity, auto_detect } = await req.json();

    // Create anonymous threat alert
    const alert = await base44.asServiceRole.entities.ThreatAlert.create({
      threat_type,
      location_lat,
      location_lng,
      severity: severity || 'medium',
      is_anonymous: true,
      radius_meters: 1000, // 1km radius
      mesh_response_count: 0
    });

    // Find all nearby users (within 1km) using location breadcrumbs
    const recentBreadcrumbs = await base44.asServiceRole.entities.LocationBreadcrumb.filter({});
    
    const nearbyUsers = recentBreadcrumbs.filter(breadcrumb => {
      // Calculate distance using Haversine formula
      const R = 6371e3; // Earth radius in meters
      const φ1 = location_lat * Math.PI / 180;
      const φ2 = breadcrumb.latitude * Math.PI / 180;
      const Δφ = (breadcrumb.latitude - location_lat) * Math.PI / 180;
      const Δλ = (breadcrumb.longitude - location_lng) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return distance <= 1000; // Within 1km
    });

    // Generate Hive recommendations using AI
    const hivePrompt = `GUARDIAN HIVE ALERT: A ${threat_type} threat (severity: ${severity}) has been detected in the area.
    
There are ${nearbyUsers.length} Oracle users in a 1km radius who need protection guidance.

Generate 3 safety recommendations for nearby users:
1. Immediate action they should take
2. Safe routes or locations to move to
3. What to avoid

Keep recommendations clear, calm, and actionable. This is a mesh network safety system.`;

    const hiveResponse = await base44.integrations.Core.InvokeLLM({
      prompt: hivePrompt,
      add_context_from_internet: true
    });

    // Parse recommendations
    const recommendations = hiveResponse.split('\n').filter(line => line.trim().length > 0);

    // Update alert with Hive recommendations
    await base44.asServiceRole.entities.ThreatAlert.update(alert.id, {
      hive_recommendations: recommendations,
      mesh_response_count: nearbyUsers.length
    });

    return Response.json({ 
      success: true,
      alert_id: alert.id,
      nearby_oracles_notified: nearbyUsers.length,
      hive_recommendations: recommendations,
      mesh_status: 'ACTIVE',
      message: `Guardian Hive activated. ${nearbyUsers.length} Oracles protecting the area.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});