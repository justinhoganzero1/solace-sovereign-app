import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Upload, ArrowLeft, Zap, X, Loader2, Wrench, Camera, Search, AlertTriangle, Car, Gauge, Thermometer, Droplets, Wind, BatteryCharging } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── OBD-II Diagnostic Code Database ───
const OBD_CODES = {
  'P0100': { system: 'Fuel/Air', desc: 'Mass Air Flow Circuit Malfunction', severity: 'moderate', fix: 'Check MAF sensor connector, clean or replace MAF sensor, check for vacuum leaks' },
  'P0101': { system: 'Fuel/Air', desc: 'Mass Air Flow Circuit Range/Performance', severity: 'moderate', fix: 'Clean MAF sensor with MAF cleaner, check air filter, inspect intake boot for leaks' },
  'P0110': { system: 'Fuel/Air', desc: 'Intake Air Temperature Sensor Circuit', severity: 'low', fix: 'Check IAT sensor connector, test sensor resistance, replace if faulty' },
  'P0120': { system: 'Fuel/Air', desc: 'Throttle Position Sensor Circuit', severity: 'high', fix: 'Inspect TPS wiring, check voltage, replace TPS if readings are erratic' },
  'P0128': { system: 'Cooling', desc: 'Coolant Thermostat Below Regulating Temperature', severity: 'moderate', fix: 'Replace thermostat, check coolant level, inspect coolant temp sensor' },
  'P0130': { system: 'Emissions', desc: 'O2 Sensor Circuit (Bank 1 Sensor 1)', severity: 'moderate', fix: 'Replace upstream O2 sensor, check wiring, inspect for exhaust leaks' },
  'P0171': { system: 'Fuel/Air', desc: 'System Too Lean (Bank 1)', severity: 'moderate', fix: 'Check for vacuum leaks, clean MAF sensor, inspect fuel injectors, check fuel pressure' },
  'P0172': { system: 'Fuel/Air', desc: 'System Too Rich (Bank 1)', severity: 'moderate', fix: 'Check fuel pressure regulator, inspect fuel injectors, replace O2 sensor if faulty' },
  'P0174': { system: 'Fuel/Air', desc: 'System Too Lean (Bank 2)', severity: 'moderate', fix: 'Same as P0171 but on bank 2 — check intake gasket and PCV valve' },
  'P0300': { system: 'Ignition', desc: 'Random/Multiple Cylinder Misfire', severity: 'high', fix: 'Check spark plugs, ignition coils, fuel injectors, compression test all cylinders' },
  'P0301': { system: 'Ignition', desc: 'Cylinder 1 Misfire Detected', severity: 'high', fix: 'Replace spark plug #1, swap ignition coil to test, check injector #1' },
  'P0302': { system: 'Ignition', desc: 'Cylinder 2 Misfire Detected', severity: 'high', fix: 'Replace spark plug #2, swap ignition coil to test, check injector #2' },
  'P0303': { system: 'Ignition', desc: 'Cylinder 3 Misfire Detected', severity: 'high', fix: 'Replace spark plug #3, swap ignition coil to test, check injector #3' },
  'P0304': { system: 'Ignition', desc: 'Cylinder 4 Misfire Detected', severity: 'high', fix: 'Replace spark plug #4, swap ignition coil to test, check injector #4' },
  'P0325': { system: 'Ignition', desc: 'Knock Sensor 1 Circuit', severity: 'moderate', fix: 'Replace knock sensor, check wiring harness, verify torque specification' },
  'P0340': { system: 'Ignition', desc: 'Camshaft Position Sensor Circuit', severity: 'high', fix: 'Replace camshaft position sensor, check timing belt/chain, inspect wiring' },
  'P0400': { system: 'Emissions', desc: 'EGR Flow Malfunction', severity: 'moderate', fix: 'Clean EGR valve, check vacuum hoses, replace EGR valve if stuck' },
  'P0401': { system: 'Emissions', desc: 'EGR Insufficient Flow', severity: 'moderate', fix: 'Clean EGR passages, replace EGR valve, check DPFE sensor' },
  'P0420': { system: 'Emissions', desc: 'Catalyst System Efficiency Below Threshold (Bank 1)', severity: 'high', fix: 'Replace catalytic converter, check for exhaust leaks, verify O2 sensors working' },
  'P0440': { system: 'Emissions', desc: 'EVAP System Malfunction', severity: 'low', fix: 'Check gas cap seal, inspect EVAP hoses, test purge valve and vent valve' },
  'P0442': { system: 'Emissions', desc: 'EVAP System Small Leak', severity: 'low', fix: 'Replace gas cap, smoke test EVAP system, check hose connections' },
  'P0446': { system: 'Emissions', desc: 'EVAP Vent Control Circuit', severity: 'low', fix: 'Replace vent valve, check wiring, clear blockages in vent hose' },
  'P0455': { system: 'Emissions', desc: 'EVAP System Large Leak', severity: 'moderate', fix: 'Check gas cap, smoke test system, inspect charcoal canister and all EVAP hoses' },
  'P0500': { system: 'Vehicle Speed', desc: 'Vehicle Speed Sensor Malfunction', severity: 'moderate', fix: 'Replace vehicle speed sensor, check wiring, inspect speedometer drive gear' },
  'P0505': { system: 'Idle', desc: 'Idle Control System Malfunction', severity: 'moderate', fix: 'Clean idle air control valve, check for vacuum leaks, reset ECU' },
  'P0507': { system: 'Idle', desc: 'Idle Control System RPM Higher Than Expected', severity: 'moderate', fix: 'Check for vacuum leaks, clean throttle body, inspect IAC valve' },
  'P0600': { system: 'ECU', desc: 'Serial Communication Link Malfunction', severity: 'high', fix: 'Check ECU connectors, inspect wiring harness, possible ECU replacement needed' },
  'P0700': { system: 'Transmission', desc: 'Transmission Control System Malfunction', severity: 'high', fix: 'Scan for transmission-specific codes, check transmission fluid, inspect solenoids' },
  'P0715': { system: 'Transmission', desc: 'Input/Turbine Speed Sensor Circuit', severity: 'high', fix: 'Replace input speed sensor, check connector, inspect wiring' },
  'P0730': { system: 'Transmission', desc: 'Incorrect Gear Ratio', severity: 'high', fix: 'Check transmission fluid level/condition, inspect shift solenoids, possible rebuild' },
  'P0740': { system: 'Transmission', desc: 'Torque Converter Clutch Circuit', severity: 'high', fix: 'Replace TCC solenoid, check wiring, inspect torque converter' },
  'P1000': { system: 'OBD System', desc: 'OBD Systems Readiness Test Not Complete', severity: 'low', fix: 'Drive vehicle through complete drive cycle, no repair typically needed' },
  'P0171': { system: 'Fuel/Air', desc: 'System Too Lean (Bank 1)', severity: 'moderate', fix: 'Check for vacuum leaks, clean/replace MAF, check fuel pressure, inspect intake gaskets' },
  'C0035': { system: 'ABS', desc: 'Left Front Wheel Speed Sensor Circuit', severity: 'moderate', fix: 'Inspect wheel speed sensor, check wiring, clean sensor ring, replace if damaged' },
  'C0040': { system: 'ABS', desc: 'Right Front Wheel Speed Sensor Circuit', severity: 'moderate', fix: 'Inspect wheel speed sensor, check wiring, clean sensor ring, replace if damaged' },
  'B0100': { system: 'Body', desc: 'Driver Frontal Stage 1 Deployment Control', severity: 'high', fix: 'Airbag system fault — professional inspection required. Do NOT attempt DIY repair.' },
  'U0100': { system: 'Network', desc: 'Lost Communication with ECM/PCM', severity: 'high', fix: 'Check ECM power supply, inspect CAN bus wiring, check fuses, possible ECM failure' },
  'U0101': { system: 'Network', desc: 'Lost Communication with TCM', severity: 'high', fix: 'Check TCM power supply and ground, inspect CAN bus wiring, check fuses' },
};

