import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OracleBackground from '../components/OracleBackground';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Loader2, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import VoicePlayer from '../components/voice/VoicePlayer';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ko', name: 'Korean' }
];

export default function Interpreter() {
  const [profile, setProfile] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState(null);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translatedAudioUrl, setTranslatedAudioUrl] = useState(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [generatingVoice, setGeneratingVoice] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }

      const voiceSettingsList = await base44.entities.VoiceSettings.filter({ created_by: currentUser.email });
      if (voiceSettingsList.length > 0) {
        setVoiceSettings(voiceSettingsList[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const translate = async () => {
    if (!sourceText.trim()) return;
    
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following text from ${LANGUAGES.find(l => l.code === sourceLang)?.name} to ${LANGUAGES.find(l => l.code === targetLang)?.name}. Provide ONLY the translation, no explanations:\n\n${sourceText}`,
        add_context_from_internet: false
      });
      setTranslatedText(response);

      // Generate voice for translation if voice settings exist
      if (voiceSettings?.voice_id && voiceSettings?.auto_play) {
        generateVoice(response);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateVoice = async (text) => {
    if (!voiceSettings?.voice_id || !text) return;
    
    setGeneratingVoice(true);
    try {
      const result = await base44.functions.call('generateVoice', {
        text: text,
        voice_id: voiceSettings.voice_id,
        model_id: voiceSettings.model_id,
        stability: voiceSettings.stability,
        similarity_boost: voiceSettings.similarity_boost
      });

      if (result.audio_url) {
        setTranslatedAudioUrl(result.audio_url);
      }
    } catch (error) {
      console.error('Error generating voice:', error);
    } finally {
      setGeneratingVoice(false);
    }
  };

  return (
    <OracleBackground gender={profile?.oracle_gender || 'female'}>
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-white mb-6 hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-blue-300/50">
            <CardHeader>
              <CardTitle className="text-3xl text-blue-900">AI Interpreter Specialist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Source Language</label>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Target Language</label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Original Text</label>
                  <Textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="h-64 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Translation</label>
                  <Textarea
                    value={translatedText}
                    readOnly
                    placeholder="Translation will appear here..."
                    className="h-64 resize-none bg-gray-50"
                  />
                  
                  {translatedText && voiceSettings?.voice_id && (
                    <div className="space-y-2">
                      {translatedAudioUrl ? (
                        <VoicePlayer 
                          audioUrl={translatedAudioUrl} 
                          autoPlay={voiceSettings?.auto_play}
                        />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateVoice(translatedText)}
                          disabled={generatingVoice}
                          className="w-full"
                        >
                          {generatingVoice ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Voice...
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4 mr-2" />
                              Generate Voice for Translation
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={translate}
                  disabled={loading || !sourceText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      Translate
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </OracleBackground>
  );
}