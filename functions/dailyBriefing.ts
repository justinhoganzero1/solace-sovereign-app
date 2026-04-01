import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all briefing components
    const weatherRes = await base44.functions.invoke('getWeatherSummary');
    const newsRes = await base44.functions.invoke('getNewsSummary');
    const remindersRes = await base44.functions.invoke('getReminders');

    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const profile = profiles[0] || {};

    const briefing = {
      greeting: `Good morning, ${profile.user_name || user.full_name}!`,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      weather: weatherRes.data?.summary || 'Weather information unavailable',
      news: newsRes.data?.headlines?.slice(0, 3) || [],
      reminders: remindersRes.data?.upcoming || [],
      motivational: await getMotivationalMessage(),
      affirmation: await getAffirmation()
    };

    return Response.json(briefing);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function getMotivationalMessage() {
  const messages = [
    "Today is full of possibilities. Make it count!",
    "You have the power to make today amazing.",
    "Believe in yourself - you're capable of incredible things.",
    "Every day is a fresh start. Embrace it!",
    "Your potential is limitless. Go show the world!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

async function getAffirmation() {
  const affirmations = [
    "I am worthy of love and respect.",
    "I am capable and strong.",
    "I choose happiness and positivity.",
    "I am grateful for this day.",
    "I trust in my abilities."
  ];
  return affirmations[Math.floor(Math.random() * affirmations.length)];
}