const QUICK_SYMPTOMS = [
  { label: 'Check Engine Light', icon: AlertTriangle, color: '#f59e0b', desc: 'CEL illuminated on dash' },
  { label: 'Engine Won\'t Start', icon: BatteryCharging, color: '#ef4444', desc: 'Cranks but no start or no crank' },
  { label: 'Overheating', icon: Thermometer, color: '#ef4444', desc: 'Temperature gauge high' },
  { label: 'Oil Leak', icon: Droplets, color: '#a855f7', desc: 'Oil spots under vehicle' },
  { label: 'Strange Noise', icon: Wind, color: '#3b82f6', desc: 'Grinding, squealing, knocking' },
  { label: 'Brake Issues', icon: AlertTriangle, color: '#ef4444', desc: 'Soft pedal, grinding, pulling' },
  { label: 'Poor Fuel Economy', icon: Gauge, color: '#f59e0b', desc: 'Using more fuel than normal' },
  { label: 'Transmission Slip', icon: Car, color: '#ec4899', desc: 'Gears slipping or rough shift' },
];

export default function Mechanic() {
  const [_user, setUser] = useState(null);
  const [_profile, setProfile] = useState(null);
  const [tab, setTab] = useState('diagnose'); // diagnose, obd, symptoms
  const [mode, setMode] = useState('capture');
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [obdInput, setObdInput] = useState('');
  const [obdResult, setObdResult] = useState(null);
  const [obdHistory, setObdHistory] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef(null);
  const _cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadUserData();
    try {
      const saved = JSON.parse(localStorage.getItem('mechanic_obd_history') || '[]');
      setObdHistory(saved);
    } catch { /* ignore */ }
    return () => stopCamera();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // ─── Camera capture ───
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Camera not supported on this device.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => setCameraActive(true)).catch(() => {});
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImages(prev => [...prev, dataUrl]);
    stopCamera();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) => setImages(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  // ─── OBD-II lookup ───
  const lookupOBD = () => {
    const code = obdInput.trim().toUpperCase();
    if (!code) return;
    const result = OBD_CODES[code];
    if (result) {
      setObdResult({ code, ...result });
      const entry = { code, desc: result.desc, date: new Date().toISOString() };
      const updated = [entry, ...obdHistory.filter(h => h.code !== code)].slice(0, 20);
      setObdHistory(updated);
      localStorage.setItem('mechanic_obd_history', JSON.stringify(updated));
    } else {
      setObdResult({ code, system: 'Unknown', desc: `Code ${code} not in local database. Try AI diagnosis below.`, severity: 'unknown', fix: 'Use the Photo Diagnose tab to describe symptoms and get AI-powered repair guidance.' });
    }
  };

  // ─── AI diagnosis ───
  const analyzeAndGetInstructions = async () => {
    if (!description.trim()) { alert('Please describe the problem'); return; }
    setLoading(true);
    try {
      const prompt = `You are Oracle's Mechanic Mode - an expert automotive and mechanical repair assistant covering:
  - A-Grade Motor Mechanics, Diesel Engineering, Mechanical Engineering
  - Fitter & Turner work, Gas Mechanic systems, Auto Electrical Engineering, Aviation Engineering

User's request: ${description}

Provide detailed repair instructions as JSON:
{
  "title": "Clear title of the repair task",
  "steps": [{"step_number": 1, "instruction": "Detailed instruction", "tip": "Helpful tip (optional)"}],
  "estimated_time": "How long", "difficulty": "Easy/Medium/Hard",
  "safety_warnings": ["Safety concerns"], "tools_needed": ["Required tools"]
}

Be thorough, practical, and include all necessary safety information.`;

      const { data } = await base44.integrations.Core.InvokeLLM({
        prompt, file_urls: images.length > 0 ? images : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            steps: { type: "array", items: { type: "object", properties: { step_number: { type: "integer" }, instruction: { type: "string" }, tip: { type: "string" } } } },
            estimated_time: { type: "string" }, difficulty: { type: "string" },
            safety_warnings: { type: "array", items: { type: "string" } },
            tools_needed: { type: "array", items: { type: "string" } }
          }
        }
      });
      setInstructions(data);
      setMode('instructions');
    } catch (error) {
      console.error('Error getting instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetMode = () => { setMode('capture'); setImages([]); setDescription(''); setInstructions(null); setActiveStep(0); };

  const severityColor = (s) => s === 'high' ? 'text-red-400' : s === 'moderate' ? 'text-yellow-400' : s === 'low' ? 'text-green-400' : 'text-white/50';
  const severityBg = (s) => s === 'high' ? 'bg-red-900/30 border-red-500/50' : s === 'moderate' ? 'bg-yellow-900/30 border-yellow-500/50' : s === 'low' ? 'bg-green-900/30 border-green-500/50' : 'bg-white/5 border-white/10';

  // ─── Instructions view (repair steps) ───
  if (mode === 'instructions' && instructions) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#e2e8f0', padding: '16px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Button variant="ghost" className="text-white hover:bg-white/20 mb-4" onClick={resetMode}>
            <ArrowLeft className="w-5 h-5 mr-2" /> New Repair
          </Button>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
              {instructions.title}
            </h1>
            <div className="flex gap-4 justify-center text-sm text-gray-300">
              <span>⏱️ {instructions.estimated_time}</span>
              <span>📊 {instructions.difficulty}</span>
              <span>📋 {instructions.steps?.length || 0} Steps</span>
            </div>
          </motion.div>

          {instructions.tools_needed?.length > 0 && (
            <Card className="bg-blue-900/30 border-blue-500/50 mb-4">
              <CardContent className="p-4">
                <h3 className="text-blue-300 font-bold text-sm mb-2">Tools Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {instructions.tools_needed.map((tool, i) => (
                    <span key={i} className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs">{tool}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {instructions.safety_warnings?.length > 0 && (
            <Card className="bg-red-900/30 border-red-500/50 mb-4">
              <CardContent className="p-4">
                <h3 className="text-red-300 font-bold text-sm mb-2">Safety Warnings</h3>
                <ul className="list-disc list-inside text-red-200 text-sm space-y-1">
                  {instructions.safety_warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {instructions.steps?.map((step, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                <Card className={`border transition-all cursor-pointer ${activeStep === idx ? 'bg-orange-900/30 border-orange-400' : 'bg-white/5 border-white/10 hover:border-white/30'}`} onClick={() => setActiveStep(idx)}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${activeStep === idx ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/60'}`}>
                        {step.step_number}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{step.instruction}</p>
                        {step.tip && <p className="text-yellow-300/80 text-xs mt-1">Tip: {step.tip}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button onClick={resetMode} className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-12">
            Start New Repair
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main view ───
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e2e8f0', padding: '0' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(249,115,22,0.12)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Wrench size={24} style={{ color: '#f97316' }} /></button>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#f97316,#ef4444,#dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mechanic Mode</div>
              <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>OBD-II CODES • AI DIAGNOSTICS • REPAIR</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px 120px' }}>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'diagnose', label: 'Photo Diagnose', icon: Camera },
            { id: 'obd', label: 'OBD-II Codes', icon: Search },
            { id: 'symptoms', label: 'Symptoms', icon: AlertTriangle },
          ].map(t => (
            <Button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 ${tab === t.id ? 'bg-orange-600 text-white' : 'bg-white/5 text-white/60 border border-white/10'}`}>
              <t.icon className="w-4 h-4 mr-1" /> {t.label}
            </Button>
          ))}
        </div>

        {/* ═══ PHOTO DIAGNOSE TAB ═══ */}
        {tab === 'diagnose' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 space-y-4">
              {/* Camera preview */}
              <AnimatePresence>
                {cameraActive && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative rounded-xl overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <Button onClick={capturePhoto} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full w-16 h-16">
                        <Camera className="w-6 h-6" />
                      </Button>
                      <Button onClick={stopCamera} className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!cameraActive && (
                <video ref={videoRef} className="hidden" />
              )}

              {/* Photos grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-orange-500/30" />
                      <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Capture buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={startCamera} disabled={cameraActive} className="bg-orange-600 hover:bg-orange-700 text-white h-12">
                  <Camera className="w-4 h-4 mr-2" /> Take Photo
                </Button>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                  <Button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 h-12">
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </Button>
                </div>
              </div>

              <Textarea placeholder="Describe the problem... e.g. 'Engine making knocking sound when accelerating' or 'Brake pedal feels soft and spongy'" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-28 bg-white/5 border-white/10 text-white" />

              <Button onClick={analyzeAndGetInstructions} disabled={!description.trim() || loading} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-12 disabled:opacity-40">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Zap className="w-4 h-4 mr-2" /> Get Repair Instructions</>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ═══ OBD-II CODE TAB ═══ */}
        {tab === 'obd' && (
          <>
            <Card className="bg-white/5 border-white/10 mb-4">
              <CardContent className="p-4">
                <label className="text-xs text-orange-300 font-semibold uppercase tracking-wider mb-2 block">Enter Diagnostic Code</label>
                <div className="flex gap-2">
                  <Input value={obdInput} onChange={(e) => setObdInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && lookupOBD()}
                    placeholder="e.g. P0420, P0300, C0035..."
                    className="bg-white/5 border-white/10 text-white font-mono text-lg tracking-wider"
                    maxLength={6}
                  />
                  <Button onClick={lookupOBD} className="bg-orange-600 hover:bg-orange-700 text-white px-6">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* OBD Result */}
            <AnimatePresence>
              {obdResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`${severityBg(obdResult.severity)} mb-4`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-white/10 rounded-lg px-3 py-2">
                          <span className="text-white font-mono font-bold text-lg">{obdResult.code}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/50 text-xs uppercase">{obdResult.system}</span>
                            <span className={`text-xs font-bold uppercase ${severityColor(obdResult.severity)}`}>
                              {obdResult.severity === 'high' ? 'CRITICAL' : obdResult.severity === 'moderate' ? 'MODERATE' : obdResult.severity === 'low' ? 'MINOR' : 'UNKNOWN'}
                            </span>
                          </div>
                          <p className="text-white font-bold text-sm mb-2">{obdResult.desc}</p>
                          <div className="bg-white/5 rounded-lg p-3 mt-2">
                            <p className="text-xs text-white/40 uppercase font-semibold mb-1">Recommended Fix</p>
                            <p className="text-white/80 text-sm">{obdResult.fix}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent lookups */}
            {obdHistory.length > 0 && (
              <>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2 mt-4">Recent Lookups</h3>
                <div className="space-y-2">
                  {obdHistory.slice(0, 8).map((h, i) => (
                    <button key={i} onClick={() => { setObdInput(h.code); setObdResult({ code: h.code, ...OBD_CODES[h.code] }); }}
                      className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 text-left transition-all">
                      <span className="text-orange-400 font-mono font-bold text-sm">{h.code}</span>
                      <span className="text-white/60 text-xs flex-1 truncate">{h.desc}</span>
                      <span className="text-white/20 text-[10px]">{new Date(h.date).toLocaleDateString()}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <Card className="bg-white/5 border-white/10 mt-4">
              <CardContent className="p-4">
                <h3 className="text-orange-300 font-bold text-sm mb-2">About OBD-II Codes</h3>
                <div className="text-xs text-white/50 space-y-1">
                  <p><strong className="text-white/70">P0xxx</strong> — Powertrain (engine, transmission)</p>
                  <p><strong className="text-white/70">C0xxx</strong> — Chassis (ABS, suspension, steering)</p>
                  <p><strong className="text-white/70">B0xxx</strong> — Body (airbags, A/C, lighting)</p>
                  <p><strong className="text-white/70">U0xxx</strong> — Network (CAN bus communication)</p>
                  <p className="mt-2">Database contains {Object.keys(OBD_CODES).length}+ common codes. For rare codes, use Photo Diagnose with AI.</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ═══ SYMPTOMS TAB ═══ */}
        {tab === 'symptoms' && (
          <>
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Common Symptoms — Tap to Diagnose</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {QUICK_SYMPTOMS.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.button key={s.label} whileTap={{ scale: 0.97 }}
                    onClick={() => { setTab('diagnose'); setDescription(s.label + ': ' + s.desc); }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-left transition-all">
                    <Icon className="w-6 h-6 mb-2" style={{ color: s.color }} />
                    <div className="text-white text-sm font-bold">{s.label}</div>
                    <div className="text-white/40 text-xs mt-1">{s.desc}</div>
                  </motion.button>
                );
              })}
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h3 className="text-orange-300 font-bold text-sm mb-2">Pro Tips</h3>
                <div className="text-xs text-white/50 space-y-2">
                  <p>- Take photos from multiple angles — close-up of the problem area + wider context shot</p>
                  <p>- Note when the problem occurs (cold start, under load, at idle, specific speeds)</p>
                  <p>- Mention any recent work done on the vehicle</p>
                  <p>- Include year, make, and model for more accurate diagnosis</p>
                  <p>- If you have an OBD-II scanner, check the codes tab first — it narrows the diagnosis significantly</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}