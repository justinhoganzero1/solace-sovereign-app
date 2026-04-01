import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, content_rating } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text required' }, { status: 400 });
    }

    // Get user profile for safety settings
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const profile = profiles[0];

    // Determine risk level based on content
    const riskLevel = assessContentRisk(text);

    // Check against safety mode
    let shouldBlock = false;
    if (profile?.safety_mode) {
      if (riskLevel === 'high_risk' || (profile?.age_category === 'under_16' && riskLevel === 'warning')) {
        shouldBlock = true;
      }
    }

    return Response.json({
      approved: !shouldBlock,
      risk_level: riskLevel,
      safety_mode_active: profile?.safety_mode,
      age_category: profile?.age_category
    });
  } catch (error) {
    console.error('Error filtering content:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function assessContentRisk(text) {
  const textLower = text.toLowerCase();
  
  // High risk keywords
  if (/violence|weapon|harm|kill|murder|gun|knife/.test(textLower)) {
    return 'high_risk';
  }
  
  // Warning level keywords
  if (/adult|explicit|sexual|inappropriate|drugs|alcohol/.test(textLower)) {
    return 'warning';
  }
  
  // Caution level
  if (/stress|anxiety|danger|careful|warning/.test(textLower)) {
    return 'caution';
  }
  
  return 'safe';
}