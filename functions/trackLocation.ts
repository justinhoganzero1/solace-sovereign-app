import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude, accuracy, speed, heading, batteryLevel } = await req.json();

    // Get user profile to check if in danger zone mode
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const profile = profiles[0];

    const isDangerZone = profile?.safety_mode || false;

    // Create breadcrumb
    const breadcrumb = await base44.entities.LocationBreadcrumb.create({
      latitude,
      longitude,
      accuracy,
      speed: speed || 0,
      heading: heading || 0,
      battery_level: batteryLevel || 100,
      is_danger_zone: isDangerZone,
      shared_with_contacts: isDangerZone
    });

    // Check safe zones
    const safeZones = await base44.entities.SafeZone.filter({
      created_by: user.email,
      is_active: true
    });

    for (const zone of safeZones) {
      const distance = calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
      
      if (distance <= zone.radius_meters) {
        // Inside safe zone
        if (zone.notify_on_enter) {
          // Notify entry (could send email to contacts)
        }
      } else {
        // Outside safe zone
        if (zone.notify_on_exit) {
          // Notify exit
        }
      }
    }

    // If danger zone mode, share with emergency contacts every 10 minutes
    if (isDangerZone) {
      const recentBreadcrumbs = await base44.entities.LocationBreadcrumb.filter({
        created_by: user.email
      });
      
      if (recentBreadcrumbs.length % 10 === 0) {
        // Share location with emergency contacts
        const contacts = await base44.entities.EmergencyContact.filter({
          created_by: user.email,
          is_active: true
        });

        for (const contact of contacts.slice(0, 2)) {
          await base44.integrations.Core.SendEmail({
            to: contact.email,
            subject: `📍 Location Update - ${user.full_name}`,
            body: `${user.full_name} is in danger zone mode.\n\nCurrent location: ${latitude}, ${longitude}\nTime: ${new Date().toLocaleString()}\n\nThis is an automated check-in from Friends Only Oracle.`
          });
        }
      }
    }

    return Response.json({
      success: true,
      breadcrumbId: breadcrumb.id,
      inSafeZone: false,
      dangerZoneActive: isDangerZone
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}