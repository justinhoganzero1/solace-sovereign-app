import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MotivationalWidget() {
  const [message, setMessage] = useState('');
  const [affirmation, setAffirmation] = useState('');

  useEffect(() => {
    generateNew();
  }, []);

  const generateNew = () => {
    const motivational = [
      "You are stronger than you think. Keep going!",
      "Today is your day to shine. Embrace it!",
      "Believe in yourself - miracles happen every day.",
      "Your potential is limitless. Dream big!",
      "Every step forward is progress. You've got this!",
      "You are capable of amazing things.",
      "Choose joy. Choose growth. Choose yourself.",
      "The best is yet to come. Stay positive!"
    ];

    const affirmations = [
      "I am worthy of love and respect.",
      "I am capable and strong.",
      "I choose happiness and positivity.",
      "I am grateful for this moment.",
      "I trust in my journey.",
      "I am enough, just as I am.",
      "I attract positive energy.",
      "I am proud of my progress."
    ];

    setMessage(motivational[Math.floor(Math.random() * motivational.length)]);
    setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-md border-2 border-purple-400/40">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Daily Inspiration
          </span>
          <Button variant="ghost" size="icon" onClick={generateNew}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2"
        >
          <Zap className="w-5 h-5 text-yellow-300 mt-1" />
          <p className="text-white font-medium">{message}</p>
        </motion.div>

        <motion.div
          key={affirmation}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-2 pt-3 border-t border-purple-400/20"
        >
          <Sparkles className="w-5 h-5 text-purple-300 mt-1" />
          <p className="text-purple-200 italic">{affirmation}</p>
        </motion.div>
      </CardContent>
    </Card>
  );
}