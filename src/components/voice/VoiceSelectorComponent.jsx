import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Play, Square } from 'lucide-react';
import { voiceManager } from './WebSpeechVoiceUtils';
import { motion } from 'framer-motion';

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)' },
  { code: 'ru-RU', label: 'Russian' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'zh-CN', label: 'Chinese (Mandarin)' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ar-SA', label: 'Arabic' },
];

export default function VoiceSelectorComponent({ onVoiceChange, initialSettings }) {
  const [language, setLanguage] = useState(initialSettings?.language_code || 'en-US');
  const [gender, setGender] = useState(initialSettings?.voice_gender || 'female');
  const [pitch, setPitch] = useState(initialSettings?.pitch || 1.0);
  const [rate, setRate] = useState(initialSettings?.rate || 1.0);
  const [volume, setVolume] = useState(initialSettings?.volume || 1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTestVoice = () => {
    if (isSpeaking) {
      voiceManager.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voiceManager.speak('Hello! This is a comprehensive test of the Oracle voice settings. I am your AI companion from Friends Only, ready to assist you with everything from crisis management to daily wellness support. You can adjust my pitch, rate, and volume to match your preferences perfectly. This longer test helps you hear exactly how I will sound during our conversations. The Oracle neural pathways are fully activated and calibrated for you.', {
        language,
        gender,
        pitch,
        rate,
        volume,
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  const handleSettingChange = (setting, value) => {
    switch (setting) {
      case 'language':
        setLanguage(value);
        break;
      case 'gender':
        setGender(value);
        break;
      case 'pitch':
        setPitch(value);
        break;
      case 'rate':
        setRate(value);
        break;
      case 'volume':
        setVolume(value);
        break;
    }

    if (onVoiceChange) {
      onVoiceChange({
        language_code: language,
        voice_gender: gender,
        pitch,
        rate,
        volume
      });
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-600" />
          Voice Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Language</Label>
          <Select value={language} onValueChange={(value) => handleSettingChange('language', value)}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gender Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Voice Gender</Label>
          <div className="flex gap-3">
            {['female', 'male', 'neutral'].map(g => (
              <Button
                key={g}
                variant={gender === g ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleSettingChange('gender', g)}
              >
                {g === 'female' ? '👩' : g === 'male' ? '👨' : '🤖'} {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Pitch: {pitch.toFixed(2)}</Label>
          <p className="text-xs text-gray-600">0.5 (Lower) → 2.0 (Higher)</p>
          <Slider
            value={[pitch]}
            min={0.5}
            max={2.0}
            step={0.1}
            onValueChange={(val) => handleSettingChange('pitch', val[0])}
            className="w-full"
          />
        </div>

        {/* Rate Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Speech Rate: {rate.toFixed(2)}</Label>
          <p className="text-xs text-gray-600">0.5 (Slower) → 2.0 (Faster)</p>
          <Slider
            value={[rate]}
            min={0.5}
            max={2.0}
            step={0.1}
            onValueChange={(val) => handleSettingChange('rate', val[0])}
            className="w-full"
          />
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Volume: {(volume * 100).toFixed(0)}%</Label>
          <p className="text-xs text-gray-600">Adjust speaker output level</p>
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(val) => handleSettingChange('volume', val[0])}
            className="w-full"
          />
        </div>

        {/* Test Voice Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTestVoice}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            isSpeaking
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
          }`}
        >
          {isSpeaking ? (
            <>
              <Square className="w-4 h-4" /> Stop Voice Test
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Test Voice
            </>
          )}
        </motion.button>
      </CardContent>
    </Card>
  );
}