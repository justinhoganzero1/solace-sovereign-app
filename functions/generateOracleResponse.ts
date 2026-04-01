import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, specialist = 'chat', language = 'en' } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    const systemPrompts = {
      chat: 'You are a mystical Oracle AI companion. Be warm, insightful, and engaging.',
      interpreter: 'You are an expert AI translator and language specialist.',
      advisor: 'You are a wise advisor providing thoughtful counsel and guidance.',
      guardian: 'You are a safety-conscious guardian focused on well-being and protection.'
    };

    // Generate unique timestamp-based variety seed
    const varietySeed = Date.now().toString().slice(-6);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompts[specialist] || systemPrompts.chat}

CRITICAL RULE: NEVER repeat the same response twice. Even if asked the same question, provide a unique, fresh perspective each time. Vary your wording, examples, and approach. Be creative and original in every response.

Variety seed: ${varietySeed}

User message: ${message}`,
      add_context_from_internet: false
    });

    if (!response) {
      throw new Error("Received empty response from LLM");
    }

    // Sometimes the response is an object with a 'content' or 'text' property,
    // though Core.InvokeLLM usually returns a string. We'll handle both cases to be safe.
    const responseText = typeof response === 'string' ? response : (response.content || response.text || JSON.stringify(response));

    return Response.json({ 
      response: responseText,
      specialist: specialist,
      language: language
    });
  } catch (error) {
    console.error('Error generating response:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});