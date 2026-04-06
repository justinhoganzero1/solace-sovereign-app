import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OracleBackground from '../components/OracleBackground';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Languages, Shield, Brain, Heart, Briefcase, 
  BookOpen, Music, Film, Palette, Code, Sparkles,
  GraduationCap, Dumbbell, Utensils, Plane, Home, TrendingUp, Users
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAdmin(currentUser.role === 'admin');
      
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const specialists = [
    { name: 'Life Coach', icon: Heart, color: 'from-pink-500 to-rose-600' },
    { name: 'Therapist', icon: Brain, color: 'from-purple-500 to-violet-600' },
    { name: 'Business Coach', icon: Briefcase, color: 'from-green-500 to-emerald-600' },
    { name: 'Math Tutor', icon: GraduationCap, color: 'from-indigo-500 to-blue-600' },
    { name: 'Creative Writer', icon: BookOpen, color: 'from-orange-500 to-red-600' },
    { name: 'Music Guide', icon: Music, color: 'from-teal-500 to-cyan-600' },
    { name: 'Film Critic', icon: Film, color: 'from-slate-500 to-gray-600' },
    { name: 'Graphic Designer', icon: Palette, color: 'from-fuchsia-500 to-pink-600' },
    { name: 'Code Teacher', icon: Code, color: 'from-lime-500 to-green-600' },
    { name: 'Fitness Coach', icon: Dumbbell, color: 'from-red-500 to-orange-600' },
    { name: 'Nutrition Expert', icon: Utensils, color: 'from-emerald-500 to-teal-600' },
    { name: 'Travel Planner', icon: Plane, color: 'from-sky-500 to-blue-600' },
    { name: 'Interior Designer', icon: Home, color: 'from-amber-500 to-yellow-600' },
    { name: 'Financial Advisor', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { name: 'Language Teacher', icon: Languages, color: 'from-blue-500 to-purple-600' },
    { name: 'Parenting Coach', icon: Users, color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <OracleBackground gender={profile?.oracle_gender || 'female'}>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {isAdmin && (
            <Card className="mb-6 bg-gradient-to-r from-red-600 to-pink-600 border-none text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">ADMIN MODE ACTIVE</h2>
                    <p className="text-white/90">Zero restrictions • Full R-rated access • All features unlocked</p>
                  </div>
                  <Badge className="ml-auto bg-white text-red-600 text-lg px-4 py-2">UNRESTRICTED</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-2xl">Oracle Specialists</h1>
            <p className="text-xl text-yellow-200">Choose Your AI Companion</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 place-items-center">
            {/* Main Chat with Oracle Widget */}
            <div className="col-span-2 md:col-span-1" onClick={() => window.dispatchEvent(new CustomEvent('solace-navigate', { detail: { page: 'Chat' } }))}>
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 hover:from-yellow-300 hover:via-yellow-200 hover:to-orange-300 shadow-2xl flex flex-col items-center justify-center border-4 border-yellow-200/60 hover:border-yellow-100 transition-all hover:scale-110 cursor-pointer">
                <MessageSquare className="w-8 h-8 text-black mb-2" />
                <p className="text-black font-bold text-center text-sm">Chat Oracle</p>
              </div>
            </div>

            {/* Specialist Widgets */}
            {specialists.map((specialist) => (
              <div key={specialist.name} onClick={() => window.dispatchEvent(new CustomEvent('solace-navigate', { detail: { page: 'SpecialistChat', specialist: specialist.name } }))}>
                <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${specialist.color} shadow-xl flex flex-col items-center justify-center border-4 border-white/30 hover:border-white/60 transition-all hover:scale-110 cursor-pointer`}>
                  <specialist.icon className="w-8 h-8 text-white mb-2" />
                  <p className="text-white font-bold text-center text-xs leading-tight px-2">{specialist.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 text-lg" onClick={() => window.dispatchEvent(new CustomEvent('solace-navigate', { detail: { page: 'AllSpecialists' } }))}>
              <Sparkles className="w-5 h-5 mr-2" />
              View All 200+ Specialists
            </Button>
          </div>
        </div>
      </div>
    </OracleBackground>
  );
}