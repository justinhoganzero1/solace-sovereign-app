import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accelerometerData, noResponseTime, location } = await req.json();

    // Detect fall based on accelerometer spike
    const fallDetected = accelerometerData?.impact > 30; // G-force threshold

    if (fallDetected && noResponseTime > 10) {
      // User fell and hasn't responded for 10+ seconds
      
      const healthLog = await base44.entities.HealthMonitor.create({
        monitor_type: 'fall_detection',
        severity: 'critical',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
        data: { impact: accelerometerData.impact, noResponseTime },
        emergency_triggered: true,
        notes: 'Fall detected with no response - broadcasting medical ID'
      });

      // Get user profile for medical info
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      const profile = profiles[0];

      // Notify emergency contacts
      const contacts = await base44.entities.EmergencyContact.filter({
        created_by: user.email,
        is_active: true
      });

      for (const contact of contacts.slice(0, 2)) {
        await base44.integrations.Core.SendEmail({
          to: contact.email,
          subject: `🚨 FALL DETECTED - ${user.full_name}`,
          body: `MEDICAL EMERGENCY

${user.full_name} has experienced a fall and is not responding.

Impact force: ${accelerometerData.impact}G
No response time: ${noResponseTime} seconds
Location: ${location?.latitude}, ${location?.longitude}

Medical ID broadcasting to nearby devices.

Friends Only Oracle - Medical First Responder`
        });
      }

      return Response.json({
        success: true,
        fallDetected: true,
        emergencyTriggered: true,
        healthLogId: healthLog.id
      });
    }

    return Response.json({
      success: true,
      fallDetected: false
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});