import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_text, user_message, oracle_response } = await req.json();

    // AI extracts memorable information
    const extractPrompt = `From this conversation, extract important information to remember:

User: ${user_message}
Oracle: ${oracle_response}

Extract key memories. Return JSON array:
[
  {
    "memory_type": "conversation" | "preference" | "fact" | "relationship" | "emotion" | "milestone",
    "content": "what to remember",
    "importance": 1-10,
    "tags": ["tag1", "tag2"]
  }
]

Only extract truly important information. Skip small talk.`;

    const memories = await base44.integrations.Core.InvokeLLM({
      prompt: extractPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          memories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                memory_type: { type: "string" },
                content: { type: "string" },
                importance: { type: "number" },
                tags: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    const stored = [];
    const memoryList = memories?.memories || [];
    for (const memory of memoryList) {
      if (memory.importance >= 5) {
        const stored_memory = await base44.entities.OracleMemory.create({
          memory_type: memory.memory_type,
          content: memory.content,
          context: `From conversation on ${new Date().toLocaleDateString()}`,
          importance: memory.importance,
          tags: memory.tags || []
        });
        stored.push(stored_memory);
      }
    }

    return Response.json({
      success: true,
      memories_stored: stored.length,
      memories: stored
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});