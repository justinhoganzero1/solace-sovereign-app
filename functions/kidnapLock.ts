import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { speed, location, safeTravelActive = false } = await req.json();

    const SPEED_THRESHOLD = 80; // km/h

    if (speed > SPEED_THRESHOLD && !safeTravelActive) {
      // Potential kidnap situation detected
      
      // Log the event
      const crisisLog = await base44.entities.CrisisLog.create({
        crisis_type: 'safety',
        severity: 'critical',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
        description: `Kidnap Lock triggered: High-speed movement (${speed} km/h) detected without Safe Travel mode`,
        auto_triggered: true,
        resolved: false
      });

      // Notify emergency contacts
      const contacts = await base44.entities.EmergencyContact.filter({
        created_by: user.email,
        is_active: true
      });

      for (const contact of contacts.slice(0, 2)) {
        await base44.integrations.Core.SendEmail({
          to: contact.email,
          subject: `🚨 KIDNAP ALERT - ${user.full_name}`,
          body: `CRITICAL ALERT

${user.full_name}'s device has detected high-speed movement (${speed} km/h) without Safe Travel mode enabled.

This may indicate a kidnapping or forced movement.

Last known location: ${location?.latitude}, ${location?.longitude}
Time: ${new Date().toLocaleString()}

The device has been locked to protect personal data.

Contact emergency services immediately.

Friends Only Oracle - Kidnap Protocol`
        });
      }

      return Response.json({
        success: true,
        lockTriggered: true,
        crisisId: crisisLog.id,
        message: 'Kidnap Lock activated. Device secured. Emergency contacts notified.',
        requiresAuth: true
      });
    }

    return Response.json({
      success: true,
      lockTriggered: false,
      currentSpeed: speed,
      safeTravelActive
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});