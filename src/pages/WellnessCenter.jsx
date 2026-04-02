import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Wind, Brain, Droplets, Smile, Plus, Minus, Check, Play, Pause, RotateCcw, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Breathing Patterns ───
const BREATHING_PATTERNS = [
  { name: 'Box Breathing', phases: [
    { label: 'Breathe In', duration: 4 },
    { label: 'Hold', duration: 4 },
    { label: 'Breathe Out', duration: 4 },
    { label: 'Hold', duration: 4 },
  ], cycles: 4, color: '#06b6d4', desc: 'Military stress relief technique' },
  { name: '4-7-8 Relaxation', phases: [
    { label: 'Breathe In', duration: 4 },
    { label: 'Hold', duration: 7 },
    { label: 'Breathe Out', duration: 8 },
  ], cycles: 4, color: '#8b5cf6', desc: 'Fall asleep faster' },
  { name: 'Calm Breath', phases: [
    { label: 'Breathe In', duration: 5 },
    { label: 'Breathe Out', duration: 5 },
  ], cycles: 6, color: '#10b981', desc: 'Simple calming exercise' },
  { name: 'Energizing', phases: [
    { label: 'Quick In', duration: 2 },
    { label: 'Quick Out', duration: 2 },
  ], cycles: 10, color: '#f59e0b', desc: 'Wake up & focus' },
];

const MOODS = [
  { id: 'great', label: 'Great', icon: '😄', color: '#22c55e' },
  { id: 'good', label: 'Good', icon: '🙂', color: '#84cc16' },
  { id: 'okay', label: 'Okay', icon: '😐', color: '#f59e0b' },
  { id: 'low', label: 'Low', icon: '😔', color: '#f97316' },
  { id: 'bad', label: 'Bad', icon: '😢', color: '#ef4444' },
];

const MEDITATION_PRESETS = [
  { name: 'Quick Reset', minutes: 2, color: '#06b6d4' },
  { name: 'Mindful Break', minutes: 5, color: '#8b5cf6' },
  { name: 'Deep Calm', minutes: 10, color: '#10b981' },
  { name: 'Full Session', minutes: 20, color: '#ec4899' },
];

const todayKey = () => new Date().toISOString().split('T')[0];

