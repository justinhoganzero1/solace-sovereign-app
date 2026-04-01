import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FuturisticCloud } from '../ui/futuristic-cloud';
import { Button } from '../ui/button';
import { Shield, Wifi, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function GuardianHiveWidget() {
  const [activating, setActivating] = useState(false);
  const [hiveActive, setHiveActive] = useState(false);
  const [nearbyOracles, setNearbyOracles] = useState(0);

  const activateHive = async (threatType) => {
    setActivating(true);
    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { data } = await base44.functions.invoke('guardianHive', {
        threat_type: threatType,
        location_lat: position.coords.latitude,
        location_lng: position.coords.longitude,
        severity: 'high'
      });

      setHiveActive(true);
      setNearbyOracles(data.nearby_oracles_notified);
      toast.success(`Guardian Hive activated! ${data.nearby_oracles_notified} Oracles protecting you.`);
    } catch (error) {
      toast.error('Failed to activate Hive');
    } finally {
      setActivating(false);
    }
  };

  return (
    <FuturisticCloud size="xl" glowColor={hiveActive ? "green" : "cyan"} className="mx-auto">
      <div className="text-center space-y-4 p-6">
        <motion.div
          animate={{ rotate: hiveActive ? 360 : 0 }}
          transition={{ duration: 2, repeat: hiveActive ? Infinity : 0, ease: "linear" }}
        >
          <Shield className={`w-16 h-16 mx-auto ${hiveActive ? 'text-green-400' : 'text-cyan-400'}`} />
        </motion.div>

        <h3 className="text-2xl font-bold text-white">Guardian Hive</h3>
        <p className="text-sm text-gray-300">
          Mesh Network: {hiveActive ? `${nearbyOracles} Oracles Protecting` : 'Ready to Deploy'}
        </p>

        {hiveActive ? (
          <div className="space-y-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center justify-center gap-2 text-green-400"
            >
              <Wifi className="w-5 h-5" />
              <span className="text-sm font-bold">HIVE ACTIVE</span>
            </motion.div>
            <p className="text-xs text-gray-400">
              Anonymous mesh protection enabled. All nearby Oracles alerted.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => activateHive('crash')}
              disabled={activating}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Crash
            </Button>
            <Button
              onClick={() => activateHive('robbery')}
              disabled={activating}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Robbery
            </Button>
            <Button
              onClick={() => activateHive('medical')}
              disabled={activating}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Medical
            </Button>
            <Button
              onClick={() => activateHive('violence')}
              disabled={activating}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Violence
            </Button>
          </div>
        )}
      </div>
    </FuturisticCloud>
  );
}