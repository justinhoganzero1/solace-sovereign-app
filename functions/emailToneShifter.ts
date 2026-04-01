import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { casualRant, targetTone } = await req.json();

    // Rewrite email in professional tone
    const rewritten = await base44.integrations.Core.InvokeLLM({
      prompt: `Rewrite this casual message into a ${targetTone || 'professional'} email. Original: "${casualRant}". Maintain the core message but adjust tone, grammar, and structure appropriately.`,
      response_json_schema: {
        type: "object",
        properties: {
          rewritten_email: { type: "string" },
          subject_line: { type: "string" },
          tone_analysis: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      email: rewritten
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});