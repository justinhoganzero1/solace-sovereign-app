/* ═══════════════════════════════════════════════════════════
   WEARABLE SYNC ENGINE
   Connects to heart rate monitors, smartwatches, fitness bands
   via Web Bluetooth API. Reads pulse continuously for mood
   detection and emotional state inference.
   ═══════════════════════════════════════════════════════════ */

const WEARABLE_KEY = 'solace_wearable_data';

const HEART_RATE_SERVICE = 'heart_rate';
const HEART_RATE_MEASUREMENT = 'heart_rate_measurement';

// Mood inference from heart rate patterns
const MOOD_FROM_HR = {
  veryLow:   { range: [0, 55],    mood: 'relaxed',   label: 'Deep Calm',         emoji: '🧘' },
  low:       { range: [55, 65],   mood: 'calm',      label: 'Relaxed',           emoji: '😌' },
  resting:   { range: [65, 80],   mood: 'neutral',   label: 'Baseline',          emoji: '🙂' },
  elevated:  { range: [80, 95],   mood: 'engaged',   label: 'Focused / Engaged', emoji: '🎯' },
  high:      { range: [95, 110],  mood: 'excited',   label: 'Excited / Active',  emoji: '⚡' },
  veryHigh:  { range: [110, 130], mood: 'stressed',  label: 'Stressed / Anxious',emoji: '😰' },
  extreme:   { range: [130, 220], mood: 'panic',     label: 'Fight or Flight',   emoji: '🚨' },
};

// Heart Rate Variability (HRV) patterns for deeper mood analysis
const HRV_MOODS = {
  highHRV:   { label: 'Resilient & Relaxed',  mood: 'calm' },
  normalHRV: { label: 'Balanced',             mood: 'neutral' },
  lowHRV:    { label: 'Stressed or Fatigued', mood: 'stressed' },
};

class WearableSyncEngine {
  constructor() {
    this.device = null;
    this.characteristic = null;
    this.connected = false;
    this.currentHR = 0;
    this.hrHistory = [];
    this.mood = 'neutral';
    this.listeners = new Set();
    this.restingHR = 70;
    this.data = this._load();
    
    // Simulated fallback for browsers without Web Bluetooth
    this.simulationMode = false;
    this.simulationInterval = null;
  }

  _load() {
    try {
      const raw = localStorage.getItem(WEARABLE_KEY);
      return raw ? JSON.parse(raw) : {
        lastConnected: null,
        deviceName: null,
        restingHR: 70,
        hrBaseline: [],
        moodHistory: [],
        totalReadings: 0,
      };
    } catch { return { hrBaseline: [], moodHistory: [], totalReadings: 0 }; }
  }

  _save() {
    try {
      localStorage.setItem(WEARABLE_KEY, JSON.stringify(this.data));
    } catch {}
  }

