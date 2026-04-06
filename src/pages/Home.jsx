import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, MessageSquare, Zap, Languages, Settings, Shield, Trophy, Users, LogOut,
  BrainCircuit, Film, Mic2, Camera, Image, Wrench, Hammer, Lightbulb, UserCircle,
  Heart, Brain, Briefcase, Home as HomeIcon, Globe, ShoppingBag, Crown, BookOpen,
  Activity, Target, BarChart3, Star, Volume2, Palette
} from 'lucide-react';

const FAVORITES = [
  { label: 'Chat Oracle', desc: 'Your sovereign AI companion', page: 'Chat', icon: MessageSquare, bg: '#6d28d9' },
  { label: 'Specialists', desc: 'Browse AI specialist personas', page: 'AllSpecialists', icon: BrainCircuit, bg: '#059669' },
  { label: 'Voice Generator', desc: 'Human-quality voice synthesis', page: 'VoiceGenerator', icon: Volume2, bg: '#2563eb' },
];

const ALL_TOOLS = [
  { label: 'Chat Oracle', page: 'Chat', icon: MessageSquare, bg: '#7c3aed' },
  { label: 'Specialists', page: 'AllSpecialists', icon: BrainCircuit, bg: '#059669' },
  { label: 'Voice Generator', page: 'VoiceGenerator', icon: Mic2, bg: '#2563eb' },
  { label: 'Movie Maker', page: 'MovieMaker', icon: Film, bg: '#7c3aed' },
  { label: 'Media Gallery', page: 'MediaLibrary', icon: Image, bg: '#0891b2' },
  { label: 'Luma Video Editor', page: 'VideoEditor', icon: Sparkles, bg: '#7c3aed' },
  { label: 'Media Library', page: 'MediaLibrary', icon: BookOpen, bg: '#0891b2' },
  { label: 'Live Vision', page: 'LiveVision', icon: Camera, bg: '#7c3aed' },
  { label: 'Mechanic', page: 'Mechanic', icon: Wrench, bg: '#d97706' },
  { label: 'Builder', page: 'Builder', icon: Hammer, bg: '#d97706' },
  { label: 'Handyman', page: 'Handyman', icon: Zap, bg: '#d97706' },
  { label: 'Inventor', page: 'Inventor', icon: Lightbulb, bg: '#7c3aed' },
  { label: 'Avatar', page: 'AvatarCustomizer', icon: UserCircle, bg: '#7c3aed' },
  { label: 'Crisis Hub', page: 'CrisisHub', icon: Shield, bg: '#dc2626' },
  { label: 'Titan Heart', page: 'TitanHeart', icon: Heart, bg: '#db2777' },
  { label: 'Mind Hub', page: 'MindHub', icon: Brain, bg: '#7c3aed' },
  { label: 'Professional Hub', page: 'ProfessionalHub', icon: Briefcase, bg: '#7c3aed' },
  { label: 'Family Hub', page: 'FamilyHub', icon: HomeIcon, bg: '#d97706' },
  { label: 'Phygital World', page: 'PhygitalHub', icon: Globe, bg: '#0891b2' },
  { label: 'Sovereign Empire', page: 'SovereignEmpire', icon: Crown, bg: '#7c3aed' },
  { label: 'Sovereign Mall', page: 'SovereignMall', icon: ShoppingBag, bg: '#7c3aed' },
  { label: 'Tier System', page: 'TierSystem', icon: Star, bg: '#d97706' },
  { label: "Oracle's Council", page: 'OracleCouncil', icon: Users, bg: '#7c3aed' },
  { label: 'Empire Profile', page: 'EmpireProfile', icon: Trophy, bg: '#d97706' },
  { label: 'Training Center', page: 'OracleTrainingCenter', icon: Target, bg: '#0891b2' },
  { label: 'Community Hub', page: 'CommunityHub', icon: Users, bg: '#059669' },
  { label: 'Diagnostic Center', page: 'DiagnosticCenter', icon: Activity, bg: '#d97706' },
  { label: 'Marketing Hub', page: 'MarketingHub', icon: BarChart3, bg: '#7c3aed' },
  { label: 'Interpreter', page: 'Interpreter', icon: Languages, bg: '#0891b2' },
  { label: 'Wellness Center', page: 'WellnessCenter', icon: Sparkles, bg: '#059669' },
  { label: 'Dashboard', page: 'Dashboard', icon: BarChart3, bg: '#2563eb' },
  { label: 'Owner Dashboard', page: 'OwnerDashboard', icon: Shield, bg: '#d97706' },
  { label: 'Profile', page: 'Profile', icon: UserCircle, bg: '#db2777' },
  { label: 'Settings', page: 'Settings', icon: Settings, bg: '#059669' },
];

const nav = (page) => window.dispatchEvent(new CustomEvent('solace-navigate', { detail: { page } }));

export default function Home() {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const mem = JSON.parse(localStorage.getItem('solace_oracle_memory') || '{}');
      setUserName(mem?.profile?.name || 'User');
    } catch { setUserName('User'); }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-10 h-10 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a', color: '#fff' }}>
      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>S</div>
          <div>
            <div className="text-white font-bold text-base tracking-wide">SOLACE</div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-wider">COMMAND SURFACE</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white font-semibold">{userName}</div>
          <div className="text-[10px] text-zinc-500">justinbretthogan@gmail.com</div>
        </div>
      </header>

      <div className="px-6 pb-8 max-w-6xl mx-auto">
        {/* ── FAVORITES ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400/80 tracking-[0.2em] uppercase">Favourites</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FAVORITES.map((fav, i) => {
              const Icon = fav.icon;
              return (
                <motion.div key={fav.page}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => nav(fav.page)}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  whileHover={{ borderColor: 'rgba(255,255,255,0.15)' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: fav.bg }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{fav.label}</div>
                    <div className="text-xs text-zinc-500 truncate">{fav.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── ALL TOOLS ── */}
        <div>
          <div className="flex items-center justify-center mb-6">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="px-4 text-[11px] font-bold text-zinc-500 tracking-[0.25em] uppercase">All Tools</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {ALL_TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div key={`${tool.page}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.02 }}
                  onClick={() => nav(tool.page)}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <motion.div
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                    style={{ background: tool.bg, boxShadow: `0 4px 20px ${tool.bg}30` }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="text-[10px] text-zinc-400 text-center leading-tight font-medium group-hover:text-white transition max-w-[72px]">
                    {tool.label}
                  </span>
                </motion.div>
              );
            })}
            {/* Logout button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + ALL_TOOLS.length * 0.02 }}
              onClick={() => { window.location.href = '/'; }}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <motion.div
                whileHover={{ scale: 1.12, y: -4 }}
                whileTap={{ scale: 0.92 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: '#dc2626', boxShadow: '0 4px 20px rgba(220,38,38,0.3)' }}
              >
                <LogOut className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-[10px] text-zinc-400 text-center leading-tight font-medium group-hover:text-white transition">
                Logout
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}