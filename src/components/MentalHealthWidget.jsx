import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentalHealthWidget() {
  const [mood, setMood] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!mood || !stressLevel || !sleepQuality) {
      alert('Please select all options');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('getMentalHealthCheckIn', {
        mood,
        stress_level: stressLevel,
        sleep_quality: sleepQuality
      });
      setResponse(data.check_in_response);
    } catch (error) {
      console.error('Error during check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-900">
          <Heart className="w-5 h-5" />
          Mental Health Check-In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!response ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-pink-900">How's your mood?</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="sad">😢 Sad</SelectItem>
                  <SelectItem value="anxious">😰 Anxious</SelectItem>
                  <SelectItem value="angry">😠 Angry</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="excited">🤩 Excited</SelectItem>
                  <SelectItem value="stressed">😩 Stressed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-pink-900">Stress level?</label>
              <Select value={stressLevel} onValueChange={setStressLevel}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select stress level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="moderate">🟡 Moderate</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-pink-900">Sleep quality?</label>
              <Select value={sleepQuality} onValueChange={setSleepQuality}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select sleep quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCheckIn}
              disabled={loading || !mood || !stressLevel || !sleepQuality}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Support...
                </>
              ) : (
                'Get Support'
              )}
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <p className="text-pink-900 whitespace-pre-wrap">{response}</p>
            </div>
            <Button
              onClick={() => setResponse(null)}
              variant="outline"
              className="w-full"
            >
              New Check-In
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}