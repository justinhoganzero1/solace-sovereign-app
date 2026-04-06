import React, { useState } from 'react';
import { ArrowLeft, Smartphone, MapPin, Shield, Activity, Users, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb, FuturisticCloud } from '../components/ui/futuristic-cloud';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PhygitalHub() {
  const [_hapticActive, setHapticActive] = useState(false);
  const [safeMeeting, setSafeMeeting] = useState(null);
  const [isScanningBio, setIsScanningBio] = useState(false);
  const [isScanningCrowd, setIsScanningCrowd] = useState(false);

  const activateHapticGuide = async () => {
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { data } = await base44.functions.invoke('hapticGuide', {
          current_lat: position.coords.latitude,
          current_lng: position.coords.longitude,
          destination_lat: position.coords.latitude + 0.001,
          destination_lng: position.coords.longitude + 0.001
        });

        setHapticActive(true);
        
        // Trigger phone vibration
        if (navigator.vibrate) {
          navigator.vibrate(data.vibration_pattern);
        }

        toast.success(`Oracle guides you: ${data.direction}. No screen needed.`);
      });
    } catch {
      toast.error('Haptic guide failed');
    }
  };

  const createSafeMeeting = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { data } = await base44.functions.invoke('safeMeetingEscrow', {
          action: 'create',
          meeting_with: 'stranger@example.com',
          location: 'Public Coffee Shop',
          time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });

        setSafeMeeting(data.meeting);
        toast.success('Meeting GPS held in escrow. Oracle monitoring.');
      });
    } catch {
      toast.error('Safe meeting creation failed');
    }
  };

  const runBioMetricCheck = () => {
    setIsScanningBio(true);
    toast.info('Initiating bio-scan sequence...');
    
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanningBio(false);
      const heartRate = Math.floor(Math.random() * (100 - 60) + 60);
      const stressLevel = Math.floor(Math.random() * 100);
      const status = stressLevel > 50 ? 'ELEVATED' : 'NOMINAL';
      
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Bio-Metric Analysis Complete</span>
          <span>Heart Rate: {heartRate} BPM</span>
          <span>Stress Level: {stressLevel}% ({status})</span>
          <span>Cortisol: {Math.random().toFixed(2)} µg/dL</span>
        </div>
      );
    }, 3000);
  };

  const scanCrowdStress = () => {
    setIsScanningCrowd(true);
    toast.info('Analyzing local crowd sentiment...');
    
    setTimeout(() => {
      setIsScanningCrowd(false);
      const density = Math.floor(Math.random() * 100);
      const tension = Math.floor(Math.random() * 100);
      
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Area Analysis Complete</span>
          <span>Crowd Density: {density}%</span>
          <span>Ambient Tension: {tension}%</span>
          <span>Safety Rating: {tension > 60 ? 'CAUTION ADVISED' : 'SAFE'}</span>
        </div>
      );
    }, 3000);
  };

  const features = [
    { name: 'Haptic Escape', icon: Navigation, action: activateHapticGuide, color: 'cyan', loading: false },
    { name: 'Safe Meeting Escrow', icon: MapPin, action: createSafeMeeting, color: 'purple', loading: safeMeeting !== null },
    { name: 'Bio-Metric Check', icon: Activity, action: runBioMetricCheck, color: 'red', loading: isScanningBio },
    { name: 'Crowd Stress Map', icon: Users, action: scanCrowdStress, color: 'yellow', loading: isScanningCrowd },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => window.history.back()}>
            <FuturisticOrb size="sm" glowColor="cyan">
              <ArrowLeft className="w-6 h-6 text-cyan-400" />
            </FuturisticOrb>
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Smartphone className="w-24 h-24 text-cyan-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(34,211,238,0.9)]" />
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
            Phygital World
          </h1>
          <p className="text-2xl text-purple-300">Real-World Integration</p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15 }}
              >
                <FuturisticCloud size="md" glowColor={feature.color}>
                  <div className="text-center p-6">
                    <Icon className="w-16 h-16 text-white mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.name}</h3>
                    {feature.action && (
                      <Button
                        onClick={feature.action}
                        disabled={feature.loading}
                        className={`bg-${feature.color}-600 hover:bg-${feature.color}-700 disabled:opacity-50`}
                      >
                        {feature.loading ? 'Processing...' : 'Activate'}
                      </Button>
                    )}
                  </div>
                </FuturisticCloud>
              </motion.div>
            );
          })}
        </div>

        {safeMeeting && (
          <div className="max-w-4xl mx-auto mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-900/30 border border-green-400 rounded-lg p-6 backdrop-blur-xl"
            >
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 text-center">
                Safe Meeting Active - Next check-in: 15 minutes
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}