import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Phone, Flame, Ambulance, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmergencyServicesWidget() {
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
          console.error('Location error:', error);
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
      console.error('Failed to load emergency numbers:', error);
      // Fallback to 112
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

      // Initiate phone call
      window.location.href = `tel:${number}`;
    } catch (error) {
      console.error('Emergency call failed:', error);
    }
  };

  if (permissionDenied) {
    return (
      <Card className="bg-gradient-to-br from-red-900/60 to-orange-900/60 backdrop-blur-md border-2 border-red-400/40">
        <CardHeader>
          <CardTitle className="text-red-200 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Location Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 text-sm mb-3">
            Please enable location permissions to access emergency services.
          </p>
          <Button
            onClick={requestLocationPermission}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Enable Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-red-900/60 to-orange-900/60 backdrop-blur-md border-2 border-red-400/40">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-white">Loading location...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-red-900/60 to-orange-900/60 backdrop-blur-md border-2 border-red-400/40">
      <CardHeader>
        <CardTitle className="text-red-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone className="w-6 h-6" />
            Emergency Services
          </span>
          {location && (
            <span className="text-xs flex items-center gap-1 text-red-300">
              <MapPin className="w-3 h-3" />
              {emergencyNumbers?.country || 'Detected'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-3"
        >
          <Button
            onClick={() => callEmergencyService('Police', emergencyNumbers?.police || '112')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-16 text-lg"
          >
            <Phone className="w-6 h-6 mr-2" />
            Police {emergencyNumbers?.police && `(${emergencyNumbers.police})`}
          </Button>

          <Button
            onClick={() => callEmergencyService('Fire', emergencyNumbers?.fire || '112')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-16 text-lg"
          >
            <Flame className="w-6 h-6 mr-2" />
            Fire {emergencyNumbers?.fire && `(${emergencyNumbers.fire})`}
          </Button>

          <Button
            onClick={() => callEmergencyService('Ambulance', emergencyNumbers?.ambulance || '112')}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-16 text-lg"
          >
            <Ambulance className="w-6 h-6 mr-2" />
            Ambulance {emergencyNumbers?.ambulance && `(${emergencyNumbers.ambulance})`}
          </Button>
        </motion.div>

        <p className="text-xs text-red-200/70 text-center mt-4">
          Your exact location and emergency contacts will be notified automatically
        </p>
      </CardContent>
    </Card>
  );
}