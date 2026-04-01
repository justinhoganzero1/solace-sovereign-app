import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude } = await req.json();

    // Update location for all approved friends
    const friendConnections = await base44.entities.FriendConnection.filter({ 
      created_by: user.email,
      status: 'approved',
      location_sharing_enabled: true
    });

    // Store in breadcrumb for sharing
    await base44.entities.LocationBreadcrumb.create({
      latitude,
      longitude,
      shared_with_contacts: true,
      accuracy: 10
    });

    // Get friends who are sharing their location back
    const friendsLocations = [];
    for (const friend of friendConnections) {
      if (friend.last_known_lat && friend.last_known_lng) {
        friendsLocations.push({
          name: friend.friend_name,
          lat: friend.last_known_lat,
          lng: friend.last_known_lng,
          last_update: friend.last_location_update
        });
      }
    }

    return Response.json({ 
      success: true,
      your_location: { latitude, longitude },
      friends_visible: friendsLocations.length,
      friends: friendsLocations
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});