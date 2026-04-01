import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { post_id, content, title } = await req.json();

    // AI moderation check
    const moderationPrompt = `Analyze this forum post for policy violations:

Title: ${title}
Content: ${content}

Check for:
1. Hate speech or discrimination
2. Spam or advertising
3. Harassment or bullying
4. Violence or threats
5. Sexual content
6. Misinformation

Respond with JSON:
{
  "is_violation": boolean,
  "violation_type": "hate_speech" | "spam" | "inappropriate" | "harassment" | "violence" | "misinformation" | "none",
  "confidence": 0-1,
  "reason": "explanation",
  "suggested_action": "approve" | "review" | "warn" | "remove" | "ban_user",
  "auto_response": "message to user if needed"
}`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: moderationPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          is_violation: { type: "boolean" },
          violation_type: { type: "string" },
          confidence: { type: "number" },
          reason: { type: "string" },
          suggested_action: { type: "string" },
          auto_response: { type: "string" }
        }
      }
    });

    // Validate analysis response
    if (!analysis || typeof analysis !== 'object') {
      return Response.json({
        is_safe: true,
        analysis: { is_violation: false },
        action_taken: 'none'
      });
    }

    // Flag high-confidence violations
    if (analysis.is_violation && analysis.confidence > 0.7) {
      await base44.asServiceRole.entities.ModerationFlag.create({
        post_id,
        flag_type: analysis.violation_type || 'inappropriate',
        confidence_score: analysis.confidence || 0.5,
        ai_reason: analysis.reason || 'Automated detection',
        suggested_action: analysis.suggested_action || 'review',
        auto_moderated: (analysis.confidence || 0) > 0.9
      });

      // Auto-remove extremely high confidence violations
      if ((analysis.confidence || 0) > 0.95) {
        await base44.asServiceRole.entities.ForumPost.update(post_id, {
          is_featured: false,
          content: '[Content removed by automated moderation]'
        });
      }
    }

    return Response.json({
      is_safe: !analysis.is_violation || (analysis.confidence || 0) < 0.7,
      analysis,
      action_taken: analysis.is_violation && (analysis.confidence || 0) > 0.95 ? 'auto_removed' : 'none'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});