import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export default function SafeZoneManager() {
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    radius_meters: 100,
    zone_type: 'home'
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const user = await base44.auth.me();
      const data = await base44.entities.SafeZone.filter({ created_by: user.email });
      setZones(data);
    } catch (error) {
      console.error('Failed to load zones:', error);
    }
  };

  const addZone = async () => {
    try {
      await base44.entities.SafeZone.create(newZone);
      setShowForm(false);
      setNewZone({ name: '', latitude: 0, longitude: 0, radius_meters: 100, zone_type: 'home' });
      loadZones();
    } catch (error) {
      console.error('Failed to add zone:', error);
    }
  };

  const deleteZone = async (id) => {
    try {
      await base44.entities.SafeZone.delete(id);
      loadZones();
    } catch (error) {
      console.error('Failed to delete zone:', error);
    }
  };

  const useCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setNewZone({
          ...newZone,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-400/40">
      <CardHeader>
        <CardTitle className="text-green-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Safe Zones
          </span>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="bg-green-950/40 rounded-lg p-3 space-y-2 border border-green-400/20">
            <Input
              placeholder="Zone name (Home, Work, etc.)"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              className="bg-white/10 text-white"
            />
            <Button
              onClick={useCurrentLocation}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Use Current Location
            </Button>
            <Button onClick={addZone} className="w-full bg-green-600">
              Save Zone
            </Button>
          </div>
        )}

        {zones.length === 0 ? (
          <p className="text-green-200/70 text-sm text-center">No safe zones yet</p>
        ) : (
          zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-green-950/40 rounded-lg p-3 flex items-center justify-between border border-green-400/20"
            >
              <div>
                <p className="text-white font-semibold">{zone.name}</p>
                <p className="text-xs text-green-200/70">
                  {zone.radius_meters}m radius
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteZone(zone.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}