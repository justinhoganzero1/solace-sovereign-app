import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { age_category } = await req.json();

    if (!age_category || !['under_16', 'age_16_18', 'age_18_plus'].includes(age_category)) {
      return Response.json({ error: 'Invalid age category' }, { status: 400 });
    }

    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, {
        age_category,
        age_verified: true
      });
    }

    return Response.json({ 
      success: true,
      age_verified: true,
      age_category
    });
  } catch (error) {
    console.error('Error verifying age:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});