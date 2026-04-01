import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceType, latitude, longitude, emergencyNumber } = await req.json();

    // Get emergency numbers for location
    const numbersRes = await base44.functions.invoke('getEmergencyNumbers', {
      latitude,
      longitude
    });

    const numbers = numbersRes.data.location;

    // Create crisis log
    const crisisLog = await base44.entities.CrisisLog.create({
      crisis_type: 'emergency',
      severity: 'critical',
      location_lat: latitude,
      location_lng: longitude,
      description: `${serviceType} emergency called from app`,
      auto_triggered: false,
      resolved: false
    });

    // Notify emergency contacts
    const contacts = await base44.entities.EmergencyContact.filter({
      created_by: user.email,
      is_active: true,
      notify_on_crisis: true
    });

    for (const contact of contacts.slice(0, 2)) {
      await base44.integrations.Core.SendEmail({
        to: contact.email,
        subject: `🚨 ${serviceType.toUpperCase()} EMERGENCY - ${user.full_name}`,
        body: `EMERGENCY ALERT

${user.full_name} has called ${serviceType} services.

Service: ${serviceType}
Emergency Number: ${emergencyNumber}
Time: ${new Date().toLocaleString()}
Location: ${latitude}, ${longitude}
Country: ${numbers.country}

This is an automated emergency notification from Friends Only Oracle.

Friends Only Oracle - Emergency Protocol`
      });
    }

    return Response.json({
      success: true,
      serviceType,
      emergencyNumber,
      crisisId: crisisLog.id,
      contactsNotified: contacts.length,
      instructions: `Calling ${serviceType} at ${emergencyNumber}. Your location has been shared with emergency contacts.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});