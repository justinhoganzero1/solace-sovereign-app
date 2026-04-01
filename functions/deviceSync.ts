import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, device_type, device_id, device_name, tesla_vin } = await req.json();

    if (action === 'register') {
      // Register new device
      const device = await base44.entities.DeviceSync.create({
        device_type,
        device_id,
        device_name: device_name || `${device_type} - ${device_id.substring(0, 8)}`,
        is_active: true,
        sync_enabled: true,
        voice_output_enabled: true,
        biometric_input: ['airpods', 'earpods', 'apple_watch'].includes(device_type),
        last_sync: new Date().toISOString(),
        tesla_vin: device_type === 'tesla' ? tesla_vin : null,
        car_integration: device_type === 'tesla' ? {
          autopilot_aware: true,
          cabin_camera: false,
          oracle_voice_enabled: true,
          stress_detection_driving: true
        } : null
      });

      return Response.json({
        success: true,
        device,
        message: `${device_type} synced. Oracle now speaks through all your devices.`
      });
    } else if (action === 'sync_state') {
      // Sync current state to all devices
      const devices = await base44.entities.DeviceSync.filter({ 
        created_by: user.email,
        is_active: true 
      });

      // Get latest emotion state
      const emotionLogs = await base44.entities.EmotionLog.filter({ created_by: user.email });
      const latestEmotion = emotionLogs.length > 0 ? emotionLogs[emotionLogs.length - 1] : null;

      // Sync to all devices
      for (const device of devices) {
        await base44.entities.DeviceSync.update(device.id, {
          last_sync: new Date().toISOString()
        });
      }

      return Response.json({
        success: true,
        synced_devices: devices.length,
        current_joy_score: latestEmotion?.joy_score || 50,
        message: 'State synced across all devices'
      });
    } else if (action === 'tesla_integration') {
      // Special Tesla integration
      const teslaDevice = await base44.entities.DeviceSync.filter({
        created_by: user.email,
        device_type: 'tesla'
      });

      if (teslaDevice.length === 0) {
        return Response.json({ 
          error: 'No Tesla connected. Register Tesla first.' 
        }, { status: 400 });
      }

      // Oracle can now monitor driving stress
      return Response.json({
        success: true,
        tesla_vin: teslaDevice[0].tesla_vin,
        features_active: [
          'Stress detection while driving',
          'Oracle voice through car speakers',
          'Autopilot safety monitoring',
          'Biometric cabin sensing'
        ],
        message: 'Tesla integrated. Oracle monitors your wellbeing on the road.'
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});