import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user activity data
    const userPosts = await base44.entities.ForumPost.filter({ created_by: user.email });
    const userVotes = await base44.entities.PostVote.filter({ created_by: user.email });
    const completedQuests = await base44.entities.Quest.filter({ 
      created_by: user.email,
      completion_status: 'completed'
    });

    // Get all posts for recommendation
    const allPosts = await base44.entities.ForumPost.list('-upvotes', 50);
    const allGroups = await base44.entities.CommunityGroup.list();

    // Build user interest profile
    const userInterests = [
      ...userPosts.map(p => p.category),
      ...userPosts.flatMap(p => p.tags || []),
      ...completedQuests.map(q => q.category)
    ];

    const interestCounts = {};
    userInterests.forEach(interest => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });

    // AI-powered recommendations
    const recommendPrompt = `Based on user activity:
- Posted about: ${Object.keys(interestCounts).join(', ')}
- Top interests: ${Object.entries(interestCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k).join(', ')}
- Completed ${completedQuests.length} quests

Available content:
${allPosts.slice(0, 20).map(p => `- Post: ${p.title} (${p.category}, tags: ${p.tags?.join(', ') || 'none'})`).join('\n')}

Groups:
${allGroups.slice(0, 10).map(g => `- ${g.group_name} (${g.category})`).join('\n')}

Generate 5 personalized recommendations with relevance scores (0-1). Return JSON:
{
  "recommendations": [
    {
      "type": "post" | "group" | "feature",
      "title": "string",
      "reason": "why this matches their interests",
      "relevance": 0-1
    }
  ]
}`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt: recommendPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                title: { type: "string" },
                reason: { type: "string" },
                relevance: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Store recommendations
    const recList = recommendations?.recommendations || [];
    for (const rec of recList) {
      await base44.entities.ContentRecommendation.create({
        recommendation_type: rec.type,
        target_id: rec.title,
        relevance_score: rec.relevance,
        reason: rec.reason
      });
    }

    return Response.json({
      recommendations: recList,
      user_interests: interestCounts
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});