import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Brain, Coffee, Moon, Target, TrendingUp, Clock, Play, Pause, Plus, Minus, Check, X, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

const todayKey = () => new Date().toISOString().split('T')[0];
const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

// ─── Ambient Sound Generator ───
const createAmbientSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    if (type === 'rain') {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      return { ctx, stop: () => { noise.stop(); ctx.close(); } };
    }
    if (type === 'ocean') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 100;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 50;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      const gain = ctx.createGain();
      gain.gain.value = 0.1;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      lfo.start();
      return { ctx, stop: () => { osc.stop(); lfo.stop(); ctx.close(); } };
    }
    if (type === 'forest') {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      return { ctx, stop: () => { noise.stop(); ctx.close(); } };
    }
    // white noise default
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    return { ctx, stop: () => { noise.stop(); ctx.close(); } };
  } catch { return null; }
};

const SOUNDSCAPES = [
  { id: 'rain', name: 'Rain', icon: '🌧️', color: '#3b82f6' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', color: '#06b6d4' },
  { id: 'forest', name: 'Forest', icon: '🌲', color: '#22c55e' },
  { id: 'white', name: 'White Noise', icon: '☁️', color: '#8b5cf6' },
];

const TABS = [
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'body-double', label: 'Body Double', icon: Coffee },
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'habits', label: 'Habits', icon: TrendingUp },
  { id: 'battery', label: 'Social', icon: Clock },
];

