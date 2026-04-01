import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Sun, Newspaper, Bell, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyBriefingWidget() {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBriefing();
  }, []);

  const loadBriefing = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('dailyBriefing');
      setBriefing(data);
    } catch (error) {
      console.error('Failed to load briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !briefing) {
    return (
      <Card className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 border-yellow-400/30">
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-yellow-300 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!briefing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-amber-900/60 to-yellow-900/60 backdrop-blur-md border-2 border-yellow-400/40">
        <CardHeader>
          <CardTitle className="text-yellow-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Daily Briefing
            </span>
            <Button variant="ghost" size="icon" onClick={loadBriefing} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-white">
          <div>
            <h3 className="text-2xl font-bold text-yellow-300">{briefing.greeting}</h3>
            <p className="text-sm text-yellow-200/70">{briefing.date}</p>
          </div>

          {briefing.weather && (
            <div className="flex items-start gap-2">
              <Sun className="w-5 h-5 text-yellow-300 mt-1" />
              <div>
                <p className="font-semibold text-yellow-200">Weather</p>
                <p className="text-sm text-white/80">{briefing.weather}</p>
              </div>
            </div>
          )}

          {briefing.news?.length > 0 && (
            <div className="flex items-start gap-2">
              <Newspaper className="w-5 h-5 text-yellow-300 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-200">Top News</p>
                <ul className="text-sm text-white/80 space-y-1 mt-1">
                  {briefing.news.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {briefing.reminders?.length > 0 && (
            <div className="flex items-start gap-2">
              <Bell className="w-5 h-5 text-yellow-300 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-200">Upcoming</p>
                <ul className="text-sm text-white/80 space-y-1 mt-1">
                  {briefing.reminders.slice(0, 3).map((reminder, idx) => (
                    <li key={idx}>• {reminder.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-yellow-400/20 space-y-2">
            <p className="text-yellow-200 italic">💪 {briefing.motivational}</p>
            <p className="text-yellow-300 font-semibold">✨ {briefing.affirmation}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}