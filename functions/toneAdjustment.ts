import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, tone, mood } = await req.json();

    const toneInstructions = {
      formal: "Respond in a professional, formal manner. Use proper grammar and sophisticated vocabulary.",
      casual: "Respond in a relaxed, friendly, conversational tone. Use casual language.",
      empathetic: "Respond with deep empathy and emotional understanding. Show care and compassion.",
      professional: "Respond in a business-appropriate, clear, and efficient manner."
    };

    const moodAdjustments = {
      happy: "The user is feeling happy and upbeat.",
      sad: "The user is feeling down. Be gentle and supportive.",
      anxious: "The user is anxious. Be calming and reassuring.",
      angry: "The user is frustrated or angry. Be understanding and validating.",
      neutral: "The user has a neutral mood."
    };

    const systemPrompt = `You are Oracle, an AI companion. ${toneInstructions[tone] || toneInstructions.empathetic} ${moodAdjustments[mood] || ''}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nUser: ${message}`,
      add_context_from_internet: false
    });

    return Response.json({ response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});