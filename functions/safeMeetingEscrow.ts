import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, meeting_id, meeting_with, location, time, latitude, longitude } = await req.json();

    if (action === 'create') {
      // Create safe meeting with GPS escrow
      const meeting = await base44.entities.SafeMeeting.create({
        meeting_with,
        meeting_location: location,
        meeting_time: time,
        escrow_holder_lat: latitude,
        escrow_holder_lng: longitude,
        check_in_required: true,
        check_in_interval_minutes: 15
      });

      return Response.json({
        success: true,
        meeting,
        message: 'Meeting secured. Oracle holds both GPS locations for safety.',
        next_check_in: '15 minutes'
      });
    } else if (action === 'check_in') {
      // User checking in during meeting
      const meeting = await base44.entities.SafeMeeting.get(meeting_id);

      await base44.entities.SafeMeeting.update(meeting_id, {
        last_check_in: new Date().toISOString()
      });

      return Response.json({
        success: true,
        message: 'Check-in confirmed. Oracle monitoring continues.'
      });
    } else if (action === 'complete') {
      // Meeting ended safely
      await base44.entities.SafeMeeting.update(meeting_id, {
        meeting_completed: true,
        check_in_required: false
      });

      // Award trust score
      const trustScores = await base44.entities.TrustScore.filter({ 
        created_by: user.email 
      });
      
      if (trustScores.length > 0) {
        const currentScore = trustScores[0];
        await base44.entities.TrustScore.update(currentScore.id, {
          score: Math.min(100, currentScore.score + 2),
          safety_streak_days: (currentScore.safety_streak_days || 0) + 1
        });
      }

      return Response.json({
        success: true,
        message: 'Safe meeting completed. +2 Trust Score.',
        trust_score_bonus: 2
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});