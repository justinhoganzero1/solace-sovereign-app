import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Heart, Zap, Shield, Sparkles, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb, FuturisticCloud } from '../components/ui/futuristic-cloud';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TitanHeart() {
  const [joyScore, setJoyScore] = useState(50);
  const [userInput, setUserInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [syncedDevices, setSyncedDevices] = useState([]);
  const [wins, setWins] = useState([]);

  useEffect(() => {
    loadEmpathyData();
  }, []);

  const loadEmpathyData = async () => {
    try {
      const emotionLogs = await base44.entities.EmotionLog.filter({});
      if (emotionLogs.length > 0) {
        setJoyScore(emotionLogs[emotionLogs.length - 1].joy_score);
      }

      const devices = await base44.entities.DeviceSync.filter({ is_active: true });
      setSyncedDevices(devices);

      const happinessBoosts = await base44.entities.HappinessBoost.filter({});
      setWins(happinessBoosts.slice(-5));
    } catch (error) {
      console.error('Failed to load empathy data:', error);
    }
  };

  const analyzeEmotion = async () => {
    if (!userInput.trim()) return;

    setAnalyzing(true);
    try {
      const { data } = await base44.functions.invoke('empathyEngine', {
        user_input: userInput,
        device_source: 'phone'
      });

      setJoyScore(data.joy_score);
      
      // Visual effect
      if (data.visual_effect === 'gold_stars') {
        toast.success(data.oracle_says, {
          icon: '⭐',
          duration: 5000
        });
      } else if (data.support_mode) {
        toast(data.oracle_says, {
          icon: '💙',
          duration: 10000
        });
      }

      setUserInput('');
      loadEmpathyData();
    } catch (error) {
      toast.error('Empathy engine failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const syncDevice = async (deviceType) => {
    try {
      const { data } = await base44.functions.invoke('deviceSync', {
        action: 'register',
        device_type: deviceType,
        device_id: `${deviceType}_${Date.now()}`
      });

      toast.success(data.message);
      loadEmpathyData();
    } catch (error) {
      toast.error('Device sync failed');
    }
  };

  const replayWins = async () => {
    try {
      const { data } = await base44.functions.invoke('gratitudeMultiplier', {
        action: 'replay_wins'
      });

      if (data.your_wins) {
        toast.success(data.oracle_says, { duration: 8000 });
      }
    } catch (error) {
      toast.error('Failed to replay wins');
    }
  };

  const deviceTypes = [
    { type: 'airpods', icon: Sparkles, label: 'AirPods', color: 'cyan' },
    { type: 'iphone', icon: Smartphone, label: 'iPhone', color: 'purple' },
    { type: 'tesla', icon: Zap, label: 'Tesla', color: 'red' },
    { type: 'computer', icon: Shield, label: 'Computer', color: 'green' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FuturisticOrb size="sm" glowColor="pink">
                <ArrowLeft className="w-6 h-6 text-pink-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Heart className="w-24 h-24 text-pink-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(236,72,153,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 mb-4">
            Titan Heart
          </h1>
          <p className="text-2xl text-purple-300">Emotional Sovereignty</p>
        </motion.div>

        {/* Joy Score */}
        <div className="max-w-4xl mx-auto mb-12">
          <FuturisticCloud size="md" glowColor="pink">
            <div className="text-center p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Joy Score</h3>
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-red-600 rounded-full"></div>
                <svg className="transform -rotate-90 w-32 h-32 relative z-10">
                  <circle cx="64" cy="64" r="58" stroke="#333" strokeWidth="8" fill="none" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="58" 
                    stroke="url(#gradient)" 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${joyScore * 3.64} 364`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span className="text-4xl font-black text-black">{joyScore}</span>
                </div>
              </div>
            </div>
          </FuturisticCloud>
        </div>

        {/* Emotion Input */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-pink-400/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">How are you feeling?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeEmotion()}
                  placeholder="Tell Oracle how you feel..."
                  className="bg-black/50 text-white border-pink-400/30"
                />
                <Button
                  onClick={analyzeEmotion}
                  disabled={analyzing}
                  className="bg-gradient-to-r from-pink-600 to-red-600"
                >
                  {analyzing ? 'Analyzing...' : 'Send'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Sync */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Synced Devices</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {deviceTypes.map((device, idx) => {
              const Icon = device.icon;
              const isSynced = syncedDevices.some(d => d.device_type === device.type);
              return (
                <motion.div
                  key={device.type}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`${isSynced ? 'bg-green-900/30 border-green-400' : 'bg-gray-900/30 border-gray-600'} border backdrop-blur-md`}>
                    <CardContent className="p-6 text-center">
                      <Icon className={`w-12 h-12 mx-auto mb-2 ${isSynced ? 'text-green-400' : 'text-gray-400'}`} />
                      <p className="text-white text-sm mb-2">{device.label}</p>
                      {!isSynced && (
                        <Button
                          onClick={() => syncDevice(device.type)}
                          size="sm"
                          className={`bg-${device.color}-600`}
                        >
                          Sync
                        </Button>
                      )}
                      {isSynced && <p className="text-xs text-green-400">✓ Synced</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Gratitude Replay */}
        {wins.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={replayWins}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-lg py-6"
            >
              🌟 Replay Your Wins
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}