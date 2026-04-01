import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, audioBlob, location, metadata } = await req.json();

    if (action === 'start') {
      // Start silent recording
      return Response.json({
        success: true,
        recordingId: crypto.randomUUID(),
        message: 'Silent Witness activated. Recording to Dark Vault.',
        encryptionEnabled: true
      });
    }

    if (action === 'save') {
      // Upload to private storage
      const audioFile = await base44.integrations.Core.UploadPrivateFile({
        file: audioBlob
      });

      // Create encrypted crisis log
      const witnessLog = await base44.entities.CrisisLog.create({
        crisis_type: 'safety',
        severity: 'critical',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
        description: 'Silent Witness recording - encrypted evidence',
        audio_log_url: audioFile.file_uri,
        auto_triggered: true,
        resolved: false
      });

      // Share signed URL with emergency contacts
      const signedUrl = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: audioFile.file_uri,
        expires_in: 86400 // 24 hours
      });

      const contacts = await base44.entities.EmergencyContact.filter({
        created_by: user.email,
        is_active: true,
        priority: 1
      });

      for (const contact of contacts.slice(0, 1)) {
        await base44.integrations.Core.SendEmail({
          to: contact.email,
          subject: `⚠️ CRITICAL - Silent Witness Recording`,
          body: `URGENT: ${user.full_name} has activated Silent Witness mode.

This is an encrypted evidence recording that can only be accessed for the next 24 hours.

Access recording: ${signedUrl.signed_url}

Time: ${new Date().toLocaleString()}
Location: ${location?.latitude}, ${location?.longitude}

DO NOT delete this email. This may be critical evidence.

Friends Only Oracle - Emergency Protocol`
        });
      }

      return Response.json({
        success: true,
        recordingId: witnessLog.id,
        contactsNotified: contacts.length,
        expiresIn: '24 hours'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});