/**
 * 200 Multilingual Voices System
 * Voices from around the world in various languages
 */

export class MultilingualVoiceSystem {
  constructor() {
    this.voices = this.initialize200Voices();
  }

  initialize200Voices() {
    const languages = [
      { code: 'en', name: 'English', region: 'US' },
      { code: 'en', name: 'English', region: 'GB' },
      { code: 'en', name: 'English', region: 'AU' },
      { code: 'en', name: 'English', region: 'IN' },
      { code: 'es', name: 'Spanish', region: 'ES' },
      { code: 'es', name: 'Spanish', region: 'MX' },
      { code: 'es', name: 'Spanish', region: 'AR' },
      { code: 'zh', name: 'Chinese', region: 'CN' },
      { code: 'zh', name: 'Chinese', region: 'TW' },
      { code: 'zh', name: 'Chinese', region: 'HK' },
      { code: 'hi', name: 'Hindi', region: 'IN' },
      { code: 'ar', name: 'Arabic', region: 'SA' },
      { code: 'ar', name: 'Arabic', region: 'EG' },
      { code: 'pt', name: 'Portuguese', region: 'BR' },
      { code: 'pt', name: 'Portuguese', region: 'PT' },
      { code: 'bn', name: 'Bengali', region: 'BD' },
      { code: 'ru', name: 'Russian', region: 'RU' },
      { code: 'ja', name: 'Japanese', region: 'JP' },
      { code: 'pa', name: 'Punjabi', region: 'IN' },
      { code: 'de', name: 'German', region: 'DE' },
      { code: 'de', name: 'German', region: 'AT' },
      { code: 'jv', name: 'Javanese', region: 'ID' },
      { code: 'ko', name: 'Korean', region: 'KR' },
      { code: 'fr', name: 'French', region: 'FR' },
      { code: 'fr', name: 'French', region: 'CA' },
      { code: 'te', name: 'Telugu', region: 'IN' },
      { code: 'mr', name: 'Marathi', region: 'IN' },
      { code: 'tr', name: 'Turkish', region: 'TR' },
      { code: 'ta', name: 'Tamil', region: 'IN' },
      { code: 'vi', name: 'Vietnamese', region: 'VN' },
      { code: 'ur', name: 'Urdu', region: 'PK' },
      { code: 'it', name: 'Italian', region: 'IT' },
      { code: 'th', name: 'Thai', region: 'TH' },
      { code: 'gu', name: 'Gujarati', region: 'IN' },
      { code: 'pl', name: 'Polish', region: 'PL' },
      { code: 'uk', name: 'Ukrainian', region: 'UA' },
      { code: 'ml', name: 'Malayalam', region: 'IN' },
      { code: 'kn', name: 'Kannada', region: 'IN' },
      { code: 'or', name: 'Odia', region: 'IN' },
      { code: 'my', name: 'Burmese', region: 'MM' },
      { code: 'ne', name: 'Nepali', region: 'NP' },
      { code: 'si', name: 'Sinhala', region: 'LK' },
      { code: 'km', name: 'Khmer', region: 'KH' },
      { code: 'tk', name: 'Turkmen', region: 'TM' },
      { code: 'az', name: 'Azerbaijani', region: 'AZ' },
      { code: 'hu', name: 'Hungarian', region: 'HU' },
      { code: 'cs', name: 'Czech', region: 'CZ' },
      { code: 'ro', name: 'Romanian', region: 'RO' },
      { code: 'nl', name: 'Dutch', region: 'NL' },
      { code: 'nl', name: 'Dutch', region: 'BE' },
      { code: 'el', name: 'Greek', region: 'GR' },
      { code: 'sv', name: 'Swedish', region: 'SE' },
      { code: 'he', name: 'Hebrew', region: 'IL' },
      { code: 'id', name: 'Indonesian', region: 'ID' },
      { code: 'ms', name: 'Malay', region: 'MY' },
      { code: 'fa', name: 'Persian', region: 'IR' },
      { code: 'fil', name: 'Filipino', region: 'PH' },
      { code: 'da', name: 'Danish', region: 'DK' },
      { code: 'fi', name: 'Finnish', region: 'FI' },
      { code: 'no', name: 'Norwegian', region: 'NO' },
      { code: 'sk', name: 'Slovak', region: 'SK' },
      { code: 'bg', name: 'Bulgarian', region: 'BG' },
      { code: 'hr', name: 'Croatian', region: 'HR' },
      { code: 'lt', name: 'Lithuanian', region: 'LT' },
      { code: 'sl', name: 'Slovenian', region: 'SI' },
      { code: 'et', name: 'Estonian', region: 'EE' },
      { code: 'lv', name: 'Latvian', region: 'LV' },
      { code: 'mk', name: 'Macedonian', region: 'MK' },
      { code: 'sq', name: 'Albanian', region: 'AL' },
      { code: 'sr', name: 'Serbian', region: 'RS' },
      { code: 'bs', name: 'Bosnian', region: 'BA' },
      { code: 'is', name: 'Icelandic', region: 'IS' },
      { code: 'mt', name: 'Maltese', region: 'MT' },
      { code: 'ga', name: 'Irish', region: 'IE' },
      { code: 'cy', name: 'Welsh', region: 'GB' },
      { code: 'eu', name: 'Basque', region: 'ES' },
      { code: 'gl', name: 'Galician', region: 'ES' },
      { code: 'ca', name: 'Catalan', region: 'ES' },
      { code: 'af', name: 'Afrikaans', region: 'ZA' },
      { code: 'sw', name: 'Swahili', region: 'KE' },
      { code: 'zu', name: 'Zulu', region: 'ZA' },
      { code: 'xh', name: 'Xhosa', region: 'ZA' },
      { code: 'am', name: 'Amharic', region: 'ET' },
      { code: 'ha', name: 'Hausa', region: 'NG' },
      { code: 'ig', name: 'Igbo', region: 'NG' },
      { code: 'yo', name: 'Yoruba', region: 'NG' },
      { code: 'so', name: 'Somali', region: 'SO' },
      { code: 'kk', name: 'Kazakh', region: 'KZ' },
      { code: 'ky', name: 'Kyrgyz', region: 'KG' },
      { code: 'tg', name: 'Tajik', region: 'TJ' },
      { code: 'uz', name: 'Uzbek', region: 'UZ' },
      { code: 'mn', name: 'Mongolian', region: 'MN' },
      { code: 'ps', name: 'Pashto', region: 'AF' },
      { code: 'ku', name: 'Kurdish', region: 'IQ' },
      { code: 'sd', name: 'Sindhi', region: 'PK' },
      { code: 'ug', name: 'Uyghur', region: 'CN' }
    ];

    const voices = [];
    let voiceId = 1;

    languages.forEach(lang => {
      // Male voice
      voices.push({
        id: `voice_${voiceId++}`,
        name: `${lang.name} (${lang.region}) - Male`,
        language: lang.code,
        region: lang.region,
        gender: 'male',
        quality: 'high',
        neural: true
      });

      // Female voice
      voices.push({
        id: `voice_${voiceId++}`,
        name: `${lang.name} (${lang.region}) - Female`,
        language: lang.code,
        region: lang.region,
        gender: 'female',
        quality: 'high',
        neural: true
      });

      // Add additional variants for major languages
      if (['en', 'es', 'zh', 'fr', 'de', 'ja'].includes(lang.code)) {
        voices.push({
          id: `voice_${voiceId++}`,
          name: `${lang.name} (${lang.region}) - Neutral`,
          language: lang.code,
          region: lang.region,
          gender: 'neutral',
          quality: 'premium',
          neural: true
        });
      }
    });

    return voices.slice(0, 200); // Ensure exactly 200 voices
  }

