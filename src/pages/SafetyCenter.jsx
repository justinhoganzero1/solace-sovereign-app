import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import EmergencyWidget from '../components/safety/EmergencyWidget';
import EmergencyServicesWidget from '../components/safety/EmergencyServicesWidget';
import GhostFollowWidget from '../components/safety/GhostFollowWidget';
import SafeZoneManager from '../components/safety/SafeZoneManager';

export default function SafetyCenter() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-2xl flex items-center justify-center gap-3">
              <Shield className="w-12 h-12 text-red-400" />
              Safety Center
            </h1>
            <p className="text-xl text-red-200">Your personal protection hub</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <EmergencyServicesWidget />
            <EmergencyWidget />
            <GhostFollowWidget />
            <SafeZoneManager />
          </div>
        </div>
      </div>
    </div>
  );
}