  // ── Subscribe to heart rate updates ──
  onUpdate(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notify() {
    const info = {
      hr: this.currentHR,
      mood: this.mood,
      moodLabel: this._getMoodLabel(),
      moodEmoji: this._getMoodEmoji(),
      connected: this.connected,
      deviceName: this.data.deviceName,
      history: this.hrHistory.slice(-60),
    };
    this.listeners.forEach(cb => {
      try { cb(info); } catch {}
    });
  }

  // ── Connect to Bluetooth heart rate device ──
  async connect() {
    // Check Web Bluetooth support
    if (!navigator.bluetooth) {
      console.warn('[Wearable] Web Bluetooth not supported, using simulation mode');
      this.startSimulation();
      return { success: true, simulated: true };
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }],
        optionalServices: [HEART_RATE_SERVICE, 'battery_service']
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.connected = false;
        this._notify();
        // Auto-reconnect
        setTimeout(() => this._reconnect(), 3000);
      });

      const server = await this.device.gatt.connect();
      const service = await server.getPrimaryService(HEART_RATE_SERVICE);
      this.characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT);

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (e) => {
        this._handleHRReading(e);
      });

      this.connected = true;
      this.data.lastConnected = new Date().toISOString();
      this.data.deviceName = this.device.name || 'Heart Rate Monitor';
      this._save();
      this._notify();

      return { success: true, deviceName: this.data.deviceName };
    } catch (error) {
      console.warn('[Wearable] Bluetooth connection failed:', error.message);
      // Fall back to simulation
      this.startSimulation();
      return { success: true, simulated: true, error: error.message };
    }
  }

  async _reconnect() {
    if (!this.device || this.connected) return;
    try {
      const server = await this.device.gatt.connect();
      const service = await server.getPrimaryService(HEART_RATE_SERVICE);
      this.characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT);
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (e) => {
        this._handleHRReading(e);
      });
      this.connected = true;
      this._notify();
    } catch {
      setTimeout(() => this._reconnect(), 5000);
    }
  }

  // ── Parse heart rate data from BLE ──
  _handleHRReading(event) {
    const value = event.target.value;
    const flags = value.getUint8(0);
    const is16bit = flags & 0x01;
    const hr = is16bit ? value.getUint16(1, true) : value.getUint8(1);
    this._processHeartRate(hr);
  }

  // ── Process a heart rate value ──
  _processHeartRate(hr) {
    if (hr < 30 || hr > 220) return; // Invalid range

    this.currentHR = hr;
    const timestamp = Date.now();
    this.hrHistory.push({ hr, timestamp });

    // Keep last 600 readings (~10 minutes at 1/sec)
    if (this.hrHistory.length > 600) {
      this.hrHistory = this.hrHistory.slice(-600);
    }

    // Update mood
    this.mood = this._inferMood(hr);
    
    // Store for long-term tracking
    this.data.totalReadings++;
    this.data.moodHistory.push({
      mood: this.mood,
      hr,
      timestamp: new Date().toISOString()
    });
    
    // Keep last 1000 mood entries
    if (this.data.moodHistory.length > 1000) {
      this.data.moodHistory = this.data.moodHistory.slice(-1000);
    }

    // Update resting HR baseline (rolling average of low readings)
    if (hr < 85 && hr > 45) {
      this.data.hrBaseline.push(hr);
      if (this.data.hrBaseline.length > 100) {
        this.data.hrBaseline = this.data.hrBaseline.slice(-100);
      }
      this.restingHR = Math.round(
        this.data.hrBaseline.reduce((a, b) => a + b, 0) / this.data.hrBaseline.length
      );
      this.data.restingHR = this.restingHR;
    }

    this._save();
    this._notify();
  }

  // ── Infer mood from heart rate ──
  _inferMood(hr) {
    for (const [, data] of Object.entries(MOOD_FROM_HR)) {
      if (hr >= data.range[0] && hr < data.range[1]) return data.mood;
    }
    return 'neutral';
  }

  _getMoodLabel() {
    for (const [, data] of Object.entries(MOOD_FROM_HR)) {
      if (data.mood === this.mood) return data.label;
    }
    return 'Unknown';
  }

  _getMoodEmoji() {
    for (const [, data] of Object.entries(MOOD_FROM_HR)) {
      if (data.mood === this.mood) return data.emoji;
    }
    return '❓';
  }

  // ── Simulation mode (no real device) ──
  startSimulation() {
    this.simulationMode = true;
    this.connected = true;
    this.data.deviceName = 'Simulated Sensor';
    
    let baseHR = 72;
    let trend = 0;
    
    this.simulationInterval = setInterval(() => {
      // Natural heart rate variation
      trend += (Math.random() - 0.5) * 2;
      trend = Math.max(-10, Math.min(10, trend));
      const noise = (Math.random() - 0.5) * 4;
      const hr = Math.round(Math.max(55, Math.min(120, baseHR + trend + noise)));
      this._processHeartRate(hr);
    }, 1000);

    this._notify();
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.simulationMode = false;
    this.connected = false;
    this._notify();
  }

  // ── Disconnect ──
  disconnect() {
    this.stopSimulation();
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.connected = false;
    this._notify();
  }

  // ── Get current state for AI context ──
  getContextForAI() {
    if (!this.connected) return '';
    
    const avgRecent = this.hrHistory.slice(-30);
    const avg = avgRecent.length > 0
      ? Math.round(avgRecent.reduce((a, b) => a + b.hr, 0) / avgRecent.length)
      : 0;
    
    const trend = this.hrHistory.length >= 10
      ? (this.hrHistory.slice(-5).reduce((a, b) => a + b.hr, 0) / 5) - 
        (this.hrHistory.slice(-10, -5).reduce((a, b) => a + b.hr, 0) / 5)
      : 0;
    
    const trendStr = trend > 3 ? 'rising (becoming more activated)' 
                   : trend < -3 ? 'falling (calming down)' 
                   : 'stable';
    
    return `[Wearable Data] Heart Rate: ${this.currentHR} BPM (avg: ${avg}, trend: ${trendStr}). Inferred mood: ${this._getMoodLabel()} ${this._getMoodEmoji()}. Resting HR baseline: ${this.restingHR} BPM.`;
  }
}

export const wearableSync = new WearableSyncEngine();
