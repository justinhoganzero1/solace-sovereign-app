import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { destination_lat, destination_lng, current_lat, current_lng } = await req.json();

    // Calculate direction
    const latDiff = destination_lat - current_lat;
    const lngDiff = destination_lng - current_lng;
    
    let direction;
    if (Math.abs(lngDiff) > Math.abs(latDiff)) {
      direction = lngDiff > 0 ? 'right' : 'left';
    } else {
      direction = latDiff > 0 ? 'forward' : 'back';
    }

    // Create haptic alert
    const alert = await base44.entities.PhygitalAlert.create({
      alert_type: 'haptic_guide',
      severity: 'info',
      location_lat: current_lat,
      location_lng: current_lng,
      haptic_direction: direction,
      auto_triggered: true
    });

    // Return vibration pattern
    const vibrationPattern = {
      left: [0, 100, 50, 100],
      right: [0, 50, 100, 50],
      forward: [0, 200],
      back: [0, 100, 100, 100]
    };

    return Response.json({
      success: true,
      direction,
      vibration_pattern: vibrationPattern[direction],
      distance_meters: Math.sqrt(latDiff**2 + lngDiff**2) * 111000, // Approximate
      message: `Oracle guides you: ${direction}. No screen needed.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});