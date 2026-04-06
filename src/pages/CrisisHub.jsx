import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, AlertTriangle, Phone, MapPin, Mic, MicOff, UserPlus, X, PhoneCall, PhoneOff, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const EMERGENCY_NUMBERS = {
  universal: '112',
  us_police: '911',
  us_fire: '911',
  us_ambulance: '911',
  uk_all: '999',
  au_all: '000',
  za_police: '10111',
  za_ambulance: '10177',
  za_fire: '10177',
};

const FAKE_CALLERS = [
  { name: 'Mom', delay: 3 },
  { name: 'Boss', delay: 5 },
  { name: 'Partner', delay: 3 },
  { name: 'Friend', delay: 5 },
];

const TABS = [
  { id: 'sos', label: 'SOS', icon: AlertTriangle },
  { id: 'fakecall', label: 'Fake Call', icon: PhoneCall },
  { id: 'witness', label: 'Witness', icon: Mic },
  { id: 'contacts', label: 'Contacts', icon: Phone },
];

export default function CrisisHub() {
  const [tab, setTab] = useState('sos');

  // ─── SOS state ───
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // ─── Fake call state ───
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallCountdown, setFakeCallCountdown] = useState(0);
  const [fakeCallCaller, setFakeCallCaller] = useState(null);
  const fakeCallRef = useRef(null);
  const fakeRingRef = useRef(null);

  // ─── Silent witness state ───
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  // ─── Emergency contacts state ───
  const [contacts, setContacts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('crisis_contacts') || '[]');
      setContacts(saved);
    } catch (e) { /* ignore */ }
    return () => {
      if (fakeRingRef.current) { try { fakeRingRef.current.stop(); } catch(e) {} }
    };
  }, []);

  // ─── Location helper ───
  const getLocation = () => {
    setLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy });
          setLocationLoading(false);
        },
        () => { setLocationLoading(false); alert('Location unavailable. Enable GPS.'); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationLoading(false);
      alert('Geolocation not supported.');
    }
  };

  // ─── SOS ───
  const triggerSOS = () => {
    setSosActive(true);
    getLocation();
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
  };

  const cancelSOS = () => setSosActive(false);

  const callEmergency = (number) => {
    window.location.href = `tel:${number}`;
  };

  const shareLocation = () => {
    if (!location) { getLocation(); return; }
    const url = `https://maps.google.com/maps?q=${location.lat},${location.lng}`;
    if (navigator.share) {
      navigator.share({ title: 'My Emergency Location', text: `I need help! My location: ${url}`, url });
    } else {
      navigator.clipboard.writeText(`EMERGENCY: My location is ${url}`).then(() => alert('Location copied to clipboard!'));
    }
  };

  // ─── Fake call ───
  const startFakeCall = (caller) => {
    setFakeCallCaller(caller);
    setFakeCallCountdown(caller.delay);
    fakeCallRef.current = setInterval(() => {
      setFakeCallCountdown(t => {
        if (t <= 1) {
          clearInterval(fakeCallRef.current);
          setFakeCallActive(true);
          // Play ring sound
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const playRing = () => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.frequency.value = 440;
              osc.type = 'sine';
              gain.gain.value = 0.3;
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              setTimeout(() => { osc.frequency.value = 480; }, 500);
              setTimeout(() => { osc.stop(); }, 1000);
            };
            playRing();
            const ringInterval = setInterval(playRing, 2000);
            fakeRingRef.current = { stop: () => { clearInterval(ringInterval); ctx.close(); } };
          } catch (e) { /* ignore */ }
          if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const answerFakeCall = () => {
    if (fakeRingRef.current) { try { fakeRingRef.current.stop(); } catch(e) {} }
    setFakeCallActive(false);
    setFakeCallCaller(null);
  };

  const cancelFakeCall = () => {
    clearInterval(fakeCallRef.current);
    if (fakeRingRef.current) { try { fakeRingRef.current.stop(); } catch(e) {} }
    setFakeCallActive(false);
    setFakeCallCaller(null);
    setFakeCallCountdown(0);
  };

  // ─── Silent witness ───
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordings(prev => [{ url, date: new Date().toISOString(), duration: recordingTime }, ...prev].slice(0, 10));
        setRecordingTime(0);
      };
      mr.start();
      setRecording(true);
      recordTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (e) {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordTimerRef.current);
    setRecording(false);
  };

  // ─── Contacts ───
  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const updated = [...contacts, { name: newName.trim(), phone: newPhone.trim(), id: Date.now() }];
    setContacts(updated);
    localStorage.setItem('crisis_contacts', JSON.stringify(updated));
    setNewName('');
    setNewPhone('');
  };

  const removeContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem('crisis_contacts', JSON.stringify(updated));
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── Fake call overlay ───
  if (fakeCallActive && fakeCallCaller) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-white/10 mx-auto mb-6 flex items-center justify-center">
            <Phone className="w-12 h-12 text-green-400" />
          </div>
          <p className="text-white/50 text-sm mb-2">Incoming Call</p>
          <h1 className="text-white text-4xl font-bold mb-8">{fakeCallCaller.name}</h1>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <p className="text-green-400 text-sm mb-8">Calling...</p>
          </motion.div>
          <div className="flex gap-8">
            <button onClick={cancelFakeCall} className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
            <button onClick={answerFakeCall} className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
              <Phone className="w-7 h-7 text-white" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e2e8f0', padding: '0' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(239,68,68,0.12)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Shield size={24} style={{ color: '#ef4444' }} /></button>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#ef4444,#f97316,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Crisis Hub</div>
              <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>SOS \u2022 FAKE CALL \u2022 WITNESS \u2022 CONTACTS</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px 120px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'rgba(6,6,16,0.6)', borderRadius: '14px', padding: '4px', border: '1px solid rgba(239,68,68,0.06)' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 4px', borderRadius: '11px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.25s', background: tab === t.id ? 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(249,115,22,0.15))' : 'transparent', color: tab === t.id ? '#fca5a5' : '#475569', boxShadow: tab === t.id ? '0 0 16px rgba(239,68,68,0.15)' : 'none' }}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ═══ SOS TAB ═══ */}
        {tab === 'sos' && (
          <>
            {!sosActive ? (
              <div className="text-center py-8">
                <motion.button whileTap={{ scale: 0.9 }} onClick={triggerSOS}
                  className="w-40 h-40 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-4 border-red-400 mx-auto flex items-center justify-center shadow-lg shadow-red-500/50">
                  <div>
                    <AlertTriangle className="w-12 h-12 text-white mx-auto mb-1" />
                    <span className="text-white text-lg font-black">SOS</span>
                  </div>
                </motion.button>
                <p className="text-white/30 text-xs mt-4">Tap for emergency options</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <Card className="bg-red-900/40 border-red-500/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-300 font-bold text-sm">SOS ACTIVE</span>
                    </div>

                    {location && (
                      <div className="bg-black/30 rounded-lg p-3 mb-3 text-xs text-white/60 font-mono">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)} (±{Math.round(location.acc)}m)
                      </div>
                    )}

                    <Button onClick={shareLocation} className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-2 h-12">
                      <Navigation className="w-4 h-4 mr-2" /> Share My Location
                    </Button>
                    <Button onClick={cancelSOS} className="w-full bg-white/10 border border-white/20 text-white/60 h-10">
                      Cancel SOS
                    </Button>
                  </CardContent>
                </Card>

                <h3 className="text-white/40 text-xs uppercase tracking-wider mt-2">Call Emergency Services</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'International (112)', number: '112', color: 'bg-red-600' },
                    { label: 'US/CA (911)', number: '911', color: 'bg-blue-600' },
                    { label: 'UK (999)', number: '999', color: 'bg-indigo-600' },
                    { label: 'AU (000)', number: '000', color: 'bg-emerald-600' },
                    { label: 'SA Police (10111)', number: '10111', color: 'bg-blue-600' },
                    { label: 'SA Ambulance (10177)', number: '10177', color: 'bg-red-600' },
                  ].map(e => (
                    <Button key={e.number + e.label} onClick={() => callEmergency(e.number)}
                      className={`${e.color} text-white h-14 text-sm font-bold`}>
                      <Phone className="w-4 h-4 mr-1" /> {e.label}
                    </Button>
                  ))}
                </div>

                {contacts.length > 0 && (
                  <>
                    <h3 className="text-white/40 text-xs uppercase tracking-wider mt-3">Your Emergency Contacts</h3>
                    {contacts.map(c => (
                      <Button key={c.id} onClick={() => callEmergency(c.phone)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 justify-start">
                        <Phone className="w-4 h-4 mr-2" /> {c.name} — {c.phone}
                      </Button>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* ═══ FAKE CALL TAB ═══ */}
        {tab === 'fakecall' && (
          <>
            <Card className="bg-white/5 border-white/10 mb-4">
              <CardContent className="p-4">
                <PhoneCall className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h2 className="text-white font-bold text-center mb-1">Fake Call</h2>
                <p className="text-white/40 text-xs text-center mb-4">Trigger a fake incoming call to exit uncomfortable situations</p>

                {fakeCallCountdown > 0 && !fakeCallActive ? (
                  <div className="text-center">
                    <p className="text-white text-lg mb-2">Call from <strong>{fakeCallCaller?.name}</strong> in...</p>
                    <span className="text-4xl font-black text-green-400">{fakeCallCountdown}</span>
                    <div className="mt-4">
                      <Button onClick={cancelFakeCall} className="bg-white/10 border border-white/20 text-white/60">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {FAKE_CALLERS.map(c => (
                      <motion.button key={c.name} whileTap={{ scale: 0.97 }} onClick={() => startFakeCall(c)}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 text-center transition-all">
                        <Phone className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <div className="text-white text-sm font-bold">{c.name}</div>
                        <div className="text-white/30 text-xs">{c.delay}s delay</div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ═══ SILENT WITNESS TAB ═══ */}
        {tab === 'witness' && (
          <>
            <Card className="bg-white/5 border-white/10 mb-4">
              <CardContent className="p-4 text-center">
                <Mic className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h2 className="text-white font-bold mb-1">Silent Witness</h2>
                <p className="text-white/40 text-xs mb-4">Discreet audio recording for evidence</p>

                {recording ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-400 font-mono font-bold">{formatTime(recordingTime)}</span>
                    </div>
                    <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white h-12">
                      <MicOff className="w-4 h-4 mr-2" /> Stop Recording
                    </Button>
                  </>
                ) : (
                  <Button onClick={startRecording} className="bg-yellow-600 hover:bg-yellow-700 text-white h-12">
                    <Mic className="w-4 h-4 mr-2" /> Start Recording
                  </Button>
                )}
              </CardContent>
            </Card>

            {recordings.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white/40 text-xs uppercase tracking-wider">Recordings</h3>
                {recordings.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3">
                    <Mic className="w-4 h-4 text-yellow-400" />
                    <div className="flex-1">
                      <audio src={r.url} controls className="w-full h-8" />
                    </div>
                    <span className="text-white/20 text-[10px]">{formatTime(r.duration)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ CONTACTS TAB ═══ */}
        {tab === 'contacts' && (
          <>
            <Card className="bg-white/5 border-white/10 mb-4">
              <CardContent className="p-4">
                <h2 className="text-white font-bold text-sm mb-3">Emergency Contacts</h2>
                <div className="space-y-2">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contact name" className="bg-white/5 border-white/10 text-white" />
                  <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Phone number" type="tel" className="bg-white/5 border-white/10 text-white" />
                  <Button onClick={addContact} disabled={!newName.trim() || !newPhone.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-30">
                    <UserPlus className="w-4 h-4 mr-2" /> Add Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {contacts.length > 0 ? (
              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3">
                    <Phone className="w-4 h-4 text-red-400" />
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">{c.name}</div>
                      <div className="text-white/40 text-xs">{c.phone}</div>
                    </div>
                    <button onClick={() => callEmergency(c.phone)} className="text-green-400 hover:text-green-300 mr-2">
                      <PhoneCall className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeContact(c.id)} className="text-white/20 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/20">
                <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Add emergency contacts</p>
                <p className="text-xs mt-1">They'll appear in SOS mode for quick calling</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}