const formatTimer = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function WellnessCenter() {
  const [tab, setTab] = useState('breathe'); // breathe, mood, meditate, gratitude, water

  // ─── Breathing state ───
  const [breathingActive, setBreathingActive] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathCycle, setBreathCycle] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);
  const breathRef = useRef(null);

  // ─── Mood state ───
  const [moodLog, setMoodLog] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');

  // ─── Meditation state ───
  const [meditating, setMeditating] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0);
  const [meditationTarget, setMeditationTarget] = useState(0);
  const meditationRef = useRef(null);
  const _audioCtxRef = useRef(null);

  // ─── Gratitude state ───
  const [gratEntries, setGratEntries] = useState([]);
  const [gratInput, setGratInput] = useState('');

  // ─── Water state ───
  const [waterCount, setWaterCount] = useState(0);
  const waterGoal = 8;

  // Load saved data
  useEffect(() => {
    try {
      const moods = JSON.parse(localStorage.getItem('wellness_moods') || '[]');
      setMoodLog(moods);
      const todayEntry = moods.find(m => m.date === todayKey());
      if (todayEntry) setTodayMood(todayEntry.mood);

      const grats = JSON.parse(localStorage.getItem('wellness_gratitude') || '[]');
      setGratEntries(grats);

      const water = JSON.parse(localStorage.getItem('wellness_water') || '{}');
      if (water.date === todayKey()) setWaterCount(water.count || 0);
    } catch { /* ignore */ }
  }, []);

  // ─── Breathing logic ───
  const startBreathing = (pattern) => {
    setSelectedPattern(pattern);
    setBreathPhase(0);
    setBreathCycle(0);
    setBreathTimer(pattern.phases[0].duration);
    setBreathingActive(true);
  };

  useEffect(() => {
    if (!breathingActive || !selectedPattern) return;
    breathRef.current = setInterval(() => {
      setBreathTimer(t => {
        if (t <= 1) {
          // Move to next phase
          setBreathPhase(p => {
            const nextPhase = p + 1;
            if (nextPhase >= selectedPattern.phases.length) {
              // Next cycle
              setBreathCycle(c => {
                if (c + 1 >= selectedPattern.cycles) {
                  // Done
                  setBreathingActive(false);
                  clearInterval(breathRef.current);
                  return 0;
                }
                return c + 1;
              });
              setBreathTimer(selectedPattern.phases[0].duration);
              return 0;
            }
            setBreathTimer(selectedPattern.phases[nextPhase].duration);
            return selectedPattern.phases[nextPhase].duration;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(breathRef.current);
  }, [breathingActive, selectedPattern]);

  const stopBreathing = () => {
    setBreathingActive(false);
    clearInterval(breathRef.current);
  };

  // ─── Mood logic ───
  const logMood = (moodId) => {
    const entry = { mood: moodId, date: todayKey(), note: moodNote, time: new Date().toLocaleTimeString() };
    const updated = [entry, ...moodLog.filter(m => m.date !== todayKey())].slice(0, 60);
    setMoodLog(updated);
    setTodayMood(moodId);
    setMoodNote('');
    localStorage.setItem('wellness_moods', JSON.stringify(updated));
  };

  // ─── Meditation logic ───
  const startMeditation = (minutes) => {
    setMeditationTarget(minutes * 60);
    setMeditationTime(minutes * 60);
    setMeditating(true);
  };

  useEffect(() => {
    if (!meditating) return;
    meditationRef.current = setInterval(() => {
      setMeditationTime(t => {
        if (t <= 1) {
          setMeditating(false);
          clearInterval(meditationRef.current);
          // Play completion tone
          try {
            const AudioCtx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 528;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
            setTimeout(() => osc.stop(), 3000);
          } catch { /* ignore */ }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(meditationRef.current);
  }, [meditating]);

  const stopMeditation = () => {
    setMeditating(false);
    clearInterval(meditationRef.current);
  };

  // ─── Gratitude logic ───
  const addGratitude = () => {
    if (!gratInput.trim()) return;
    const entry = { text: gratInput.trim(), date: new Date().toISOString() };
    const updated = [entry, ...gratEntries].slice(0, 100);
    setGratEntries(updated);
    localStorage.setItem('wellness_gratitude', JSON.stringify(updated));
    setGratInput('');
  };

  // ─── Water logic ───
  const addWater = () => {
    const next = Math.min(waterCount + 1, 20);
    setWaterCount(next);
    localStorage.setItem('wellness_water', JSON.stringify({ date: todayKey(), count: next }));
  };
  const removeWater = () => {
    const next = Math.max(waterCount - 1, 0);
    setWaterCount(next);
    localStorage.setItem('wellness_water', JSON.stringify({ date: todayKey(), count: next }));
  };

  const TABS = [
    { id: 'breathe', label: 'Breathe', icon: Wind },
    { id: 'mood', label: 'Mood', icon: Smile },
    { id: 'meditate', label: 'Meditate', icon: Brain },
    { id: 'gratitude', label: 'Gratitude', icon: Heart },
    { id: 'water', label: 'Hydrate', icon: Droplets },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-7 h-7 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Wellness Center</h1>
            <p className="text-purple-300 text-sm">Mind, Body & Spirit</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all ${tab === t.id ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white/60'}`}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ═══ BREATHING TAB ═══ */}
        {tab === 'breathe' && (
          <>
            {breathingActive && selectedPattern ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{selectedPattern.name}</p>
                <p className="text-white/60 text-sm mb-6">Cycle {breathCycle + 1} of {selectedPattern.cycles}</p>

                {/* Animated breathing circle */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <motion.div
                    animate={{
                      scale: selectedPattern.phases[breathPhase]?.label.includes('In') ? [1, 1.4] :
                             selectedPattern.phases[breathPhase]?.label.includes('Out') ? [1.4, 1] : 1.2,
                    }}
                    transition={{ duration: selectedPattern.phases[breathPhase]?.duration || 4, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: `${selectedPattern.color}20`, border: `3px solid ${selectedPattern.color}` }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{breathTimer}</span>
                    <span className="text-sm font-bold mt-1" style={{ color: selectedPattern.color }}>
                      {selectedPattern.phases[breathPhase]?.label}
                    </span>
                  </div>
                </div>

                {/* Phase dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {selectedPattern.phases.map((p, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === breathPhase ? 'scale-125' : 'opacity-30'}`}
                      style={{ backgroundColor: selectedPattern.color }} />
                  ))}
                </div>

                <Button onClick={stopBreathing} className="bg-white/10 border border-white/20 text-white/60 hover:bg-white/20">
                  <X className="w-4 h-4 mr-1" /> Stop
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {BREATHING_PATTERNS.map((p) => (
                  <motion.button key={p.name} whileTap={{ scale: 0.98 }} onClick={() => startBreathing(p)}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-left transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-sm">{p.name}</div>
                        <div className="text-white/40 text-xs mt-1">{p.desc} • {p.cycles} cycles</div>
                        <div className="flex gap-1 mt-2">
                          {p.phases.map((ph, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${p.color}20`, color: p.color }}>
                              {ph.label} {ph.duration}s
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${p.color}20`, border: `1px solid ${p.color}50` }}>
                        <Play className="w-4 h-4" style={{ color: p.color }} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ MOOD TAB ═══ */}
        {tab === 'mood' && (
          <>
            <Card className="bg-white/5 border-white/10 mb-4">
              <CardContent className="p-4">
                <h3 className="text-white font-bold text-sm mb-3">How are you feeling today?</h3>
                <div className="flex gap-2 mb-3">
                  {MOODS.map(m => (
                    <motion.button key={m.id} whileTap={{ scale: 0.9 }}
                      onClick={() => logMood(m.id)}
                      className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${todayMood === m.id ? 'border-2' : 'border-white/10 bg-white/5'}`}
                      style={todayMood === m.id ? { borderColor: m.color, background: `${m.color}15` } : {}}>
                      <span className="text-2xl">{m.icon}</span>
                      <span className={`text-[10px] ${todayMood === m.id ? 'text-white' : 'text-white/40'}`}>{m.label}</span>
                    </motion.button>
                  ))}
                </div>
                <Input value={moodNote} onChange={(e) => setMoodNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && todayMood && logMood(todayMood)}
                  placeholder="Optional note about your day..."
                  className="bg-white/5 border-white/10 text-white text-sm" />
              </CardContent>
            </Card>

            {/* Mood history chart */}
            {moodLog.length > 0 && (
              <Card className="bg-white/5 border-white/10 mb-4">
                <CardContent className="p-4">
                  <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Last 14 Days</h3>
                  <div className="flex items-end gap-1 h-20">
                    {moodLog.slice(0, 14).reverse().map((entry, i) => {
                      const mood = MOODS.find(m => m.id === entry.mood);
                      const heights = { great: 100, good: 80, okay: 60, low: 40, bad: 20 };
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-t-sm transition-all"
                            style={{ height: `${heights[entry.mood] || 50}%`, backgroundColor: mood?.color + '80' }}
                            title={`${entry.date}: ${mood?.label}${entry.note ? ' — ' + entry.note : ''}`} />
                          <span className="text-[8px] text-white/20">{entry.date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent entries */}
            {moodLog.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white/40 text-xs uppercase tracking-wider">Recent Entries</h3>
                {moodLog.slice(0, 5).map((entry, i) => {
                  const mood = MOODS.find(m => m.id === entry.mood);
                  return (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <span className="text-lg">{mood?.icon}</span>
                      <div className="flex-1">
                        <div className="text-white text-xs font-bold">{mood?.label}</div>
                        {entry.note && <div className="text-white/40 text-xs">{entry.note}</div>}
                      </div>
                      <span className="text-white/20 text-[10px]">{entry.date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ MEDITATION TAB ═══ */}
        {tab === 'meditate' && (
          <>
            {meditating ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-6">Meditation</p>

                <div className="relative w-56 h-56 mx-auto mb-8">
                  <svg className="w-56 h-56 transform -rotate-90">
                    <circle cx="112" cy="112" r="100" stroke="#ffffff10" strokeWidth="4" fill="none" />
                    <circle cx="112" cy="112" r="100" stroke="#8b5cf6" strokeWidth="4" fill="none"
                      strokeDasharray={`${(meditationTime / meditationTarget) * 628} 628`}
                      strokeLinecap="round"
                      className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white">{formatTimer(meditationTime)}</span>
                    <span className="text-white/30 text-xs mt-2">remaining</span>
                  </div>
                </div>

                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 4, repeat: Infinity }}>
                  <p className="text-purple-300 text-sm italic">Focus on your breath...</p>
                </motion.div>

                <Button onClick={stopMeditation} className="mt-6 bg-white/10 border border-white/20 text-white/60 hover:bg-white/20">
                  <Pause className="w-4 h-4 mr-1" /> End Session
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Choose Duration</h3>
                {MEDITATION_PRESETS.map(p => (
                  <motion.button key={p.name} whileTap={{ scale: 0.98 }} onClick={() => startMeditation(p.minutes)}
                    className="w-full p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-left transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">{p.name}</div>
                        <div className="text-white/40 text-sm">{p.minutes} minutes</div>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${p.color}20`, border: `1px solid ${p.color}50` }}>
                        <Play className="w-5 h-5" style={{ color: p.color }} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ GRATITUDE TAB ═══ */}
        {tab === 'gratitude' && (
          <>
            <Card className="bg-white/5 border-white/10 mb-4">
              <CardContent className="p-4">
                <h3 className="text-white font-bold text-sm mb-2">What are you grateful for?</h3>
                <div className="flex gap-2">
                  <Input value={gratInput} onChange={(e) => setGratInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGratitude()}
                    placeholder="I'm grateful for..."
                    className="bg-white/5 border-white/10 text-white" />
                  <Button onClick={addGratitude} className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {gratEntries.length > 0 ? (
              <div className="space-y-2">
                {gratEntries.slice(0, 20).map((entry, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                    <Heart className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-white text-sm">{entry.text}</p>
                      <p className="text-white/20 text-[10px] mt-1">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/20">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Start your gratitude journal</p>
                <p className="text-xs mt-1">Write one thing you're grateful for each day</p>
              </div>
            )}
          </>
        )}

        {/* ═══ WATER TAB ═══ */}
        {tab === 'water' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Droplets className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-bold text-lg mb-1">Daily Hydration</h3>
              <p className="text-white/40 text-xs mb-6">Goal: {waterGoal} glasses</p>

              {/* Water visualization */}
              <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: waterGoal }).map((_, i) => (
                  <motion.div key={i}
                    animate={i < waterCount ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ delay: i * 0.05 }}
                    className={`w-8 h-12 rounded-lg border-2 transition-all ${i < waterCount ? 'bg-blue-500/60 border-blue-400' : 'bg-white/5 border-white/10'}`}
                  />
                ))}
              </div>

              <div className="text-4xl font-black text-white mb-1">{waterCount}/{waterGoal}</div>
              <p className="text-white/40 text-xs mb-6">
                {waterCount >= waterGoal ? 'Goal reached! Great job!' : `${waterGoal - waterCount} more to go`}
              </p>

              <div className="flex justify-center gap-3">
                <Button onClick={removeWater} disabled={waterCount <= 0} className="bg-white/10 border border-white/20 text-white/60 hover:bg-white/20 w-12 h-12 rounded-full disabled:opacity-20">
                  <Minus className="w-5 h-5" />
                </Button>
                <Button onClick={addWater} className="bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full text-xl font-bold">
                  <Plus className="w-6 h-6" />
                </Button>
                <Button onClick={() => { setWaterCount(0); localStorage.setItem('wellness_water', JSON.stringify({ date: todayKey(), count: 0 })); }}
                  className="bg-white/10 border border-white/20 text-white/60 hover:bg-white/20 w-12 h-12 rounded-full">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {waterCount >= waterGoal && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-3 bg-green-900/30 border border-green-500/50 rounded-xl">
                  <Check className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-green-300 text-sm font-bold">Hydration Goal Reached!</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}