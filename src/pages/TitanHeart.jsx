import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dumbbell, Timer, Play, Trophy, Flame, Check, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Exercise library by muscle group
const EXERCISES = {
  chest: [
    { name: 'Push-Ups', sets: 3, reps: 15, rest: 60, equipment: 'none', icon: '💪' },
    { name: 'Bench Press', sets: 4, reps: 10, rest: 90, equipment: 'barbell', icon: '🏋️' },
    { name: 'Dumbbell Flyes', sets: 3, reps: 12, rest: 60, equipment: 'dumbbells', icon: '🦅' },
    { name: 'Incline Press', sets: 3, reps: 10, rest: 90, equipment: 'bench', icon: '📐' },
    { name: 'Diamond Push-Ups', sets: 3, reps: 12, rest: 60, equipment: 'none', icon: '💎' },
  ],
  back: [
    { name: 'Pull-Ups', sets: 3, reps: 8, rest: 90, equipment: 'bar', icon: '🔝' },
    { name: 'Bent-Over Rows', sets: 4, reps: 10, rest: 90, equipment: 'barbell', icon: '🚣' },
    { name: 'Lat Pulldowns', sets: 3, reps: 12, rest: 60, equipment: 'machine', icon: '⬇️' },
    { name: 'Superman Hold', sets: 3, reps: 15, rest: 45, equipment: 'none', icon: '🦸' },
    { name: 'Inverted Rows', sets: 3, reps: 10, rest: 60, equipment: 'bar', icon: '↩️' },
  ],
  legs: [
    { name: 'Squats', sets: 4, reps: 12, rest: 90, equipment: 'none', icon: '🦵' },
    { name: 'Lunges', sets: 3, reps: 12, rest: 60, equipment: 'none', icon: '🚶' },
    { name: 'Deadlifts', sets: 4, reps: 8, rest: 120, equipment: 'barbell', icon: '⚡' },
    { name: 'Calf Raises', sets: 3, reps: 20, rest: 45, equipment: 'none', icon: '🦶' },
    { name: 'Wall Sit', sets: 3, reps: 45, rest: 60, equipment: 'none', icon: '🧱' },
  ],
  arms: [
    { name: 'Bicep Curls', sets: 3, reps: 12, rest: 60, equipment: 'dumbbells', icon: '💪' },
    { name: 'Tricep Dips', sets: 3, reps: 12, rest: 60, equipment: 'bench', icon: '🔻' },
    { name: 'Hammer Curls', sets: 3, reps: 10, rest: 60, equipment: 'dumbbells', icon: '🔨' },
    { name: 'Overhead Extension', sets: 3, reps: 12, rest: 60, equipment: 'dumbbell', icon: '🔝' },
    { name: 'Chin-Ups', sets: 3, reps: 8, rest: 90, equipment: 'bar', icon: '🔼' },
  ],
  core: [
    { name: 'Plank', sets: 3, reps: 60, rest: 45, equipment: 'none', icon: '🧘' },
    { name: 'Crunches', sets: 3, reps: 20, rest: 30, equipment: 'none', icon: '🔄' },
    { name: 'Mountain Climbers', sets: 3, reps: 30, rest: 45, equipment: 'none', icon: '⛰️' },
    { name: 'Russian Twists', sets: 3, reps: 20, rest: 45, equipment: 'none', icon: '🌀' },
    { name: 'Leg Raises', sets: 3, reps: 15, rest: 45, equipment: 'none', icon: '🦿' },
  ],
  cardio: [
    { name: 'Jumping Jacks', sets: 3, reps: 30, rest: 30, equipment: 'none', icon: '⭐' },
    { name: 'Burpees', sets: 3, reps: 10, rest: 60, equipment: 'none', icon: '🔥' },
    { name: 'High Knees', sets: 3, reps: 30, rest: 30, equipment: 'none', icon: '🏃' },
    { name: 'Box Jumps', sets: 3, reps: 12, rest: 60, equipment: 'box', icon: '📦' },
    { name: 'Jump Rope', sets: 3, reps: 60, rest: 45, equipment: 'rope', icon: '🪢' },
  ],
};

const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest', color: '#ef4444', icon: '🫁' },
  { id: 'back', name: 'Back', color: '#3b82f6', icon: '🔙' },
  { id: 'legs', name: 'Legs', color: '#22c55e', icon: '🦵' },
  { id: 'arms', name: 'Arms', color: '#a855f7', icon: '💪' },
  { id: 'core', name: 'Core', color: '#f59e0b', icon: '🎯' },
  { id: 'cardio', name: 'Cardio', color: '#ec4899', icon: '❤️‍🔥' },
];

