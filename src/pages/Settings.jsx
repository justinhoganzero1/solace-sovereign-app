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

  const sty = {
    page: { minHeight: '100vh', background: '#000', color: '#e2e8f0' },
    header: { padding: '20px 24px', borderBottom: '1px solid rgba(139,92,246,0.1)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 },
    title: { fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    section: { background: 'rgba(6,6,16,0.8)', border: '1px solid rgba(139,92,246,0.08)', borderRadius: '18px', padding: '24px', marginBottom: '16px', backdropFilter: 'blur(12px)' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '14px', background: 'rgba(10,10,25,0.6)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '8px' },
    label: { color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' },
    desc: { color: '#64748b', fontSize: '0.75rem' },
    genderBtn: (active) => ({ flex: 1, height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: `2px solid ${active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.06)'}`, background: active ? 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.1))' : 'rgba(6,6,16,0.6)', cursor: 'pointer', transition: 'all 0.25s', boxShadow: active ? '0 0 20px rgba(139,92,246,0.2)' : 'none' }),
  };

  const SettingRow = ({ icon, color, label, desc, children }) => (
    <div style={{ ...sty.row, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{icon}</div>
        <div><div style={sty.label}>{label}</div><div style={sty.desc}>{desc}</div></div>
      </div>
      {children}
    </div>
  );

  return (
    <div style={sty.page}>
      <div style={sty.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
          <div>
            <div style={sty.title}>SOLACE Settings</div>
            <div style={{ color: '#475569', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.08em' }}>SYSTEM CONFIGURATION PANEL</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 20px 120px' }}>
        <Tabs defaultValue="oracle" className="w-full">
          <TabsList className="grid w-full grid-cols-7" style={{ marginBottom: '24px' }}>
            <TabsTrigger value="oracle">🔮 Oracle</TabsTrigger>
            <TabsTrigger value="voice">🎙️ Voice</TabsTrigger>
            <TabsTrigger value="devices">📱 Devices</TabsTrigger>
            <TabsTrigger value="language">🌐 Lang</TabsTrigger>
            <TabsTrigger value="safety">🛡️ Safety</TabsTrigger>
            <TabsTrigger value="features">⚡ Features</TabsTrigger>
            <TabsTrigger value="account">👤 Account</TabsTrigger>
          </TabsList>

          <TabsContent value="oracle">
            <div style={sty.section}>
              <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '16px' }}>ORACLE PERSONALITY</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={sty.genderBtn(profile?.oracle_gender === 'female')} onClick={() => updateProfile({ oracle_gender: 'female' })}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>👩</div>
                  <div style={{ color: '#c4b5fd', fontWeight: 600, fontSize: '0.85rem' }}>Female Oracle</div>
                </div>
                <div style={sty.genderBtn(profile?.oracle_gender === 'male')} onClick={() => updateProfile({ oracle_gender: 'male' })}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>👨</div>
                  <div style={{ color: '#c4b5fd', fontWeight: 600, fontSize: '0.85rem' }}>Male Oracle</div>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '10px' }}>TIER LEVEL</div>
              <Select value={profile?.tier_level} onValueChange={(v) => updateProfile({ tier_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">🆓 Free</SelectItem>
                  <SelectItem value="basic">⭐ Basic</SelectItem>
                  <SelectItem value="premium">💎 Premium</SelectItem>
                  <SelectItem value="enterprise">🏢 Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="voice">
            <div style={sty.section}>
              <VoiceSelectorComponent initialSettings={voiceSettings} onVoiceChange={(s) => updateVoiceSettings(s)} />
            </div>
            <SettingRow icon="🔊" color="#a855f7" label="Auto-Play Voice" desc="Automatically play voice when Oracle responds">
              <Switch checked={voiceSettings?.auto_play} onCheckedChange={(c) => updateVoiceSettings({ auto_play: c })} />
            </SettingRow>
          </TabsContent>

          <TabsContent value="devices">
            <div style={sty.section}>
              <div style={{ fontSize: '0.7rem', color: '#22d3ee', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '16px' }}>WEARABLE DEVICES</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '16px', lineHeight: 1.5 }}>
                Connect your wearables to chat with Oracle via earbuds, track health with smartwatches, and sync fitness data.
              </div>
              {[
                { icon: '🎧', name: 'Bluetooth Earbuds', desc: 'Talk to Oracle hands-free via earbuds/headset', key: 'earbuds_connected', color: '#818cf8',
                  hint: 'Pair earbuds in your device Bluetooth settings first, then enable here to route Oracle voice through them.' },
                { icon: '⌚', name: 'Smartwatch', desc: 'Apple Watch, Galaxy Watch, Wear OS', key: 'smartwatch_connected', color: '#22d3ee',
                  hint: 'Syncs heart rate, steps, and notifications. Requires companion app on watch.' },
                { icon: '💪', name: 'Fitness Tracker', desc: 'Fitbit, Garmin, Whoop, Oura Ring', key: 'fitness_tracker_connected', color: '#34d399',
                  hint: 'Imports sleep, activity, HRV data for wellness insights.' },
                { icon: '🩺', name: 'Health Monitor', desc: 'Blood pressure, glucose, SpO2 devices', key: 'health_monitor_connected', color: '#f87171',
                  hint: 'Connect medical-grade devices for Oracle health tracking.' },
                { icon: '🎤', name: 'External Microphone', desc: 'USB/Bluetooth mic for voice clarity', key: 'external_mic_connected', color: '#fbbf24',
                  hint: 'Select your preferred mic in browser audio settings, then enable for Oracle voice input.' },
              ].map(device => {
                const connected = localStorage.getItem(`solace_device_${device.key}`) === 'true';
                return (
                  <div key={device.key} style={{ ...sty.row, borderLeft: `3px solid ${device.color}`, flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${device.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{device.icon}</div>
                        <div>
                          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.88rem' }}>{device.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{device.desc}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {connected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />}
                        <Switch checked={connected} onCheckedChange={(c) => {
                          localStorage.setItem(`solace_device_${device.key}`, c ? 'true' : 'false');
                          toast.success(c ? `${device.name} connected` : `${device.name} disconnected`);
                          setProfile({...profile}); // force re-render
                        }} />
                      </div>
                    </div>
                    <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', color: '#475569', fontSize: '0.7rem', lineHeight: 1.4 }}>
                      {device.hint}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: '0.75rem', lineHeight: 1.5 }}>
                <strong>How it works:</strong> Connect earbuds/headset via your device's Bluetooth first. Oracle will use your system audio output for voice and your mic input for voice commands. For smartwatches and trackers, data syncs via Web Bluetooth API when available.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="language">
            <div style={sty.section}>
              <div style={{ fontSize: '0.7rem', color: '#22d3ee', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '12px' }}>PRIMARY LANGUAGE</div>
              <Select value={profile?.language} onValueChange={(v) => updateProfile({ language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[['en','🇺🇸 English'],['es','🇪🇸 Spanish'],['fr','🇫🇷 French'],['de','🇩🇪 German'],['it','🇮🇹 Italian'],['pt','🇧🇷 Portuguese'],['ru','🇷🇺 Russian'],['zh','🇨🇳 Chinese'],['ja','🇯🇵 Japanese'],['ar','🇸🇦 Arabic']].map(([v,l])=>(
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div style={{ fontSize: '0.7rem', color: '#22d3ee', fontFamily: 'monospace', letterSpacing: '0.1em', marginTop: '20px', marginBottom: '12px' }}>VOICE ACCENT</div>
              <Select value={profile?.voice_accent} onValueChange={(v) => updateProfile({ voice_accent: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[['neutral','🌐 Neutral'],['american','🇺🇸 American'],['british','🇬🇧 British'],['australian','🇦🇺 Australian'],['indian','🇮🇳 Indian']].map(([v,l])=>(
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.1)', color: '#67e8f9', fontSize: '0.72rem' }}>
                Voice integration requires ElevenLabs API setup
              </div>
            </div>
          </TabsContent>

          <TabsContent value="safety">
            <SettingRow icon="🛡️" color="#22c55e" label="Safety Guardian Mode" desc="Enhanced content filtering and monitoring">
              <Switch checked={profile?.safety_mode} onCheckedChange={(c) => updateProfile({ safety_mode: c })} />
            </SettingRow>
            <div style={sty.section}>
              <div style={{ fontSize: '0.7rem', color: '#22c55e', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '12px' }}>AGE CATEGORY</div>
              <Select value={profile?.age_category} onValueChange={(v) => updateProfile({ age_category: v })}>
                <SelectTrigger><SelectValue placeholder="Select age category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_16">Under 16</SelectItem>
                  <SelectItem value="age_16_18">Age 16-18</SelectItem>
                  <SelectItem value="age_18_plus">Age 18+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SettingRow icon="🌐" color="#3b82f6" label="Interpreter Mode" desc="AI translation specialist always active">
              <Switch checked={profile?.interpreter_mode} onCheckedChange={(c) => updateProfile({ interpreter_mode: c })} />
            </SettingRow>
          </TabsContent>

          <TabsContent value="features">
            <SettingRow icon="🎭" color="#818cf8" label="Mood Tracking" desc="Oracle adapts to your emotional state">
              <Switch checked={profile?.mood_tracking_enabled} onCheckedChange={(c) => updateProfile({ mood_tracking_enabled: c })} />
            </SettingRow>
            <SettingRow icon="⏰" color="#34d399" label="Reminders & Alarms" desc="Set and receive smart reminders">
              <Switch checked={profile?.reminders_enabled} onCheckedChange={(c) => updateProfile({ reminders_enabled: c })} />
            </SettingRow>
            <SettingRow icon="📅" color="#a78bfa" label="Calendar & Events" desc="Manage events and schedules">
              <Switch checked={profile?.calendar_enabled} onCheckedChange={(c) => updateProfile({ calendar_enabled: c })} />
            </SettingRow>
            <SettingRow icon="📰" color="#fbbf24" label="News & Weather" desc="Daily news and weather summaries">
              <Switch checked={profile?.news_enabled && profile?.weather_enabled} onCheckedChange={(c) => updateProfile({ news_enabled: c, weather_enabled: c })} />
            </SettingRow>
            <SettingRow icon="🧠" color="#f472b6" label="Mental Health Check-in" desc="Periodic mental wellness support">
              <Switch checked={profile?.mental_health_check_in} onCheckedChange={(c) => updateProfile({ mental_health_check_in: c })} />
            </SettingRow>
            <SettingRow icon="💪" color="#fb923c" label="Motivational Support" desc="Daily motivation and affirmations">
              <Switch checked={profile?.motivational_enabled} onCheckedChange={(c) => updateProfile({ motivational_enabled: c })} />
            </SettingRow>
            <SettingRow icon="🆘" color="#f87171" label="Crisis Support" desc="Emergency support resources">
              <Switch checked={profile?.crisis_support_enabled} onCheckedChange={(c) => updateProfile({ crisis_support_enabled: c })} />
            </SettingRow>
            <SettingRow icon="💬" color="#94a3b8" label="Conversation Logging" desc="Save and search chat history">
              <Switch checked={profile?.log_conversations} onCheckedChange={(c) => updateProfile({ log_conversations: c })} />
            </SettingRow>
            <SettingRow icon="✨" color="#c084fc" label="Auto-Generate Chat Titles" desc="Automatically name conversations">
              <Switch checked={profile?.auto_generate_chat_titles} onCheckedChange={(c) => updateProfile({ auto_generate_chat_titles: c })} />
            </SettingRow>
          </TabsContent>

          <TabsContent value="account">
            <div style={sty.section}>
              <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '16px' }}>ACCOUNT DETAILS</div>
              {[['Name', user?.full_name, '👤'],['Email', user?.email, '📧'],['Role', user?.role, '🔑']].map(([k,v,i]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', background: 'rgba(10,10,25,0.5)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{i} {k}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem', textTransform: k === 'Role' ? 'capitalize' : 'none' }}>{v || '—'}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}