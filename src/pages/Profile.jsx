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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-black to-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="text-white mb-6 hover:bg-white/20" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-yellow-300/50 mb-6">
            <CardHeader>
              <CardTitle className="text-3xl text-amber-900 flex items-center">
                <User className="w-8 h-8 mr-3" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <span className="capitalize bg-blue-100 px-3 py-1 rounded">{user?.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-purple-300/50 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-900 flex items-center">
                <Palette className="w-6 h-6 mr-2" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-lg">Oracle Gender</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={profile?.oracle_gender === 'female' ? 'default' : 'outline'}
                    className="h-20"
                    onClick={() => updateProfile({ oracle_gender: 'female' })}
                    disabled={saving}
                  >
                    <div className="text-3xl mb-1">👩</div>
                    <div>Female</div>
                  </Button>
                  <Button
                    variant={profile?.oracle_gender === 'male' ? 'default' : 'outline'}
                    className="h-20"
                    onClick={() => updateProfile({ oracle_gender: 'male' })}
                    disabled={saving}
                  >
                    <div className="text-3xl mb-1">👨</div>
                    <div>Male</div>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Preferred Language</Label>
                <Select
                  value={profile?.language || 'en'}
                  onValueChange={(value) => updateProfile({ language: value })}
                  disabled={saving}
                >
                  <SelectTrigger className="bg-white">
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
                <Label className="text-lg">Tier Level</Label>
                <Select
                  value={profile?.tier_level || 'free'}
                  onValueChange={(value) => updateProfile({ tier_level: value })}
                  disabled={saving}
                >
                  <SelectTrigger className="bg-white">
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

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label className="text-lg">Auto-Play Voice</Label>
                  <p className="text-sm text-gray-600">Automatically play voice responses</p>
                </div>
                <Switch
                  checked={profile?.auto_play_voice || false}
                  onCheckedChange={(checked) => updateProfile({ auto_play_voice: checked })}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Safety Settings */}
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-green-300/50">
            <CardHeader>
              <CardTitle className="text-2xl text-green-900 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Safety & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <Label className="text-lg">Safety Guardian Mode</Label>
                  <p className="text-sm text-gray-600">Enhanced content filtering</p>
                </div>
                <Switch
                  checked={profile?.safety_mode || true}
                  onCheckedChange={(checked) => updateProfile({ safety_mode: checked })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Age Category</Label>
                <Select
                  value={profile?.age_category || ''}
                  onValueChange={(value) => updateProfile({ age_category: value })}
                  disabled={saving}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select age category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_16">Under 16</SelectItem>
                    <SelectItem value="age_16_18">Age 16-18</SelectItem>
                    <SelectItem value="age_18_plus">Age 18+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <Label className="text-lg">Interpreter Mode</Label>
                  <p className="text-sm text-gray-600">Enable AI translation features</p>
                </div>
                <Switch
                  checked={profile?.interpreter_mode || false}
                  onCheckedChange={(checked) => updateProfile({ interpreter_mode: checked })}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}