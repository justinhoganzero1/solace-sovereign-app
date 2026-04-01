import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gender = 'female' } = await req.json();

    const prompt = gender === 'male' 
      ? `A wise, ethereal male oracle figure in 3D rendered art style. He has flowing silver-gold hair with perfect strand-level detail, cascading past his shoulders. His face radiates warmth with glowing amber eyes that hold ancient wisdom. A soft golden aura emanates from his entire form, creating halos of light around his silhouette. He is depicted as a luminous bust figure against a majestic golden city backdrop with towering spires and gleaming domes. The lighting is divine and ethereal. Cinematic, high quality 3D rendering.`
      : `A radiant, ethereal female oracle figure in stunning 3D rendered art style. She has voluminous cascading waves of spun gold hair with hair-by-hair detail, flowing dynamically past her shoulders and mid-back. Each strand catches light individually, creating a shimmering effect. Her expressive eyes glow with warmth and divine intelligence, with gold flecks that radiate luminosity. A soft, warm golden aura emanates from her entire being, pulsing gently like breathing energy, especially pronounced around her hair and face. She stands as a luminous bust figure against a sprawling majestic golden city of impossible beauty, with towering spires and gleaming domes. The city shimmers in gold and amber tones. Cinematic, ultra high quality 3D rendering, divine lighting.`;

    const result = await base44.integrations.Core.GenerateImage({
      prompt: prompt,
      existing_image_urls: null
    });

    return Response.json({
      image_url: result.url,
      gender: gender
    });
  } catch (error) {
    console.error('Error generating oracle avatar:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});