  getVoicesByLanguage(languageCode) {
    return this.voices.filter(v => v.language === languageCode);
  }

  getVoicesByRegion(regionCode) {
    return this.voices.filter(v => v.region === regionCode);
  }

  getVoicesByGender(gender) {
    return this.voices.filter(v => v.gender === gender);
  }

  getVoiceById(voiceId) {
    return this.voices.find(v => v.id === voiceId);
  }

  getAllVoices() {
    return this.voices;
  }

  getLanguages() {
    const languages = new Map();
    this.voices.forEach(voice => {
      if (!languages.has(voice.language)) {
        languages.set(voice.language, {
          code: voice.language,
          name: voice.name.split('(')[0].trim(),
          voiceCount: 0
        });
      }
      const lang = languages.get(voice.language);
      lang.voiceCount++;
    });
    return Array.from(languages.values());
  }

  getRegions() {
    const regions = new Set();
    this.voices.forEach(voice => regions.add(voice.region));
    return Array.from(regions).sort();
  }

  async speak(text, voiceId, options = {}) {
    const voice = this.getVoiceById(voiceId);
    if (!voice) {
      throw new Error(`Voice ${voiceId} not found`);
    }

    // Use Web Speech API or custom synthesis
    if (window.speechSynthesis) {
      return this.speakWithWebAPI(text, voice, options);
    } else {
      return this.speakWithCustomSynthesis(text, voice, options);
    }
  }

  async speakWithWebAPI(text, voice, options) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find matching system voice
      const systemVoices = window.speechSynthesis.getVoices();
      const matchingVoice = systemVoices.find(v => 
        v.lang.startsWith(voice.language) && 
        (voice.gender === 'neutral' || v.name.toLowerCase().includes(voice.gender))
      );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.lang = `${voice.language}-${voice.region}`;
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      window.speechSynthesis.speak(utterance);
    });
  }

  async speakWithCustomSynthesis(text, voice, options) {
    // Fallback to custom synthesis engine
    const { voiceSynthesis } = await import('./voiceSynthesis');
    
    const voiceType = `${voice.gender}_${voice.quality}`;
    return voiceSynthesis.speak(text, voiceType, options);
  }

  searchVoices(query) {
    const lowerQuery = query.toLowerCase();
    return this.voices.filter(voice => 
      voice.name.toLowerCase().includes(lowerQuery) ||
      voice.language.toLowerCase().includes(lowerQuery) ||
      voice.region.toLowerCase().includes(lowerQuery)
    );
  }
}

export const multilingualVoices = new MultilingualVoiceSystem();
