import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { persona_id, message, auto_detect_context } = await req.json();

    let activePersona;

    if (auto_detect_context && message) {
      // Auto-detect which persona to use based on message context
      const personas = await base44.entities.AIPersona.filter({ created_by: user.email });
      
      const detectionPrompt = `Analyze this user message and determine which persona would be most appropriate:
      
Message: "${message}"

Available personas: ${personas.map(p => `${p.persona_name} (${p.tone}, expertise: ${p.knowledge_domains?.join(', ')})`).join('; ')}

Return only the persona name that best matches, or "default" if none fit well.`;

      const detectedPersona = await base44.integrations.Core.InvokeLLM({
        prompt: detectionPrompt,
        add_context_from_internet: false
      });

      activePersona = personas.find(p => 
        detectedPersona.toLowerCase().includes(p.persona_name.toLowerCase())
      );
    } else if (persona_id) {
      activePersona = await base44.entities.AIPersona.get(persona_id);
    }

    if (!activePersona) {
      // Use default persona
      const defaultPersonas = await base44.entities.AIPersona.filter({ 
        created_by: user.email,
        is_default: true 
      });
      activePersona = defaultPersonas[0];
    }

    // Deactivate all other personas
    const allPersonas = await base44.entities.AIPersona.filter({ created_by: user.email });
    for (const persona of allPersonas) {
      if (persona.id !== activePersona?.id) {
        await base44.entities.AIPersona.update(persona.id, { is_active: false });
      }
    }

    // Activate selected persona
    if (activePersona) {
      await base44.entities.AIPersona.update(activePersona.id, { is_active: true });
    }

    return Response.json({ 
      success: true,
      active_persona: activePersona,
      persona_instructions: activePersona?.custom_instructions,
      tone: activePersona?.tone,
      knowledge_domains: activePersona?.knowledge_domains
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});