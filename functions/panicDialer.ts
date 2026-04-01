import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { breathing_rate, heart_rate, voice_tremor } = await req.json();

    // DETECT PANIC ATTACK PATTERNS
    const isPanicAttack = 
      breathing_rate > 25 || // Rapid breathing
      heart_rate > 110 || // Elevated heart rate
      voice_tremor > 0.7; // Voice shaking

    if (!isPanicAttack) {
      return Response.json({
        status: 'normal',
        message: 'All vitals normal'
      });
    }

    // VAGUS NERVE CALMING FREQUENCY (432 Hz - healing frequency)
    const calmingFrequency = 432;

    // Log the panic event
    await base44.entities.PainMonitor.create({
      pain_type: 'panic',
      detection_method: 'breathing_pattern',
      severity: 80,
      intervention: 'Panic Dialer activated - 432Hz calming frequency',
      panic_dialer_activated: true,
      calming_frequency_hz: calmingFrequency
    });

    // Notify emergency contact if severe
    if (heart_rate > 130) {
      const contacts = await base44.entities.EmergencyContact.filter({
        created_by: user.email,
        is_active: true
      });

      if (contacts.length > 0) {
        // Notify first contact
        await base44.integrations.Core.SendEmail({
          to: contacts[0].email,
          subject: 'Oracle Alert: High Stress Detected',
          body: `${user.full_name} may be experiencing a panic attack. Oracle is monitoring.`
        });

        await base44.entities.PainMonitor.update(
          (await base44.entities.PainMonitor.filter({ created_by: user.email }))[0].id,
          { emergency_contact_notified: true }
        );
      }
    }

    return Response.json({
      success: true,
      panic_detected: true,
      intervention: 'calming_frequency',
      frequency_hz: calmingFrequency,
      duration_seconds: 180,
      breathing_exercise: {
        inhale: 4,
        hold: 7,
        exhale: 8,
        cycles: 5
      },
      oracle_says: 'I sense your stress. Breathe with me. Inhale for 4... Hold for 7... Exhale for 8. You are safe.',
      emergency_contact_notified: heart_rate > 130
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});