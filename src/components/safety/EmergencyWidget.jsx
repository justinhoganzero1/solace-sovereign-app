import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmergencyWidget() {
  const [crisisActive, setCrisisActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerCrisis = async (type) => {
    setLoading(true);
    try {
      const position = await getCurrentPosition();
      
      const { data } = await base44.functions.invoke('triggerCrisisMode', {
        crisisType: type,
        severity: 'critical',
        location: {
          latitude: position.latitude,
          longitude: position.longitude,
          address: 'Current location'
        },
        description: `User triggered ${type} emergency`
      });

      setCrisisActive(true);
      setTimeout(() => setCrisisActive(false), 5000);
    } catch (error) {
      console.error('Crisis trigger failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve({ latitude: 0, longitude: 0 })
        );
      } else {
        resolve({ latitude: 0, longitude: 0 });
      }
    });
  };

  return (
    <Card className="bg-gradient-to-br from-red-900/60 to-orange-900/60 backdrop-blur-md border-2 border-red-400/40">
      <CardHeader>
        <CardTitle className="text-red-200 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Emergency Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {crisisActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500 text-white p-4 rounded-lg text-center font-bold"
          >
            ⚠️ CRISIS MODE ACTIVATED
            <p className="text-sm font-normal mt-1">Emergency contacts notified</p>
          </motion.div>
        )}

        <Button
          onClick={() => triggerCrisis('medical')}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <Phone className="w-4 h-4 mr-2" />
          Medical Emergency
        </Button>

        <Button
          onClick={() => triggerCrisis('safety')}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Safety Threat
        </Button>

        <Button
          onClick={() => triggerCrisis('emergency')}
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          <MapPin className="w-4 h-4 mr-2" />
          General Emergency
        </Button>

        <p className="text-xs text-red-200/70 text-center mt-4">
          Emergency contacts will receive your location and alert details
        </p>
      </CardContent>
    </Card>
  );
}