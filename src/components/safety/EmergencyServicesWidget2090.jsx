import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Phone, Flame, Ambulance, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { FuturisticCloud, FuturisticOrb } from '../ui/futuristic-cloud';

export default function EmergencyServicesWidget2090() {
  const [location, setLocation] = useState(null);
  const [emergencyNumbers, setEmergencyNumbers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (!('geolocation' in navigator)) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(coords);
          await loadEmergencyNumbers(coords);
        },
        (error) => {
          setPermissionDenied(true);
          setLoading(false);
        }
      );
    } catch (error) {
      setPermissionDenied(true);
      setLoading(false);
    }
  };

  const loadEmergencyNumbers = async (coords) => {
    try {
      const { data } = await base44.functions.invoke('getEmergencyNumbers', coords);
      setEmergencyNumbers(data.location);
    } catch (error) {
      setEmergencyNumbers({
        police: '112',
        fire: '112',
        ambulance: '112',
        country: 'Unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  const callEmergencyService = async (serviceType, number) => {
    if (!location) {
      alert('Location not available. Please enable GPS.');
      return;
    }

    try {
      await base44.functions.invoke('callEmergencyService', {
        serviceType,
        latitude: location.latitude,
        longitude: location.longitude,
        emergencyNumber: number
      });

      window.location.href = `tel:${number}`;
    } catch (error) {
      console.error('Emergency call failed:', error);
    }
  };

  if (loading) {
    return (
      <FuturisticCloud size="lg" glowColor="red">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <AlertCircle className="w-16 h-16 text-red-400" />
        </motion.div>
        <p className="text-white mt-4">Detecting location...</p>
      </FuturisticCloud>
    );
  }

  return (
    <FuturisticCloud size="xl" glowColor="red">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-red-400 mb-2">Emergency Services</h3>
        {location && (
          <p className="text-sm text-cyan-300 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            {emergencyNumbers?.country || 'Location Detected'}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-8 flex-wrap">
        <motion.button
          onClick={() => callEmergencyService('Police', emergencyNumbers?.police || '112')}
          whileHover={{ y: -10 }}
          whileTap={{ scale: 0.9 }}
        >
          <FuturisticOrb size="xl" glowColor="cyan">
            <div className="text-center">
              <Phone className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Police</p>
              <p className="text-cyan-300 text-xs">{emergencyNumbers?.police}</p>
            </div>
          </FuturisticOrb>
        </motion.button>

        <motion.button
          onClick={() => callEmergencyService('Fire', emergencyNumbers?.fire || '112')}
          whileHover={{ y: -10 }}
          whileTap={{ scale: 0.9 }}
        >
          <FuturisticOrb size="xl" glowColor="orange">
            <div className="text-center">
              <Flame className="w-10 h-10 text-orange-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Fire</p>
              <p className="text-orange-300 text-xs">{emergencyNumbers?.fire}</p>
            </div>
          </FuturisticOrb>
        </motion.button>

        <motion.button
          onClick={() => callEmergencyService('Ambulance', emergencyNumbers?.ambulance || '112')}
          whileHover={{ y: -10 }}
          whileTap={{ scale: 0.9 }}
        >
          <FuturisticOrb size="xl" glowColor="red">
            <div className="text-center">
              <Ambulance className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Ambulance</p>
              <p className="text-red-300 text-xs">{emergencyNumbers?.ambulance}</p>
            </div>
          </FuturisticOrb>
        </motion.button>
      </div>

      <p className="text-xs text-white/50 text-center mt-6">
        Auto-notifies contacts with your exact GPS coordinates
      </p>
    </FuturisticCloud>
  );
}