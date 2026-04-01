import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipe_text, target_language, simplify_for_kids } = await req.json();

    // Translate and adapt recipe
    const translationPrompt = `Translate this recipe to ${target_language}:

${recipe_text}

${simplify_for_kids ? 'Make it very simple and fun for kids to understand, with easy-to-follow steps.' : 'Keep professional cooking terminology.'}

Provide the translation in a clear, structured format.`;

    const translatedRecipe = await base44.integrations.Core.InvokeLLM({
      prompt: translationPrompt,
      add_context_from_internet: false
    });

    // Also provide cooking tips if requested
    const tipsPrompt = `Give 3 helpful cooking tips for this recipe in ${target_language}, ${simplify_for_kids ? 'suitable for kids' : 'for adults'}`;
    
    const cookingTips = await base44.integrations.Core.InvokeLLM({
      prompt: tipsPrompt,
      add_context_from_internet: false
    });

    return Response.json({ 
      success: true,
      translated_recipe: translatedRecipe,
      cooking_tips: cookingTips,
      language: target_language
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});