export default function MindHub() {
  const [tab, setTab] = useState('focus');

  // ─── Focus timer state ───
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusTime, setFocusTime] = useState(0);
  const [focusActive, setFocusActive] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);
  const focusRef = useRef(null);

  // ─── Body Double state ───
  const [bdActive, setBdActive] = useState(false);
  const [bdTask, setBdTask] = useState('');
  const [bdTimer, setBdTimer] = useState(0);
  const bdRef = useRef(null);

  // ─── Sleep soundscape state ───
  const [playingSound, setPlayingSound] = useState(null);
  const [sleepTimer, setSleepTimer] = useState(0);
  const soundRef = useRef(null);
  const sleepTimerRef = useRef(null);

  // ─── Habits state ───
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  // ─── Social battery state ───
  const [socialBattery, setSocialBattery] = useState(50);

  // Load saved data
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('mind_habits') || '[]');
      setHabits(h);
      const sessions = parseInt(localStorage.getItem('mind_focus_sessions') || '0');
      setFocusSessions(sessions);
      const bat = parseInt(localStorage.getItem('mind_social_battery') || '50');
      setSocialBattery(bat);
    } catch { /* ignore */ }
    return () => {
      if (soundRef.current) soundRef.current.stop();
    };
  }, []);

  // ─── Focus timer ───
  const startFocus = () => {
    setFocusTime(focusMinutes * 60);
    setFocusActive(true);
  };

  useEffect(() => {
    if (!focusActive) return;
    focusRef.current = setInterval(() => {
      setFocusTime(t => {
        if (t <= 1) {
          setFocusActive(false);
          clearInterval(focusRef.current);
          const next = focusSessions + 1;
          setFocusSessions(next);
          localStorage.setItem('mind_focus_sessions', String(next));
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.frequency.value = 660;
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(() => osc.stop(), 300);
          } catch { /* ignore */ }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(focusRef.current);
  }, [focusActive, focusSessions]);

  const stopFocus = () => { setFocusActive(false); clearInterval(focusRef.current); };

  // ─── Body Double timer ───
  const startBodyDouble = () => {
    if (!bdTask.trim()) return;
    setBdActive(true);
    setBdTimer(0);
  };

  useEffect(() => {
    if (!bdActive) return;
    bdRef.current = setInterval(() => setBdTimer(t => t + 1), 1000);
    return () => clearInterval(bdRef.current);
  }, [bdActive]);

  const stopBodyDouble = () => { setBdActive(false); clearInterval(bdRef.current); };

  // ─── Sleep soundscape ───
  const toggleSound = (soundId) => {
    if (playingSound === soundId) {
      if (soundRef.current) soundRef.current.stop();
      soundRef.current = null;
      setPlayingSound(null);
      return;
    }
    if (soundRef.current) soundRef.current.stop();
    const sound = createAmbientSound(soundId);
    soundRef.current = sound;
    setPlayingSound(soundId);
  };

  const startSleepTimer = (mins) => {
    setSleepTimer(mins * 60);
    clearInterval(sleepTimerRef.current);
    sleepTimerRef.current = setInterval(() => {
      setSleepTimer(t => {
        if (t <= 1) {
          clearInterval(sleepTimerRef.current);
          if (soundRef.current) { soundRef.current.stop(); soundRef.current = null; }
          setPlayingSound(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // ─── Habits ───
  const addHabit = () => {
    if (!newHabit.trim()) return;
    const updated = [...habits, { name: newHabit.trim(), id: Date.now(), streak: 0, doneToday: false, lastDone: null }];
    setHabits(updated);
    localStorage.setItem('mind_habits', JSON.stringify(updated));
    setNewHabit('');
  };

  const toggleHabit = (id) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      if (h.doneToday) return { ...h, doneToday: false, streak: Math.max(0, h.streak - 1) };
      return { ...h, doneToday: true, streak: h.streak + 1, lastDone: todayKey() };
    });
    setHabits(updated);
    localStorage.setItem('mind_habits', JSON.stringify(updated));
  };

  const removeHabit = (id) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    localStorage.setItem('mind_habits', JSON.stringify(updated));
  };

  // ─── Social battery ───
  const updateBattery = (delta) => {
    const next = Math.max(0, Math.min(100, socialBattery + delta));
    setSocialBattery(next);
    localStorage.setItem('mind_social_battery', String(next));
  };

  const batteryColor = socialBattery > 60 ? '#22c55e' : socialBattery > 30 ? '#f59e0b' : '#ef4444';
  const batteryLabel = socialBattery > 60 ? 'Energized' : socialBattery > 30 ? 'Managing' : 'Need Recharge';

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e2e8f0', padding: '0' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(99,102,241,0.12)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Brain size={24} style={{ color: '#818cf8' }} /></button>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#a78bfa,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mind Hub</div>
              <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>FOCUS • HABITS • MENTAL TOOLS</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px 120px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'rgba(6,6,16,0.6)', borderRadius: '14px', padding: '4px', border: '1px solid rgba(99,102,241,0.06)' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 4px', borderRadius: '11px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.25s', background: tab === t.id ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.15))' : 'transparent', color: tab === t.id ? '#a5b4fc' : '#475569', boxShadow: tab === t.id ? '0 0 16px rgba(99,102,241,0.15)' : 'none' }}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ═══ FOCUS TIMER ═══ */}
        {tab === 'focus' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Target className="w-10 h-10 text-orange-400 mx-auto mb-2" />
              <h2 className="text-white font-bold text-lg mb-1">Focus Timer</h2>
              <p className="text-white/40 text-xs mb-4">Pomodoro-style deep work sessions</p>

              {focusActive ? (
                <>
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" r="85" stroke="#ffffff10" strokeWidth="6" fill="none" />
                      <circle cx="96" cy="96" r="85" stroke="#f97316" strokeWidth="6" fill="none"
                        strokeDasharray={`${(focusTime / (focusMinutes * 60)) * 534} 534`}
                        strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white">{formatTime(focusTime)}</span>
                      <span className="text-white/30 text-xs">remaining</span>
                    </div>
                  </div>
                  <Button onClick={stopFocus} className="bg-white/10 border border-white/20 text-white/60">
                    <Pause className="w-4 h-4 mr-1" /> Stop
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {[15, 25, 45, 60].map(m => (
                      <button key={m} onClick={() => setFocusMinutes(m)}
                        className={`w-14 h-14 rounded-full text-sm font-bold transition-all ${focusMinutes === m ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                        {m}m
                      </button>
                    ))}
                  </div>
                  <Button onClick={startFocus} className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 h-12">
                    <Play className="w-4 h-4 mr-2" /> Start Focus
                  </Button>
                  <p className="text-white/20 text-xs mt-4">Sessions completed: {focusSessions}</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══ BODY DOUBLE ═══ */}
        {tab === 'body-double' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Coffee className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              <h2 className="text-white font-bold text-lg mb-1">ADHD Body Double</h2>
              <p className="text-white/40 text-xs mb-4">Oracle works alongside you silently — accountability without pressure</p>

              {bdActive ? (
                <>
                  <div className="bg-white/5 rounded-2xl p-6 mb-4">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Working on</p>
                    <p className="text-white font-bold text-lg mb-4">{bdTask}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm">Oracle is here with you</span>
                    </div>
                    <p className="text-white font-mono text-3xl mt-4">{formatTime(bdTimer)}</p>
                  </div>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 4, repeat: Infinity }}>
                    <p className="text-cyan-300/60 text-sm italic mb-4">You're doing great. Keep going.</p>
                  </motion.div>
                  <Button onClick={stopBodyDouble} className="bg-white/10 border border-white/20 text-white/60">
                    <Check className="w-4 h-4 mr-1" /> Done
                  </Button>
                </>
              ) : (
                <>
                  <Input value={bdTask} onChange={(e) => setBdTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && startBodyDouble()}
                    placeholder="What are you working on?"
                    className="bg-white/5 border-white/10 text-white mb-3 text-center" />
                  <Button onClick={startBodyDouble} disabled={!bdTask.trim()}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 h-12 disabled:opacity-30">
                    <Coffee className="w-4 h-4 mr-2" /> Start Session
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══ SLEEP SOUNDSCAPE ═══ */}
        {tab === 'sleep' && (
          <>
            <Card className="bg-white/5 border-white/10 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-white font-bold text-sm">Sleep Soundscapes</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SOUNDSCAPES.map(s => (
                    <motion.button key={s.id} whileTap={{ scale: 0.97 }} onClick={() => toggleSound(s.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${playingSound === s.id ? 'border-2' : 'border-white/10 bg-white/5'}`}
                      style={playingSound === s.id ? { borderColor: s.color, background: `${s.color}15` } : {}}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl mr-2">{s.icon}</span>
                          <span className="text-white text-sm font-bold">{s.name}</span>
                        </div>
                        {playingSound === s.id ? <Volume2 className="w-4 h-4" style={{ color: s.color }} /> : <VolumeX className="w-4 h-4 text-white/20" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {playingSound && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Auto-Stop Timer</h3>
                  <div className="flex gap-2">
                    {[15, 30, 60, 90].map(m => (
                      <Button key={m} onClick={() => startSleepTimer(m)}
                        className={`flex-1 ${sleepTimer > 0 && Math.ceil(sleepTimer / 60) <= m ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                        {m}m
                      </Button>
                    ))}
                  </div>
                  {sleepTimer > 0 && (
                    <p className="text-center text-white/40 text-sm mt-2">Auto-stop in {formatTime(sleepTimer)}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ═══ HABITS ═══ */}
        {tab === 'habits' && (
          <>
            <Card className="bg-white/5 border-white/10 mb-4">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input value={newHabit} onChange={(e) => setNewHabit(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                    placeholder="Add a daily habit..."
                    className="bg-white/5 border-white/10 text-white" />
                  <Button onClick={addHabit} className="bg-green-600 hover:bg-green-700 text-white px-4">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {habits.length > 0 ? (
              <div className="space-y-2">
                {habits.map(h => (
                  <motion.div key={h.id} layout className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <button onClick={() => toggleHabit(h.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${h.doneToday ? 'bg-green-500' : 'bg-white/10 border border-white/20'}`}>
                      {h.doneToday && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-sm font-bold ${h.doneToday ? 'text-green-300 line-through' : 'text-white'}`}>{h.name}</span>
                      {h.streak > 0 && <span className="ml-2 text-[10px] text-orange-400">{h.streak} day streak</span>}
                    </div>
                    <button onClick={() => removeHabit(h.id)} className="text-white/20 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/20">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Add habits to track daily</p>
              </div>
            )}
          </>
        )}

        {/* ═══ SOCIAL BATTERY ═══ */}
        {tab === 'battery' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Clock className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <h2 className="text-white font-bold text-lg mb-1">Social Battery</h2>
              <p className="text-white/40 text-xs mb-6">Track your social energy — know when to recharge</p>

              {/* Battery visualization */}
              <div className="w-32 h-56 mx-auto mb-6 rounded-2xl border-4 relative overflow-hidden" style={{ borderColor: batteryColor }}>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 transition-all"
                  animate={{ height: `${socialBattery}%` }}
                  style={{ backgroundColor: batteryColor + '60' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{socialBattery}%</span>
                  <span className="text-xs font-bold mt-1" style={{ color: batteryColor }}>{batteryLabel}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                <Button onClick={() => updateBattery(-10)} className="bg-red-600/30 border border-red-500/50 text-red-300">
                  <Minus className="w-4 h-4 mr-1" /> Drained
                </Button>
                <Button onClick={() => updateBattery(10)} className="bg-green-600/30 border border-green-500/50 text-green-300">
                  <Plus className="w-4 h-4 mr-1" /> Recharged
                </Button>
              </div>

              <div className="text-xs text-white/30 space-y-1">
                <p>Low battery? Cancel plans, take alone time, read, or meditate.</p>
                <p>Fully charged? Great time for socializing and group activities.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}