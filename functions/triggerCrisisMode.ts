import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { crisisType, severity, location, description, autoTriggered = false } = await req.json();

    // Create crisis log
    const crisisLog = await base44.entities.CrisisLog.create({
      crisis_type: crisisType,
      severity: severity || 'critical',
      location_lat: location?.latitude,
      location_lng: location?.longitude,
      location_address: location?.address,
      description: description || 'Emergency triggered by user',
      auto_triggered: autoTriggered,
      contacts_notified: [],
      resolved: false
    });

    // Get emergency contacts
    const contacts = await base44.entities.EmergencyContact.filter({
      created_by: user.email,
      is_active: true,
      notify_on_crisis: true
    });

    // Sort by priority and notify
    const sortedContacts = contacts.sort((a, b) => a.priority - b.priority);
    const notifiedIds = [];

    for (const contact of sortedContacts.slice(0, 3)) {
      try {
        await base44.integrations.Core.SendEmail({
          to: contact.email,
          subject: `🚨 EMERGENCY ALERT - ${user.full_name}`,
          body: `
CRISIS ALERT

${user.full_name} has triggered an emergency alert.

Crisis Type: ${crisisType}
Severity: ${severity}
Time: ${new Date().toLocaleString()}
${location ? `Location: ${location.address || `${location.latitude}, ${location.longitude}`}` : 'Location: Unknown'}

Description: ${description || 'No details provided'}

This is an automated emergency notification from Friends Only Oracle AI.

Please check on ${user.full_name} immediately.
          `
        });
        notifiedIds.push(contact.id);
      } catch (error) {
        console.error(`Failed to notify ${contact.name}:`, error);
      }
    }

    // Update crisis log with notified contacts
    await base44.entities.CrisisLog.update(crisisLog.id, {
      contacts_notified: notifiedIds
    });

    return Response.json({
      success: true,
      crisisId: crisisLog.id,
      contactsNotified: notifiedIds.length,
      message: `Crisis mode activated. ${notifiedIds.length} contacts notified.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});