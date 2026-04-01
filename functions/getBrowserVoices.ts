import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a list of available browser voices by language and gender
    // This is a curated list - actual browser voices vary by OS
    const voices = [
      { name: 'English (US) - Female', lang: 'en-US', gender: 'female', accent: 'american' },
      { name: 'English (US) - Male', lang: 'en-US', gender: 'male', accent: 'american' },
      { name: 'English (GB) - Female', lang: 'en-GB', gender: 'female', accent: 'british' },
      { name: 'English (GB) - Male', lang: 'en-GB', gender: 'male', accent: 'british' },
      { name: 'English (AU) - Female', lang: 'en-AU', gender: 'female', accent: 'australian' },
      { name: 'English (AU) - Male', lang: 'en-AU', gender: 'male', accent: 'australian' },
      { name: 'Spanish (ES) - Female', lang: 'es-ES', gender: 'female', accent: 'castilian' },
      { name: 'Spanish (ES) - Male', lang: 'es-ES', gender: 'male', accent: 'castilian' },
      { name: 'Spanish (MX) - Female', lang: 'es-MX', gender: 'female', accent: 'mexican' },
      { name: 'Spanish (MX) - Male', lang: 'es-MX', gender: 'male', accent: 'mexican' },
      { name: 'French (FR) - Female', lang: 'fr-FR', gender: 'female', accent: 'neutral' },
      { name: 'French (FR) - Male', lang: 'fr-FR', gender: 'male', accent: 'neutral' },
      { name: 'German (DE) - Female', lang: 'de-DE', gender: 'female', accent: 'neutral' },
      { name: 'German (DE) - Male', lang: 'de-DE', gender: 'male', accent: 'neutral' },
      { name: 'Italian (IT) - Female', lang: 'it-IT', gender: 'female', accent: 'neutral' },
      { name: 'Italian (IT) - Male', lang: 'it-IT', gender: 'male', accent: 'neutral' },
      { name: 'Portuguese (BR) - Female', lang: 'pt-BR', gender: 'female', accent: 'brazilian' },
      { name: 'Portuguese (BR) - Male', lang: 'pt-BR', gender: 'male', accent: 'brazilian' },
      { name: 'Portuguese (PT) - Female', lang: 'pt-PT', gender: 'female', accent: 'portuguese' },
      { name: 'Portuguese (PT) - Male', lang: 'pt-PT', gender: 'male', accent: 'portuguese' },
      { name: 'Russian (RU) - Female', lang: 'ru-RU', gender: 'female', accent: 'neutral' },
      { name: 'Russian (RU) - Male', lang: 'ru-RU', gender: 'male', accent: 'neutral' },
      { name: 'Japanese (JP) - Female', lang: 'ja-JP', gender: 'female', accent: 'neutral' },
      { name: 'Japanese (JP) - Male', lang: 'ja-JP', gender: 'male', accent: 'neutral' },
      { name: 'Chinese (Mandarin) - Female', lang: 'zh-CN', gender: 'female', accent: 'neutral' },
      { name: 'Chinese (Mandarin) - Male', lang: 'zh-CN', gender: 'male', accent: 'neutral' },
      { name: 'Korean (KO) - Female', lang: 'ko-KR', gender: 'female', accent: 'neutral' },
      { name: 'Korean (KO) - Male', lang: 'ko-KR', gender: 'male', accent: 'neutral' },
      { name: 'Hindi (IN) - Female', lang: 'hi-IN', gender: 'female', accent: 'neutral' },
      { name: 'Hindi (IN) - Male', lang: 'hi-IN', gender: 'male', accent: 'neutral' },
      { name: 'Arabic (AR) - Female', lang: 'ar-SA', gender: 'female', accent: 'neutral' },
      { name: 'Arabic (AR) - Male', lang: 'ar-SA', gender: 'male', accent: 'neutral' },
    ];

    return Response.json({ voices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});