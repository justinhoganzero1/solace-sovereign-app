import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { FuturisticCloud, FuturisticOrb } from '../ui/futuristic-cloud';

export default function AnxietyDeescalatorWidget() {
  const [exerciseActive, setExerciseActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [exercise, setExercise] = useState(null);

  const startExercise = async () => {
    try {
      const { data } = await base44.functions.invoke('anxietyDeescalator', {
        heartRate: 110, // Simulated - would come from smartwatch
        trigger: 'manual'
      });

      if (data.exerciseStarted) {
        setExercise(data.exercise);
        setExerciseActive(true);
        runExercise(data.exercise);
      }
    } catch (error) {
      console.error('Failed to start exercise:', error);
    }
  };

  const runExercise = (ex) => {
    let step = 0;
    const interval = setInterval(() => {
      setCurrentStep(step % ex.instructions.length);
      step++;
      
      if (step >= ex.instructions.length * ex.cycles) {
        clearInterval(interval);
        setExerciseActive(false);
        setCurrentStep(0);
      }
    }, 4000);
  };

  return (
    <FuturisticCloud size="lg" glowColor="cyan">
      <div className="text-center w-full">
        <Wind className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-cyan-300 mb-6">
          Anxiety De-escalator
        </h3>

        {exerciseActive && exercise ? (
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-cyan-400/20 border-4 border-cyan-400 mx-auto flex items-center justify-center"
            >
              <p className="text-4xl font-bold text-cyan-300">
                {exercise.instructions[currentStep].duration}
              </p>
            </motion.div>

            <div>
              <p className="text-2xl text-white font-bold mb-2">
                {exercise.instructions[currentStep].action}
              </p>
              <p className="text-cyan-200">
                {exercise.instructions[currentStep].instruction}
              </p>
            </div>

            <p className="text-xs text-cyan-300/60">
              Box Breathing • Cycle {Math.floor(currentStep / 4) + 1} of {exercise.cycles}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <p className="text-white/80 text-sm">
              Feeling anxious? Let's calm down together with guided box breathing.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startExercise}
            >
              <FuturisticOrb size="lg" glowColor="cyan">
                <div className="text-center">
                  <Heart className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white text-sm">Start</p>
                </div>
              </FuturisticOrb>
            </motion.button>
          </div>
        )}
      </div>
    </FuturisticCloud>
  );
}