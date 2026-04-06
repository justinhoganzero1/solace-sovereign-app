import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Search, Plus, ExternalLink, CreditCard,
  Shield, Zap, Check, AlertTriangle, Trash2,
  DollarSign, TrendingUp, Package, Globe, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  APP_CATALOG, APP_CATEGORIES, searchCatalog, getPriceWithFee,
  connectApp, disconnectApp, getActiveApps, getConnectedApps,
  getAppTransactions, getTransactionSummary,
  ADMIN_FEE_PERCENT,
} from '../lib/appIntegration';

export default function AppStore() {
  const [tab, setTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [confirmDisconnect, setConfirmDisconnect] = useState(null);
  const [customApp, setCustomApp] = useState({ name: '', url: '', description: '', monthlyPrice: 0, paymentType: 'free' });
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const connectedApps = getActiveApps();
  const allConnected = getConnectedApps();
  const transactions = getAppTransactions();
  const summary = getTransactionSummary();
  const catalogResults = searchCatalog(search, category);
  const connectedNames = new Set(connectedApps.map(a => a.name));
  const fmt = (c) => c > 0 ? `$${(c / 100).toFixed(2)}` : 'Free';

  const doConnect = (app) => {
    connectApp({ name: app.name, url: app.url, category: app.category, description: app.description, icon: app.icon, monthlyPrice: app.monthlyPrice, paymentType: app.paymentType });
    refresh();
  };
  const doDisconnect = (id) => { disconnectApp(id); setConfirmDisconnect(null); refresh(); };
  const doCustom = () => {
    if (!customApp.name.trim()) return;
    connectApp({ ...customApp, icon: '🔧', category: 'custom', monthlyPrice: Math.round((parseFloat(customApp.monthlyPrice) || 0) * 100) });
    setCustomApp({ name: '', url: '', description: '', monthlyPrice: 0, paymentType: 'free' });
    setTab('connected'); refresh();
  };

  return (
    <div className="min-h-screen" style={{ background: '#06060f', color: '#fff' }}>
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]" style={{ background: 'rgba(6,6,15,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-white/40 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-lg font-black" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>App Integration Hub</h1>
            <p className="text-[10px] text-white/30 font-mono">CONNECT ANY APP • {ADMIN_FEE_PERCENT}% ADMIN FEE • AUTO BILLING</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">{connectedApps.length} connected</div>
      </header>

      <div className="flex gap-1 px-6 py-3 border-b border-white/[0.04]">
        {[{ id: 'browse', label: 'Browse', icon: Globe }, { id: 'connected', label: 'My Apps', icon: Package }, { id: 'billing', label: 'Billing', icon: CreditCard }, { id: 'custom', label: 'Custom', icon: Plus }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${tab === t.id ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-white/40 hover:text-white/60'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {tab === 'browse' && (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20 rounded-xl" />
              </div>
              <div className="flex gap-1.5 mb-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {APP_CATEGORIES.slice(0, 10).map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${category === c.id ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-white/[0.02] text-white/40'}`}>{c.emoji} {c.label}</button>
                ))}
              </div>
              <div className="mb-5 p-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.04]">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-amber-300 mb-1">How It Works</div>
                    <p className="text-xs text-white/40 leading-relaxed">Connect any app into SOLACE. Paid features get a {ADMIN_FEE_PERCENT}% admin fee — hey, my boss has to make money somehow, you know? 😄 The Oracle can then USE these apps on your behalf.</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catalogResults.map((app, i) => {
                  const connected = connectedNames.has(app.name);
                  const p = app.monthlyPrice > 0 ? getPriceWithFee(app.monthlyPrice) : null;
                  return (
                    <motion.div key={app.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-amber-500/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl">{app.icon}</div>
                          <div><div className="font-bold text-sm text-white">{app.name}</div><div className="text-[10px] text-white/30 capitalize">{app.category}</div></div>
                        </div>
                        {connected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-white/40 mb-3">{app.description}</p>
                      <div className="flex items-center justify-between">
                        {p ? (<div><span className="text-xs text-white/30 line-through mr-1">{fmt(p.base)}</span><span className="text-sm font-bold text-amber-400">{fmt(p.total)}</span><span className="text-[9px] text-white/20 ml-1">/mo</span></div>) : (<span className="text-xs text-emerald-400">Free</span>)}
                        {!connected ? (<Button size="sm" onClick={() => doConnect(app)} className="h-7 px-3 text-xs rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"><Plus className="w-3 h-3 mr-1" />Connect</Button>) : (<span className="text-[10px] text-emerald-400 font-mono">CONNECTED</span>)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {tab === 'connected' && (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {connectedApps.length === 0 ? (
                <div className="text-center py-16"><Package className="w-12 h-12 text-white/10 mx-auto mb-4" /><p className="text-white/30 text-sm mb-4">No apps connected yet</p><Button onClick={() => setTab('browse')} className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Browse Apps</Button></div>
              ) : (
                <div className="space-y-3">
                  {connectedApps.map(app => (
                    <div key={app.id} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl">{app.icon}</div>
                        <div>
                          <div className="font-bold text-sm text-white">{app.name}</div>
                          <div className="text-[10px] text-white/30">{app.category} • {app.paymentType === 'free' ? 'Free' : `${fmt(app.monthlyPrice)}/mo`} • Used {app.usageCount}x</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.url && <button onClick={() => window.open(app.url, '_blank')} className="p-2 rounded-lg text-white/20 hover:text-white/60"><ExternalLink className="w-4 h-4" /></button>}
                        <button onClick={() => setConfirmDisconnect(app.id)} className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {confirmDisconnect && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0d0d1a] max-w-sm w-full mx-4">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" /><h3 className="text-white font-bold mb-2">Disconnect App?</h3><p className="text-white/40 text-sm mb-4">This stops billing and removes access. Reconnect anytime.</p>
                    <div className="flex gap-2"><Button onClick={() => setConfirmDisconnect(null)} className="flex-1 bg-white/[0.04] text-white/60">Cancel</Button><Button onClick={() => doDisconnect(confirmDisconnect)} className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30">Disconnect</Button></div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'billing' && (
            <motion.div key="bi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[{ l: 'Total Volume', v: fmt(summary.totalVolume), c: '#f59e0b', I: DollarSign }, { l: 'Admin Fees', v: fmt(summary.totalAdminFees), c: '#22c55e', I: TrendingUp }, { l: 'Paid to Apps', v: fmt(summary.totalAppPayouts), c: '#3b82f6', I: Package }, { l: 'Transactions', v: summary.totalTransactions, c: '#a855f7', I: CreditCard }].map(s => (
                  <div key={s.l} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"><div className="flex items-center gap-2 mb-2"><s.I className="w-4 h-4" style={{ color: s.c }} /><span className="text-[10px] text-white/30 font-mono uppercase">{s.l}</span></div><div className="text-xl font-black" style={{ color: s.c }}>{s.v}</div></div>
                ))}
              </div>
              <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.03] mb-6">
                <div className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-amber-400" /><span className="text-sm font-bold text-amber-300">Payment Split</span></div>
                <div className="flex items-center gap-4"><div className="flex-1 h-3 rounded-full overflow-hidden bg-white/[0.04] flex"><div className="h-full bg-amber-500" style={{ width: `${ADMIN_FEE_PERCENT}%` }} /><div className="h-full bg-blue-500" style={{ width: `${100 - ADMIN_FEE_PERCENT}%` }} /></div><div className="flex gap-3 text-[10px]"><span className="text-amber-400">■ SOLACE {ADMIN_FEE_PERCENT}%</span><span className="text-blue-400">■ App {100 - ADMIN_FEE_PERCENT}%</span></div></div>
              </div>
              <div className="text-sm font-bold text-white/60 mb-3">Transaction History</div>
              {transactions.length === 0 ? <div className="text-center py-8 text-white/20 text-sm">No transactions yet</div> : (
                <div className="space-y-2">{transactions.slice().reverse().slice(0, 50).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div><div className="text-xs font-medium text-white/80">{t.description}</div><div className="text-[10px] text-white/30">{new Date(t.timestamp).toLocaleString()}</div></div>
                    <div className="text-right">{t.totalAmount > 0 ? (<><div className="text-sm font-bold text-amber-400">{fmt(t.totalAmount)}</div><div className="text-[9px] text-white/20">Fee: {fmt(t.adminFee)} • App: {fmt(t.appPayout)}</div></>) : <span className="text-xs text-white/30">{t.type}</span>}</div>
                  </div>
                ))}</div>
              )}
            </motion.div>
          )}

          {tab === 'custom' && (
            <motion.div key="cu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3"><Zap className="w-8 h-8 text-amber-400" /></div>
                  <h2 className="text-lg font-bold text-white mb-1">Connect Custom App</h2>
                  <p className="text-xs text-white/30">Add any web app or API to your SOLACE ecosystem</p>
                </div>
                <div className="space-y-4">
                  <div><label className="text-[10px] text-white/40 font-mono uppercase mb-1 block">App Name *</label><Input value={customApp.name} onChange={e => setCustomApp(p => ({ ...p, name: e.target.value }))} placeholder="My Custom API" className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl" /></div>
                  <div><label className="text-[10px] text-white/40 font-mono uppercase mb-1 block">URL</label><Input value={customApp.url} onChange={e => setCustomApp(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl" /></div>
                  <div><label className="text-[10px] text-white/40 font-mono uppercase mb-1 block">Description</label><Input value={customApp.description} onChange={e => setCustomApp(p => ({ ...p, description: e.target.value }))} placeholder="What does this app do?" className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] text-white/40 font-mono uppercase mb-1 block">Monthly Price ($)</label><Input type="number" step="0.01" value={customApp.monthlyPrice} onChange={e => setCustomApp(p => ({ ...p, monthlyPrice: e.target.value }))} className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl" /></div>
                    <div><label className="text-[10px] text-white/40 font-mono uppercase mb-1 block">Type</label><select value={customApp.paymentType} onChange={e => setCustomApp(p => ({ ...p, paymentType: e.target.value }))} className="w-full h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm px-3"><option value="free">Free</option><option value="subscription">Subscription</option><option value="one_time">One-time</option><option value="usage">Per-use</option></select></div>
                  </div>
                  <Button onClick={doCustom} disabled={!customApp.name.trim()} className="w-full h-11 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}><Plus className="w-4 h-4 mr-2" />Connect Custom App</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