const QUICK_WORKOUTS = [
  { name: 'Full Body Blast', duration: '30 min', groups: ['chest', 'back', 'legs', 'core'], exercises: 2, color: '#ef4444' },
  { name: 'Upper Power', duration: '25 min', groups: ['chest', 'back', 'arms'], exercises: 2, color: '#3b82f6' },
  { name: 'Leg Day', duration: '30 min', groups: ['legs', 'core'], exercises: 3, color: '#22c55e' },
  { name: 'HIIT Cardio', duration: '20 min', groups: ['cardio', 'core'], exercises: 3, color: '#ec4899' },
  { name: 'Arms & Core', duration: '25 min', groups: ['arms', 'core'], exercises: 3, color: '#a855f7' },
];

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function TitanHeart() {
  const [view, setView] = useState('home'); // home, workout, exercise, timer, log
  const [_selectedGroup, _setSelectedGroup] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null); // { exercises: [], currentIdx, currentSet }
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [workoutLog, setWorkoutLog] = useState([]);
  const [bodyWeight, setBodyWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const restTimerRef = useRef(null);
  const workoutTimerRef = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('titan_workout_log') || '[]');
      setWorkoutLog(saved);
      setTotalWorkouts(saved.length);
      const weights = JSON.parse(localStorage.getItem('titan_weight_history') || '[]');
      setWeightHistory(weights);
    } catch { /* ignore */ }
  }, []);

  // Workout timer
  useEffect(() => {
    if (isWorkoutActive) {
      workoutTimerRef.current = setInterval(() => setWorkoutTimer(t => t + 1), 1000);
    } else {
      clearInterval(workoutTimerRef.current);
    }
    return () => clearInterval(workoutTimerRef.current);
  }, [isWorkoutActive]);

  // Rest timer countdown
  useEffect(() => {
    if (isResting && restTimer > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimer(t => {
          if (t <= 1) {
            setIsResting(false);
            clearInterval(restTimerRef.current);
            // Play a beep sound
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              osc.frequency.value = 880;
              osc.connect(ctx.destination);
              osc.start();
              setTimeout(() => osc.stop(), 200);
            } catch { /* ignore */ }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restTimerRef.current);
  }, [isResting, restTimer]);

  // Start a quick workout
  const startQuickWorkout = (preset) => {
    const exercises = [];
    preset.groups.forEach(g => {
      const pool = EXERCISES[g];
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      exercises.push(...shuffled.slice(0, preset.exercises));
    });
    setActiveWorkout({ exercises, currentIdx: 0, currentSet: 1, name: preset.name });
    setCompletedSets({});
    setWorkoutTimer(0);
    setIsWorkoutActive(true);
    setView('workout');
  };

  // Start custom workout from muscle group
  const startGroupWorkout = (groupId) => {
    const exercises = EXERCISES[groupId];
    const name = MUSCLE_GROUPS.find(g => g.id === groupId)?.name + ' Workout';
    setActiveWorkout({ exercises, currentIdx: 0, currentSet: 1, name });
    setCompletedSets({});
    setWorkoutTimer(0);
    setIsWorkoutActive(true);
    setView('workout');
  };

  // Complete a set
  const completeSet = () => {
    if (!activeWorkout) return;
    const ex = activeWorkout.exercises[activeWorkout.currentIdx];
    const key = `${activeWorkout.currentIdx}-${activeWorkout.currentSet}`;
    setCompletedSets(prev => ({ ...prev, [key]: true }));

    if (activeWorkout.currentSet < ex.sets) {
      // More sets to go — start rest timer
      setActiveWorkout(prev => ({ ...prev, currentSet: prev.currentSet + 1 }));
      setRestTimer(ex.rest);
      setIsResting(true);
    } else if (activeWorkout.currentIdx < activeWorkout.exercises.length - 1) {
      // Next exercise
      setActiveWorkout(prev => ({ ...prev, currentIdx: prev.currentIdx + 1, currentSet: 1 }));
      setRestTimer(90);
      setIsResting(true);
    } else {
      // Workout complete!
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setIsWorkoutActive(false);
    const entry = {
      name: activeWorkout.name,
      exercises: activeWorkout.exercises.length,
      duration: workoutTimer,
      date: new Date().toISOString(),
      setsCompleted: Object.keys(completedSets).length,
    };
    const updated = [...workoutLog, entry];
    setWorkoutLog(updated);
    setTotalWorkouts(updated.length);
    localStorage.setItem('titan_workout_log', JSON.stringify(updated));
    setView('complete');
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
    clearInterval(restTimerRef.current);
  };

  const logWeight = () => {
    const w = parseFloat(bodyWeight);
    if (!w || w < 20 || w > 500) return;
    const entry = { weight: w, date: new Date().toISOString() };
    const updated = [...weightHistory, entry];
    setWeightHistory(updated);
    localStorage.setItem('titan_weight_history', JSON.stringify(updated));
    setBodyWeight('');
  };

  const totalSetsAllTime = workoutLog.reduce((sum, w) => sum + (w.setsCompleted || 0), 0);
  const totalMinutes = workoutLog.reduce((sum, w) => sum + Math.round((w.duration || 0) / 60), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-950 to-black p-4 md:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Titan Heart</h1>
              <p className="text-red-300 text-sm">Fitness & Strength Coach</p>
            </div>
          </div>
          {isWorkoutActive && (
            <div className="flex items-center gap-2 bg-red-600/30 border border-red-500/50 rounded-full px-4 py-2">
              <Timer className="w-4 h-4 text-red-400" />
              <span className="text-white font-mono font-bold">{formatTime(workoutTimer)}</span>
            </div>
          )}
        </div>

        {/* ═══ HOME VIEW ═══ */}
        {view === 'home' && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">{totalWorkouts}</div>
                  <div className="text-[10px] text-white/50 uppercase">Workouts</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">{totalSetsAllTime}</div>
                  <div className="text-[10px] text-white/50 uppercase">Sets</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <Timer className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">{totalMinutes}m</div>
                  <div className="text-[10px] text-white/50 uppercase">Total Time</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Workouts */}
            <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Quick Workouts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {QUICK_WORKOUTS.map((w) => (
                <motion.button
                  key={w.name}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startQuickWorkout(w)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-sm">{w.name}</div>
                      <div className="text-white/40 text-xs mt-1">{w.duration} • {w.groups.length} muscle groups</div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${w.color}20`, border: `1px solid ${w.color}50` }}>
                      <Play className="w-4 h-4" style={{ color: w.color }} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Muscle Groups */}
            <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Train by Muscle Group</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {MUSCLE_GROUPS.map((g) => (
                <motion.button
                  key={g.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startGroupWorkout(g.id)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-center transition-all"
                >
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <div className="text-white text-xs font-bold">{g.name}</div>
                </motion.button>
              ))}
            </div>

            {/* Body Weight Tracker */}
            <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Body Weight</h2>
            <Card className="bg-white/5 border-white/10 mb-6">
              <CardContent className="p-4">
                <div className="flex gap-2 mb-3">
                  <Input
                    type="number"
                    value={bodyWeight}
                    onChange={(e) => setBodyWeight(e.target.value)}
                    placeholder="Enter weight (kg)..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button onClick={logWeight} className="bg-red-600 hover:bg-red-700 text-white px-6">Log</Button>
                </div>
                {weightHistory.length > 0 && (
                  <div className="flex items-end gap-1 h-16">
                    {weightHistory.slice(-20).map((entry, i) => {
                      const min = Math.min(...weightHistory.slice(-20).map(e => e.weight));
                      const max = Math.max(...weightHistory.slice(-20).map(e => e.weight));
                      const range = max - min || 1;
                      const height = ((entry.weight - min) / range) * 100;
                      return (
                        <div key={i} className="flex-1 bg-red-500/60 rounded-t-sm transition-all hover:bg-red-400"
                          style={{ height: `${Math.max(10, height)}%` }}
                          title={`${entry.weight}kg — ${new Date(entry.date).toLocaleDateString()}`}
                        />
                      );
                    })}
                  </div>
                )}
                {weightHistory.length > 0 && (
                  <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>Latest: {weightHistory[weightHistory.length - 1].weight}kg</span>
                    {weightHistory.length > 1 && (
                      <span className={weightHistory[weightHistory.length - 1].weight < weightHistory[weightHistory.length - 2].weight ? 'text-green-400' : 'text-red-400'}>
                        {(weightHistory[weightHistory.length - 1].weight - weightHistory[weightHistory.length - 2].weight).toFixed(1)}kg
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workout History */}
            {workoutLog.length > 0 && (
              <>
                <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Recent Workouts</h2>
                <div className="space-y-2">
                  {workoutLog.slice(-5).reverse().map((w, i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-bold">{w.name}</div>
                          <div className="text-white/40 text-xs">{new Date(w.date).toLocaleDateString()} • {w.exercises} exercises • {w.setsCompleted} sets</div>
                        </div>
                        <div className="text-white/60 text-sm font-mono">{formatTime(w.duration)}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ═══ ACTIVE WORKOUT VIEW ═══ */}
        {view === 'workout' && activeWorkout && (
          <>
            {/* Rest Timer Overlay */}
            <AnimatePresence>
              {isResting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                >
                  <div className="text-center">
                    <p className="text-white/60 text-sm uppercase tracking-widest mb-4">Rest</p>
                    <div className="relative w-40 h-40 mx-auto mb-6">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#333" strokeWidth="6" fill="none" />
                        <circle cx="80" cy="80" r="70" stroke="#ef4444" strokeWidth="6" fill="none"
                          strokeDasharray={`${(restTimer / (activeWorkout.exercises[activeWorkout.currentIdx]?.rest || 60)) * 440} 440`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-black text-white">{restTimer}</span>
                      </div>
                    </div>
                    <Button onClick={skipRest} className="bg-red-600 hover:bg-red-700 text-white px-8">
                      Skip Rest
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                <span>{activeWorkout.name}</span>
                <span>{activeWorkout.currentIdx + 1}/{activeWorkout.exercises.length}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${((activeWorkout.currentIdx) / activeWorkout.exercises.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Exercise */}
            {(() => {
              const ex = activeWorkout.exercises[activeWorkout.currentIdx];
              const isTimeBased = ['Plank', 'Wall Sit', 'Jump Rope'].includes(ex.name);
              return (
                <Card className="bg-white/5 border-red-500/30 mb-4">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">{ex.icon}</div>
                    <h2 className="text-2xl font-bold text-white mb-1">{ex.name}</h2>
                    <p className="text-white/40 text-sm mb-4">
                      {ex.equipment !== 'none' && `Equipment: ${ex.equipment} • `}
                      Set {activeWorkout.currentSet} of {ex.sets}
                    </p>

                    <div className="bg-white/5 rounded-2xl p-6 mb-4">
                      <div className="text-5xl font-black text-white mb-1">
                        {isTimeBased ? `${ex.reps}s` : ex.reps}
                      </div>
                      <div className="text-white/40 text-sm">{isTimeBased ? 'seconds' : 'reps'}</div>
                    </div>

                    {/* Set indicators */}
                    <div className="flex justify-center gap-2 mb-6">
                      {Array.from({ length: ex.sets }).map((_, i) => {
                        const key = `${activeWorkout.currentIdx}-${i + 1}`;
                        const done = completedSets[key];
                        const current = i + 1 === activeWorkout.currentSet;
                        return (
                          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            done ? 'bg-green-500 text-white' : current ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-white/10 text-white/30'
                          }`}>
                            {done ? <Check className="w-4 h-4" /> : i + 1}
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      onClick={completeSet}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white h-14 text-lg font-bold"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Complete Set {activeWorkout.currentSet}
                    </Button>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Upcoming exercises */}
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Up Next</h3>
            <div className="space-y-2 mb-4">
              {activeWorkout.exercises.slice(activeWorkout.currentIdx + 1, activeWorkout.currentIdx + 4).map((ex, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                  <span className="text-lg">{ex.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-bold">{ex.name}</div>
                    <div className="text-white/30 text-xs">{ex.sets} sets × {ex.reps} {['Plank', 'Wall Sit', 'Jump Rope'].includes(ex.name) ? 'sec' : 'reps'}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => { setIsWorkoutActive(false); finishWorkout(); }}
              className="w-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
              End Workout Early
            </Button>
          </>
        )}

        {/* ═══ WORKOUT COMPLETE ═══ */}
        {view === 'complete' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Workout Complete!</h1>
            <p className="text-white/60 mb-6">{activeWorkout?.name}</p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <Timer className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatTime(workoutTimer)}</div>
                  <div className="text-[10px] text-white/40">Duration</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <Target className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{Object.keys(completedSets).length}</div>
                  <div className="text-[10px] text-white/40">Sets Done</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <Dumbbell className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{activeWorkout?.exercises.length}</div>
                  <div className="text-[10px] text-white/40">Exercises</div>
                </CardContent>
              </Card>
            </div>

            <Button onClick={() => { setView('home'); setActiveWorkout(null); }}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 h-12">
              Back to Home
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}