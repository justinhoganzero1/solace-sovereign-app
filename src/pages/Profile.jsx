import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, User, Shield, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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
          safety_mode: true,
          auto_play_voice: false,
          voice_pitch: 1.0,
          voice_rate: 1.0
        });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    setSaving(true);
    try {
      const updated = await base44.entities.UserProfile.update(profile.id, updates);
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const P = {
    page: { minHeight: '100vh', background: '#000', color: '#e2e8f0' },
    hdr: { padding: '16px 24px', borderBottom: '1px solid rgba(139,92,246,0.12)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 },
    section: { background: 'rgba(6,6,16,0.85)', border: '1px solid rgba(139,92,246,0.08)', borderRadius: '18px', padding: '24px', marginBottom: '16px' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderRadius: '14px', background: 'rgba(10,10,25,0.6)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '10px' },
    label: { fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '8px' },
    genderBtn: (active) => ({ flex: 1, padding: '18px 12px', borderRadius: '14px', border: `2px solid ${active ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`, background: active ? 'rgba(139,92,246,0.12)' : 'rgba(6,6,16,0.5)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s' }),
  };

  if (loading) {
    return (
      <div style={{ ...P.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#8b5cf6', fontSize: '0.9rem', fontFamily: 'monospace' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={P.page}>
      <div style={P.hdr}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Profile</div>
            <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>IDENTITY • PREFERENCES • PRIVACY</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 20px 120px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Account Info */}
          <div style={P.section}>
            <div style={{ ...P.label, color: '#8b5cf6' }}>ACCOUNT</div>
            <div style={P.row}><span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Name</span><span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}>{user?.full_name}</span></div>
            <div style={P.row}><span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Email</span><span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}>{user?.email}</span></div>
            <div style={P.row}><span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Role</span><span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{user?.role}</span></div>
          </div>

          {/* Preferences */}
          <div style={P.section}>
            <div style={{ ...P.label, color: '#a855f7' }}>PREFERENCES</div>
            <div style={{ ...P.label, color: '#c4b5fd', marginTop: '8px' }}>ORACLE GENDER</div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div style={P.genderBtn(profile?.oracle_gender === 'female')} onClick={() => !saving && updateProfile({ oracle_gender: 'female' })}>
                <div style={{ fontSize: '2rem', marginBottom: '4px' }}>👩</div>
                <div style={{ color: profile?.oracle_gender === 'female' ? '#c4b5fd' : '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>Female</div>
              </div>
              <div style={P.genderBtn(profile?.oracle_gender === 'male')} onClick={() => !saving && updateProfile({ oracle_gender: 'male' })}>
                <div style={{ fontSize: '2rem', marginBottom: '4px' }}>👨</div>
                <div style={{ color: profile?.oracle_gender === 'male' ? '#c4b5fd' : '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>Male</div>
              </div>
            </div>

            <div style={{ ...P.label, color: '#c4b5fd' }}>LANGUAGE</div>
            <div style={{ marginBottom: '16px' }}>
              <Select value={profile?.language || 'en'} onValueChange={(v) => updateProfile({ language: v })} disabled={saving}>
                <SelectTrigger style={{ background: 'rgba(10,10,25,0.7)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '12px', color: '#c4b5fd' }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],['pt','Portuguese'],['ru','Russian'],['zh','Chinese'],['ja','Japanese'],['ar','Arabic']].map(([c,n]) => <SelectItem key={c} value={c}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div style={{ ...P.label, color: '#c4b5fd' }}>TIER</div>
            <div style={{ marginBottom: '16px' }}>
              <Select value={profile?.tier_level || 'free'} onValueChange={(v) => updateProfile({ tier_level: v })} disabled={saving}>
                <SelectTrigger style={{ background: 'rgba(10,10,25,0.7)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '12px', color: '#c4b5fd' }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[['free','Free'],['basic','Basic'],['premium','Premium'],['enterprise','Enterprise']].map(([c,n]) => <SelectItem key={c} value={c}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div style={P.row}>
              <div><div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}>Auto-Play Voice</div><div style={{ color: '#475569', fontSize: '0.72rem' }}>Speak responses automatically</div></div>
              <Switch checked={profile?.auto_play_voice || false} onCheckedChange={(c) => updateProfile({ auto_play_voice: c })} disabled={saving} />
            </div>
          </div>

          {/* Safety */}
          <div style={{ ...P.section, borderColor: 'rgba(34,197,94,0.08)' }}>
            <div style={{ ...P.label, color: '#22c55e' }}>SAFETY & PRIVACY</div>
            <div style={P.row}>
              <div><div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}>Safety Guardian</div><div style={{ color: '#475569', fontSize: '0.72rem' }}>Enhanced content filtering</div></div>
              <Switch checked={profile?.safety_mode || true} onCheckedChange={(c) => updateProfile({ safety_mode: c })} disabled={saving} />
            </div>

            <div style={{ ...P.label, color: '#4ade80', marginTop: '12px' }}>AGE CATEGORY</div>
            <div style={{ marginBottom: '16px' }}>
              <Select value={profile?.age_category || ''} onValueChange={(v) => updateProfile({ age_category: v })} disabled={saving}>
                <SelectTrigger style={{ background: 'rgba(10,10,25,0.7)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '12px', color: '#86efac' }}><SelectValue placeholder="Select age category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_16">Under 16</SelectItem>
                  <SelectItem value="age_16_18">Age 16-18</SelectItem>
                  <SelectItem value="age_18_plus">Age 18+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div style={P.row}>
              <div><div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}>Interpreter Mode</div><div style={{ color: '#475569', fontSize: '0.72rem' }}>AI translation features</div></div>
              <Switch checked={profile?.interpreter_mode || false} onCheckedChange={(c) => updateProfile({ interpreter_mode: c })} disabled={saving} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}