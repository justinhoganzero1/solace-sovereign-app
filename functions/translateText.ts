import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, targetLanguage, sourceLanguage = 'en' } = await req.json();

    if (!text || !targetLanguage) {
      return Response.json({ error: 'Text and target language required' }, { status: 400 });
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return only the translated text:\n\n${text}`,
      add_context_from_internet: false
    });

    return Response.json({ 
      original: text,
      translation: response,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage
    });
  } catch (error) {
    console.error('Error translating text:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});