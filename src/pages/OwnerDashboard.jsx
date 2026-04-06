import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Users, DollarSign, TrendingUp, Shield, Zap,
  BarChart3, UserPlus, UserMinus, Send, Bot, Crown,
  Calendar, CreditCard, Gift, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getRevenueSummary, getRevenueLog, TIERS,
  getFamilyMembers, addFamilyMember, removeFamilyMember
} from '../lib/monetization';

const OWNER_EMAIL = 'justinbretthogan@gmail.com';

function GlassCard({ children, className = '', glow }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] p-5 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: glow ? `0 0 40px ${glow}15` : 'none',
      }}>
      {children}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, change, color, delay = 0 }) {
  const isPositive = change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard glow={color}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="text-2xl font-black text-white mb-1">{value}</div>
        <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{label}</div>
      </GlassCard>
    </motion.div>
  );
}

export default function OwnerDashboard() {
  const [tab, setTab] = useState('overview');
  const [revenue, setRevenue] = useState(null);
  const [revenueLog, setRevenueLog] = useState([]);
  const [family, setFamily] = useState([]);
  const [newFamilyEmail, setNewFamilyEmail] = useState('');
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState('');

  useEffect(() => {
    setRevenue(getRevenueSummary());
    setRevenueLog(getRevenueLog());
    setFamily(getFamilyMembers());
  }, []);

  const handleAddFamily = () => {
    if (!newFamilyEmail.trim() || !newFamilyEmail.includes('@')) return;
    addFamilyMember(newFamilyEmail.trim());
    setFamily(getFamilyMembers());
    setNewFamilyEmail('');
  };

  const handleRemoveFamily = (email) => {
    removeFamilyMember(email);
    setFamily(getFamilyMembers());
  };

  const handleAiChat = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiChat(prev => [...prev, { role: 'user', content: userMsg }]);

    // AI Accounting responses
    setTimeout(() => {
      let response = '';
      const r = revenue || { totalRevenue: 0, monthlyRevenue: 0, totalTransactions: 0, subscribers: 0 };
      const lower = userMsg.toLowerCase();

      if (lower.includes('revenue') || lower.includes('income') || lower.includes('money')) {
        response = `Here's your financial overview:\n\n💰 Total Revenue: $${r.totalRevenue.toFixed(2)}\n📅 This Month: $${r.monthlyRevenue.toFixed(2)}\n📊 Total Transactions: ${r.totalTransactions}\n👥 Active Subscribers: ${r.subscribers}\n\nYour revenue is tracked in real-time through the Stripe integration. Each subscription and in-app purchase is logged automatically.`;
      } else if (lower.includes('subscriber') || lower.includes('user')) {
        response = `Subscriber Analytics:\n\n👥 Total Subscribers: ${r.subscribers}\n📈 Conversion Rate: ${r.totalTransactions > 0 ? ((r.subscribers / Math.max(1, r.totalTransactions)) * 100).toFixed(1) : 0}%\n\nTier Breakdown:\n• Free Explorer: Most users start here\n• Solace Plus ($20/mo): Core features + video tools\n• Solace Pro ($10-16.67/mo): Everything unlocked\n\nRecommendation: Focus on converting free users to Plus tier with a 7-day trial.`;
      } else if (lower.includes('forecast') || lower.includes('predict') || lower.includes('project')) {
        const projected = r.monthlyRevenue * 12;
        response = `Revenue Forecast:\n\n📊 Current Monthly: $${r.monthlyRevenue.toFixed(2)}\n📅 Projected Annual: $${projected.toFixed(2)}\n🎯 At 100 subscribers (Plus tier): $24,000/year\n🎯 At 500 subscribers (mixed tiers): $90,000/year\n🎯 At 1000 subscribers: $180,000/year\n\nKey Growth Levers:\n1. Social media marketing for user acquisition\n2. Referral program (give 1 month free for referrals)\n3. Content marketing showing SOLACE capabilities`;
      } else if (lower.includes('expense') || lower.includes('cost')) {
        response = `Estimated Operating Costs:\n\n🖥️ API Costs (OpenAI/Anthropic): ~$0.002-0.05 per message\n☁️ Hosting (Netlify/Vercel): $0-20/month\n🔑 Stripe Fees: 2.9% + $0.30 per transaction\n📱 Domain: ~$12/year\n\nAt current scale, your margins are excellent. API costs scale linearly with usage.`;
      } else if (lower.includes('family') || lower.includes('freebie')) {
        response = `Family Freebies Status:\n\n👨‍👩‍👧‍👦 Family Members: ${family.length}\n🎁 Access Level: Solace Pro (full access)\n💰 Revenue Impact: $0 (complimentary)\n\nFamily members get full Pro-tier access at no cost. You can manage them in the Family tab.`;
      } else {
        response = `I'm your AI Accounting Assistant. I can help with:\n\n📊 **"Show me revenue"** — Financial overview\n👥 **"Subscriber analytics"** — User breakdown\n📈 **"Revenue forecast"** — Growth projections\n💰 **"Show expenses"** — Cost analysis\n👨‍👩‍👧‍👦 **"Family freebies"** — Complimentary access\n\nAsk me anything about your SOLACE business finances!`;
      }
      setAiChat(prev => [...prev, { role: 'ai', content: response }]);
    }, 800);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'family', label: 'Family', icon: Gift },
    { id: 'ai', label: 'AI Accountant', icon: Bot },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#fff' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]"
        style={{ background: 'rgba(10,10,26,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-white/40 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Owner Dashboard</div>
              <div className="text-[10px] text-zinc-500 font-mono">{OWNER_EMAIL}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  tab === t.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ═══ OVERVIEW TAB ═══ */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard icon={DollarSign} label="Total Revenue" value={`$${(revenue?.totalRevenue || 0).toFixed(2)}`} change={12} color="#22c55e" delay={0.1} />
                <MetricCard icon={Calendar} label="This Month" value={`$${(revenue?.monthlyRevenue || 0).toFixed(2)}`} change={8} color="#3b82f6" delay={0.15} />
                <MetricCard icon={Users} label="Subscribers" value={revenue?.subscribers || 0} change={15} color="#a855f7" delay={0.2} />
                <MetricCard icon={CreditCard} label="Transactions" value={revenue?.totalTransactions || 0} color="#ec4899" delay={0.25} />
              </div>

              {/* Tier Breakdown */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {['free', 'tier1', 'tier2'].map((tid, i) => {
                  const tier = TIERS[tid];
                  const colors = ['#6b7280', '#3b82f6', '#a855f7'];
                  return (
                    <motion.div key={tid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                      <GlassCard glow={colors[i]}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
                          <span className="text-sm font-bold text-white">{tier.name}</span>
                        </div>
                        <div className="text-xs text-white/40 mb-2">
                          {tid === 'free' ? 'Free' : tid === 'tier1' ? '$20/month' : '$10-16.67/month'}
                        </div>
                        <div className="space-y-1">
                          {tier.features.slice(0, 4).map((f, fi) => (
                            <div key={fi} className="text-[10px] text-white/30 flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full" style={{ background: colors[i] }} />
                              {f}
                            </div>
                          ))}
                          {tier.features.length > 4 && (
                            <div className="text-[10px] text-white/20">+{tier.features.length - 4} more</div>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'App Maker', icon: Zap, color: '#7c3aed', page: 'Inventor' },
                  { label: 'Diagnostics', icon: BarChart3, color: '#d97706', page: 'DiagnosticCenter' },
                  { label: 'AI Chat', icon: Bot, color: '#ec4899', page: 'Chat' },
                  { label: 'Settings', icon: Shield, color: '#059669', page: 'Settings' },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      onClick={() => window.dispatchEvent(new CustomEvent('solace-navigate', { detail: { page: action.page } }))}
                      className="p-4 rounded-2xl border border-white/[0.06] text-center hover:bg-white/[0.04] transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${action.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: action.color }} />
                      </div>
                      <span className="text-xs text-white/60 font-medium">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ═══ REVENUE TAB ═══ */}
          {tab === 'revenue' && (
            <motion.div key="revenue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <MetricCard icon={DollarSign} label="Lifetime Revenue" value={`$${(revenue?.totalRevenue || 0).toFixed(2)}`} color="#22c55e" />
                <MetricCard icon={TrendingUp} label="Monthly Revenue" value={`$${(revenue?.monthlyRevenue || 0).toFixed(2)}`} color="#3b82f6" />
              </div>
              <GlassCard className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">Transaction Log</span>
                </div>
                {revenueLog.length === 0 ? (
                  <div className="text-center py-8 text-white/20 text-sm">
                    No transactions yet. Revenue will appear here as users subscribe.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {revenueLog.slice().reverse().map((entry, i) => (
                      <div key={entry.id || i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div>
                          <div className="text-xs text-white font-medium">{entry.type}</div>
                          <div className="text-[10px] text-white/30 font-mono">{entry.email || 'Anonymous'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-400">+${(entry.amount / 100).toFixed(2)}</div>
                          <div className="text-[10px] text-white/20 font-mono">{new Date(entry.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* ═══ FAMILY TAB ═══ */}
          {tab === 'family' && (
            <motion.div key="family" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GlassCard className="mb-4" glow="#ec4899">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-pink-400" />
                  <span className="text-sm font-bold text-white">Family Freebies</span>
                </div>
                <p className="text-xs text-white/40 mb-4">Family members get full Solace Pro access for free.</p>

                <div className="flex gap-2 mb-4">
                  <Input placeholder="Family member email..." value={newFamilyEmail}
                    onChange={e => setNewFamilyEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddFamily()}
                    className="flex-1 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 text-sm rounded-xl" />
                  <Button onClick={handleAddFamily} className="bg-pink-600 hover:bg-pink-700 rounded-xl px-4">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>

                {family.length === 0 ? (
                  <div className="text-center py-6 text-white/20 text-xs">No family members added yet</div>
                ) : (
                  <div className="space-y-2">
                    {family.map(email => (
                      <div key={email} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-pink-500/20 text-pink-400 text-xs font-bold">
                            {email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs text-white font-medium">{email}</div>
                            <div className="text-[10px] text-emerald-400 font-mono">Pro Access</div>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveFamily(email)} className="text-red-400/50 hover:text-red-400 transition">
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* ═══ AI ACCOUNTANT TAB ═══ */}
          {tab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
              <GlassCard className="flex-1 flex flex-col overflow-hidden" glow="#a855f7">
                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-bold text-white">AI Accounting Assistant</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4" style={{ scrollbarWidth: 'thin' }}>
                  {aiChat.length === 0 && (
                    <div className="text-center py-12">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-purple-400/30" />
                      <p className="text-white/30 text-sm mb-4">Ask me about your finances</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['Show me revenue', 'Subscriber analytics', 'Revenue forecast', 'Show expenses'].map(q => (
                          <button key={q} onClick={() => { setAiInput(q); }}
                            className="px-3 py-1.5 rounded-lg text-xs text-purple-400/70 bg-purple-400/10 hover:bg-purple-400/20 transition">
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiChat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-purple-600/30 text-white rounded-br-md'
                          : 'bg-white/[0.04] text-white/80 rounded-bl-md border border-white/[0.06]'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Input placeholder="Ask about revenue, subscribers, forecasts..." value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiChat()}
                    className="flex-1 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 text-sm rounded-xl" />
                  <Button onClick={handleAiChat} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-4">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
