import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OracleBackground from '../components/OracleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';
import VoiceSelectorComponent from '../components/voice/VoiceSelectorComponent';
import { multilingualVoices } from '../lib/multilingualVoices';


export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [_saving, setSaving] = useState(false);
  const [selectedLanguage, _setSelectedLanguage] = useState('en');
  const [_selectedVoice, _setSelectedVoice] = useState(null);
  const [voiceSearch, _setVoiceSearch] = useState('');
  const [_availableLanguages, setAvailableLanguages] = useState([]);
  const [_filteredVoices, setFilteredVoices] = useState([]);

  useEffect(() => {
    loadData();
    const languages = multilingualVoices.getLanguages();
    setAvailableLanguages(languages);
  }, []);

  useEffect(() => {
    if (voiceSearch) {
      setFilteredVoices(multilingualVoices.searchVoices(voiceSearch));
    } else {
      setFilteredVoices(multilingualVoices.getVoicesByLanguage(selectedLanguage));
    }
  }, [selectedLanguage, voiceSearch]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        const newProfile = await base44.entities.UserProfile.create({
          oracle_gender: 'female',
          language: 'en',
          tier_level: 'free',
          safety_mode: true
        });
        setProfile(newProfile);
      }

      const voiceSettingsList = await base44.entities.VoiceSettings.filter({ created_by: currentUser.email });
      if (voiceSettingsList.length > 0) {
        setVoiceSettings(voiceSettingsList[0]);
      } else {
        const newVoiceSettings = await base44.entities.VoiceSettings.create({
          voice_id: 'EXAVITQu4vr4xnSDxMaL',
          voice_name: 'Sarah',
          model_id: 'eleven_multilingual_v2',
          stability: 0.5,
          similarity_boost: 0.75,
          auto_play: false
        });
        setVoiceSettings(newVoiceSettings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    setSaving(true);
    try {
      const updated = await base44.entities.UserProfile.update(profile.id, updates);
      setProfile(updated);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateVoiceSettings = async (updates) => {
    setSaving(true);
    try {
      const updated = await base44.entities.VoiceSettings.update(voiceSettings.id, updates);
      setVoiceSettings(updated);
      toast.success('Voice settings saved');
    } catch {
      toast.error('Failed to save voice settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OracleBackground gender={profile?.oracle_gender || 'female'}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </OracleBackground>
    );
  }

  return (
    <OracleBackground gender={profile?.oracle_gender || 'female'}>
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="text-white mb-6 hover:bg-white/20" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>

          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-yellow-300/50">
            <CardHeader>
              <CardTitle className="text-3xl text-amber-900 flex items-center">
                <User className="w-8 h-8 mr-3" />
                Friends Only Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="oracle" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="oracle">Oracle</TabsTrigger>
                  <TabsTrigger value="voice">Voice</TabsTrigger>
                  <TabsTrigger value="language">Language</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>

                <TabsContent value="oracle" className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <Label className="text-lg">Choose Your Oracle</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={profile?.oracle_gender === 'female' ? 'default' : 'outline'}
                        className="h-32 flex flex-col"
                        onClick={() => updateProfile({ oracle_gender: 'female' })}
                      >
                        <div className="text-4xl mb-2">👩</div>
                        <div>Female Oracle</div>
                      </Button>
                      <Button
                        variant={profile?.oracle_gender === 'male' ? 'default' : 'outline'}
                        className="h-32 flex flex-col"
                        onClick={() => updateProfile({ oracle_gender: 'male' })}
                      >
                        <div className="text-4xl mb-2">👨</div>
                        <div>Male Oracle</div>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg">Tier Level</Label>
                    <Select
                      value={profile?.tier_level}
                      onValueChange={(value) => updateProfile({ tier_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="space-y-6 mt-6">
                   <VoiceSelectorComponent 
                     initialSettings={voiceSettings}
                     onVoiceChange={(settings) => updateVoiceSettings(settings)}
                   />

                   <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                     <div>
                       <Label className="text-lg">Auto-Play Voice Responses</Label>
                       <p className="text-sm text-gray-600">Automatically play voice when Oracle responds</p>
                     </div>
                     <Switch
                       checked={voiceSettings?.auto_play}
                       onCheckedChange={(checked) => updateVoiceSettings({ auto_play: checked })}
                     />
                   </div>
                 </TabsContent>

                <TabsContent value="language" className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <Label className="text-lg">Primary Language</Label>
                    <Select
                      value={profile?.language}
                      onValueChange={(value) => updateProfile({ language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg">Voice Accent (ElevenLabs)</Label>
                    <Select
                      value={profile?.voice_accent}
                      onValueChange={(value) => updateProfile({ voice_accent: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="british">British</SelectItem>
                        <SelectItem value="australian">Australian</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-amber-700">
                      Note: Voice integration requires ElevenLabs API setup
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <Label className="text-lg">Safety Guardian Mode</Label>
                      <p className="text-sm text-gray-600">Enhanced content filtering and monitoring</p>
                    </div>
                    <Switch
                      checked={profile?.safety_mode}
                      onCheckedChange={(checked) => updateProfile({ safety_mode: checked })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg">Age Category</Label>
                    <Select
                      value={profile?.age_category}
                      onValueChange={(value) => updateProfile({ age_category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_16">Under 16</SelectItem>
                        <SelectItem value="age_16_18">Age 16-18</SelectItem>
                        <SelectItem value="age_18_plus">Age 18+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <Label className="text-lg">Interpreter Mode</Label>
                      <p className="text-sm text-gray-600">AI translation specialist</p>
                    </div>
                    <Switch
                      checked={profile?.interpreter_mode}
                      onCheckedChange={(checked) => updateProfile({ interpreter_mode: checked })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-6 mt-6">
                   <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-amber-900">Features & Tracking</h3>

                     <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                       <div>
                         <Label className="text-lg">Mood Tracking</Label>
                         <p className="text-sm text-gray-600">Oracle adapts responses based on your mood</p>
                       </div>
                       <Switch
                         checked={profile?.mood_tracking_enabled}
                         onCheckedChange={(checked) => updateProfile({ mood_tracking_enabled: checked })}
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                       <div>
                         <Label className="text-lg">Reminders & Alarms</Label>
                         <p className="text-sm text-gray-600">Set and receive reminders</p>
                       </div>
                       <Switch
                         checked={profile?.reminders_enabled}
                         onCheckedChange={(checked) => updateProfile({ reminders_enabled: checked })}
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                       <div>
                         <Label className="text-lg">Calendar & Events</Label>
                         <p className="text-sm text-gray-600">Manage events and schedules</p>
                       </div>
                       <Switch
                         checked={profile?.calendar_enabled}
                         onCheckedChange={(checked) => updateProfile({ calendar_enabled: checked })}
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                       <div>
                         <Label className="text-lg">News & Weather</Label>
                         <p className="text-sm text-gray-600">Daily news and weather summaries</p>
                       </div>
                       <Switch
                         checked={profile?.news_enabled && profile?.weather_enabled}
                         onCheckedChange={(checked) => updateProfile({ news_enabled: checked, weather_enabled: checked })}
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                       <div>
                         <Label className="text-lg">Mental Health Check-in</Label>
                         <p className="text-sm text-gray-600">Periodic mental wellness support</p>
                       </div>
                       <Switch
                         checked={profile?.mental_health_check_in}
                         onCheckedChange={(checked) => updateProfile({ mental_health_check_in: checked })}
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                       <div>
                         <Label className="text-lg">Motivational Support</Label>
                         <p className="text-sm text-gray-600">Daily motivation and affirmations</p>
                       </div>
                       <Switch
                         checked={profile?.motivational_enabled}
                         onCheckedChange={(checked) => updateProfile({ motivational_enabled: checked })}
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                       <div>
                         <Label className="text-lg">Crisis Support</Label>
                         <p className="text-sm text-gray-600">Emergency support resources</p>
                       </div>
                       <Switch
                         checked={profile?.crisis_support_enabled}
                         onCheckedChange={(checked) => updateProfile({ crisis_support_enabled: checked })}
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                       <div>
                         <Label className="text-lg">Conversation Logging</Label>
                         <p className="text-sm text-gray-600">Save and search chat history</p>
                       </div>
                       <Switch
                         checked={profile?.log_conversations}
                         onCheckedChange={(checked) => updateProfile({ log_conversations: checked })}
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                       <div>
                         <Label className="text-lg">Auto-Generate Chat Titles</Label>
                         <p className="text-sm text-gray-600">Automatically name conversations</p>
                       </div>
                       <Switch
                         checked={profile?.auto_generate_chat_titles}
                         onCheckedChange={(checked) => updateProfile({ auto_generate_chat_titles: checked })}
                       />
                     </div>
                   </div>
                 </TabsContent>

                <TabsContent value="account" className="space-y-6 mt-6">
                   <div className="p-4 bg-amber-50 rounded-lg space-y-2">
                     <div className="flex justify-between">
                       <span className="font-medium">Name:</span>
                       <span>{user?.full_name}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Email:</span>
                       <span>{user?.email}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Role:</span>
                       <span className="capitalize">{user?.role}</span>
                     </div>
                   </div>
                 </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </OracleBackground>
  );
}