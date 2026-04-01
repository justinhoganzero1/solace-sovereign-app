import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, conversation_context } = await req.json();

    // Get relevant memories
    const allMemories = await base44.entities.OracleMemory.filter({ 
      created_by: user.email 
    });

    // Get active training data
    const training = await base44.entities.OracleTraining.filter({ 
      created_by: user.email,
      active: true
    });

    // Get active persona
    const personas = await base44.entities.OraclePersona.filter({ 
      created_by: user.email,
      is_active: true
    });
    const activePersona = personas.length > 0 ? personas[0] : null;

    // AI-powered memory retrieval
    const memoryPrompt = `User query: "${query}"
Conversation context: "${conversation_context}"

Available memories (${allMemories.length} total):
${allMemories.slice(0, 50).map(m => `- [${m.memory_type}] ${m.content} (importance: ${m.importance})`).join('\n')}

Select the 5 most relevant memories for this context. Return JSON:
{
  "relevant_memories": [
    {
      "memory_id": "string",
      "relevance": 0-1,
      "why_relevant": "explanation"
    }
  ]
}`;

    const relevantMemories = await base44.integrations.Core.InvokeLLM({
      prompt: memoryPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          relevant_memories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                memory_id: { type: "string" },
                relevance: { type: "number" },
                why_relevant: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Build context for Oracle response
    const memoryContext = (relevantMemories?.relevant_memories || [])
      .map(rm => {
        const memory = allMemories.find(m => m.id === rm.memory_id);
        return memory ? memory.content : '';
      })
      .filter(c => c)
      .join('\n');

    const trainingContext = training
      .map(t => `[${t.training_type}]: ${t.training_data}`)
      .join('\n');

    const personaContext = activePersona 
      ? `Current mood: ${activePersona.mood}. Formality: ${activePersona.formality_level}/10. Style: ${activePersona.verbosity}. Traits: ${activePersona.personality_traits?.join(', ')}. ${activePersona.system_prompt_override || ''}`
      : '';

    return Response.json({
      memory_context: memoryContext,
      training_context: trainingContext,
      persona_context: personaContext,
      relevant_memories: relevantMemories?.relevant_memories || [],
      active_persona: activePersona
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});