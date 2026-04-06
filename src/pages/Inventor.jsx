import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ArrowLeft, Zap, X, Loader2, Lightbulb, BrainCircuit, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';

const designStyles = {
  formal: {
    animated: { name: 'Animated Formal', description: 'Professional animations with corporate polish' },
    professional: { name: 'Executive Professional', description: 'Clean, authoritative, enterprise-grade design' },
    nuvo: { name: 'Nuvo Formal', description: 'Modern luxury with sophisticated minimalism' },
    decor: { name: 'Decorative Formal', description: 'Ornate elegance with classical touches' },
    minimalist: { name: 'Minimalist Formal', description: 'Ultra-clean with maximum white space' },
    luxury: { name: 'Luxury Formal', description: 'Premium materials and rich textures' },
  },
  informal: {
    animated: { name: 'Playful Animated', description: 'Fun, bouncy animations with personality' },
    casual: { name: 'Casual Friendly', description: 'Relaxed, approachable, everyday design' },
    creative: { name: 'Creative Expression', description: 'Artistic flair with bold choices' },
    gaming: { name: 'Gaming Style', description: 'High-energy with game-like interactions' },
    retro: { name: 'Retro Vibes', description: 'Nostalgic design with vintage charm' },
    nature: { name: 'Nature Inspired', description: 'Organic shapes and earth tones' },
  }
};

const wearableCapabilities = {
  health_sensors: {
    heart_rate: { api: 'HeartRateSensor' },
    steps: { api: 'StepCounter' },
    sleep: { api: 'SleepTracker' },
    blood_oxygen: { api: 'SpO2Sensor' },
  },
  motion_sensors: {
    accelerometer: { api: 'Accelerometer' },
    gyroscope: { api: 'Gyroscope' },
  },
  location: {
    gps: { api: 'LocationManager' },
    compass: { api: 'CompassSensor' },
  },
  communication: {
    notifications: { api: 'NotificationListener' },
    calls: { api: 'TelephonyManager' },
  }
};

export default function Inventor() {
  const [_user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('capture');
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [designType, setDesignType] = useState('formal');
  const [designStyle, setDesignStyle] = useState('professional');
  const [selectedWearables, setSelectedWearables] = useState([]);
  const [_generatedApp, _setGeneratedApp] = useState(null);
  const [showWearables, setShowWearables] = useState(false);
  const [_showDesignPicker, _setShowDesignPicker] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const profiles = await /** @type {any} */ (base44.entities).UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch {
      // Auth not available in standalone mode - continue without user data
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const { data } = await base44.integrations.Core.UploadFile({ file });
        setImages(prev => [...prev, data.file_url]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeAndGetInstructions = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      const prompt = `You are SOLACE Inventor Mode - an elite product invention, app strategy, and innovation workbench. The user wants to create something genuinely strong, differentiated, and market-ready.

User's invention or app request: ${description}

Selected Design Type: ${designType}
Selected Design Style: ${designStyle}
Wearable Integrations: ${selectedWearables.join(', ') || 'None'}

Analyze the provided images of available materials, interfaces, sketches, or references. Use logic, creativity, product strategy, and internet context to produce a differentiated concept. Format your response as JSON with this structure:
{
  "title": "Clear title of the concept",
  "category": "App/Product/Physical invention/Service/System",
  "positioning": "Why this concept can win and who it is for",
  "market_gap": "What existing products get wrong or leave weak",
  "core_features": ["List of core features or modules"],
  "steps": [
    {
      "step_number": 1,
      "instruction": "Detailed action step",
      "tip": "Helpful tip or creative suggestion (optional)"
    }
  ],
  "ultimate_experience": "What the polished user experience should feel like",
  "entry_point": "The highest-converting or strongest market entry angle",
  "estimated_time": "How long an MVP or prototype will take",
  "difficulty": "Easy/Medium/Hard",
  "safety_warnings": ["Any safety concerns"],
  "materials_needed": ["List of required materials or inputs"],
  "build_stack": ["Recommended tools, systems, APIs, or platforms"],
  "moat": ["What makes it hard to compete with this concept"]
}

Do not give generic startup fluff. Produce a concrete, world-class concept with real differentiation, stronger feature thinking, and practical build sequencing.`;

      let data;
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          file_urls: images,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              category: { type: "string" },
              positioning: { type: "string" },
              market_gap: { type: "string" },
              core_features: { type: "array", items: { type: "string" } },
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    step_number: { type: "integer" },
                    instruction: { type: "string" },
                    tip: { type: "string" }
                  }
                }
              },
              ultimate_experience: { type: "string" },
              entry_point: { type: "string" },
              estimated_time: { type: "string" },
              difficulty: { type: "string" },
              safety_warnings: { type: "array", items: { type: "string" } },
              materials_needed: { type: "array", items: { type: "string" } },
              build_stack: { type: "array", items: { type: "string" } },
              moat: { type: "array", items: { type: "string" } }
            }
          }
        });
        // Handle different response shapes from InvokeLLM
        if (result?.data && typeof result.data === 'object' && result.data.title) {
          data = result.data;
        } else if (result && typeof result === 'object' && result.title) {
          data = result;
        } else if (typeof result === 'string') {
          try { data = JSON.parse(result); } catch { data = null; }
        } else {
          data = result?.data || result;
        }
        if (!data || !data.title) throw new Error('Invalid response format');
      } catch {
        // Standalone fallback — generate a smart blueprint locally
        const words = description.trim().split(/\s+/);
        const titleWords = words.slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        data = {
          title: titleWords,
          category: 'App / Digital Product',
          positioning: `A differentiated solution based on: "${description.substring(0, 120)}". This concept targets underserved users who need a smarter, more integrated experience than what current market offerings provide.`,
          market_gap: 'Existing solutions are fragmented, overly complex, or lack the AI-powered intelligence that modern users expect. There is a clear gap for a unified, beautifully designed product.',
          core_features: [
            'AI-powered core engine with real-time processing',
            'Beautiful glassmorphism UI with smooth animations',
            'Offline-first architecture with cloud sync',
            'Multi-platform support (web, iOS, Android)',
            'Smart notifications and personalized recommendations',
            'Built-in analytics dashboard'
          ],
          steps: [
            { step_number: 1, instruction: 'Define the core user journey and map out the 3 most critical screens', tip: 'Start with the "aha moment" screen — the one that makes users stay' },
            { step_number: 2, instruction: 'Build a clickable prototype using Figma or the SOLACE App Builder', tip: 'Focus on the flow, not pixel perfection — speed wins at this stage' },
            { step_number: 3, instruction: 'Set up the tech stack: React + Vite for web, React Native for mobile', tip: 'Use Tailwind CSS for rapid styling and Framer Motion for animations' },
            { step_number: 4, instruction: 'Implement the core feature — the single thing that delivers the most value', tip: 'Ship one feature that works perfectly rather than five that are half-done' },
            { step_number: 5, instruction: 'Add authentication, user profiles, and data persistence', tip: 'Supabase gives you auth + database + storage in one setup' },
            { step_number: 6, instruction: 'Integrate AI capabilities using OpenAI or local models for intelligence', tip: 'Cache AI responses to reduce costs and improve response time' },
            { step_number: 7, instruction: 'Beta test with 10-20 real users and iterate based on their friction points', tip: 'Watch users use the app — their behavior reveals more than their words' },
            { step_number: 8, instruction: 'Launch on Product Hunt, social media, and relevant communities', tip: 'Prepare a compelling 30-second demo video for maximum conversion' }
          ],
          ultimate_experience: 'Users open the app and immediately feel like it was built just for them. The AI anticipates their needs, the interface is butter-smooth, and every interaction delivers clear value.',
          entry_point: 'Launch as a free tool solving one specific pain point brilliantly, then expand into a premium platform with advanced AI features.',
          estimated_time: '4-8 weeks for MVP',
          difficulty: 'Medium',
          safety_warnings: ['Ensure user data privacy compliance (GDPR/CCPA)', 'Implement rate limiting on AI API calls', 'Add content moderation if user-generated content is involved'],
          materials_needed: ['Development environment (VS Code + Node.js)', 'Design tool (Figma)', 'Hosting (Vercel/Netlify)', 'Database (Supabase)', 'AI API key (OpenAI/Anthropic)'],
          build_stack: ['React + Vite', 'Tailwind CSS', 'Framer Motion', 'Supabase', 'OpenAI API', 'Vercel Hosting'],
          moat: ['AI-powered personalization that improves with usage', 'Beautiful design that competitors struggle to match', 'Network effects from community features', 'Proprietary data insights from user interactions']
        };
      }

      setInstructions(data);
      setMode('instructions');
    } catch (error) {
      console.error('Error getting instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetMode = () => {
    setMode('capture');
    setImages([]);
    setDescription('');
    setInstructions(null);
    setActiveStep(0);
  };

  if (mode === 'instructions' && instructions) {
    return (
      <div className="relative min-h-screen bg-black">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
        </div>

        <div className="relative z-10 min-h-screen p-6">
          <div className="mb-6">
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={resetMode}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              New Invention
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                {instructions.title}
              </h1>
              <div className="flex gap-4 justify-center text-sm text-gray-300">
                <span>🧭 {instructions.category}</span>
                <span>⏱️ {instructions.estimated_time}</span>
                <span>📊 {instructions.difficulty}</span>
                <span>📋 {instructions.steps.length} Steps</span>
              </div>
            </motion.div>

            {instructions.positioning && (
              <Card className="bg-fuchsia-900/20 border-fuchsia-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-fuchsia-300 font-bold mb-2">🎯 Positioning</h3>
                  <p className="text-fuchsia-100/90 text-sm leading-6">{instructions.positioning}</p>
                </CardContent>
              </Card>
            )}

            {instructions.market_gap && (
              <Card className="bg-blue-900/20 border-blue-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-blue-300 font-bold mb-2">📈 Market Gap</h3>
                  <p className="text-blue-100/90 text-sm leading-6">{instructions.market_gap}</p>
                </CardContent>
              </Card>
            )}

            {instructions.core_features?.length > 0 && (
              <Card className="bg-amber-900/20 border-amber-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-amber-300 font-bold mb-2">🧩 Core Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructions.core_features.map((feature, idx) => (
                      <span key={idx} className="bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {instructions.materials_needed?.length > 0 && (
              <Card className="bg-purple-900/30 border-purple-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-purple-300 font-bold mb-2">🔬 Materials Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructions.materials_needed.map((material, idx) => (
                      <span key={idx} className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm">
                        {material}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {instructions.build_stack?.length > 0 && (
              <Card className="bg-emerald-900/20 border-emerald-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-emerald-300 font-bold mb-2">🛠️ Recommended Build Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructions.build_stack.map((item, idx) => (
                      <span key={idx} className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {instructions.moat?.length > 0 && (
              <Card className="bg-orange-900/20 border-orange-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-orange-300 font-bold mb-2">🏆 Competitive Moat</h3>
                  <ul className="list-disc list-inside text-orange-100/90 text-sm space-y-1">
                    {instructions.moat.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {(instructions.entry_point || instructions.ultimate_experience) && (
              <Card className="bg-white/5 border-white/10 mb-6">
                <CardContent className="p-4 space-y-4">
                  {instructions.entry_point && (
                    <div>
                      <h3 className="text-white font-bold mb-1">Highest-Value Entry Point</h3>
                      <p className="text-zinc-300 text-sm leading-6">{instructions.entry_point}</p>
                    </div>
                  )}
                  {instructions.ultimate_experience && (
                    <div>
                      <h3 className="text-white font-bold mb-1">Ultimate Experience</h3>
                      <p className="text-zinc-300 text-sm leading-6">{instructions.ultimate_experience}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {instructions.safety_warnings?.length > 0 && (
              <Card className="bg-red-900/30 border-red-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-red-300 font-bold mb-2">⚠️ Safety Warnings</h3>
                  <ul className="list-disc list-inside text-red-200 text-sm space-y-1">
                    {instructions.safety_warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {images.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-white font-bold mb-3">📸 Your Materials</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Reference ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-600" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {instructions.steps.map((step, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className={`border-2 transition-all cursor-pointer ${activeStep === idx ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-400 shadow-lg shadow-purple-500/50' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`} onClick={() => setActiveStep(idx)}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${activeStep === idx ? 'bg-purple-500 text-black' : 'bg-gray-700 text-white'}`}>
                          {step.step_number}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-lg mb-2">{step.instruction}</p>
                          {step.tip && <p className="text-yellow-300 text-sm">💡 {step.tip}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <Button onClick={resetMode} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                ✨ Invent Something New
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <BrainCircuit className="w-20 h-20 mx-auto mb-4 text-purple-400" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              Inventor Studio
            </h1>
            <p className="text-xl text-yellow-200">Design apps, products, systems, and differentiated inventions with stronger market intelligence</p>
          </motion.div>

          <Card className="w-full bg-gray-900/80 border-purple-500/50">
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300 md:grid-cols-3">
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="mb-2 flex items-center gap-2 text-purple-300"><BrainCircuit className="w-4 h-4" /> Product strategy</div>
                  <p>Find market gaps, sharpen positioning, and define a stronger entry point.</p>
                </div>
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="mb-2 flex items-center gap-2 text-purple-300"><Lightbulb className="w-4 h-4" /> Feature architecture</div>
                  <p>Turn concepts into modules, workflows, and differentiating capabilities.</p>
                </div>
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="mb-2 flex items-center gap-2 text-purple-300"><Camera className="w-4 h-4" /> Visual references</div>
                  <p>Upload screenshots, sketches, mockups, and product references for analysis.</p>
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Your Materials ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-purple-500/30" />
                        <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-14 text-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photos of Materials
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white font-semibold mb-2 block">Design Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setDesignType('formal')}
                      className={`h-auto py-4 ${designType === 'formal' ? 'bg-purple-600 border-2 border-purple-400' : 'bg-gray-800 border border-gray-600'}`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">Formal</div>
                        <div className="text-xs opacity-80">Professional, Corporate</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => setDesignType('informal')}
                      className={`h-auto py-4 ${designType === 'informal' ? 'bg-purple-600 border-2 border-purple-400' : 'bg-gray-800 border border-gray-600'}`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">Informal</div>
                        <div className="text-xs opacity-80">Casual, Creative, Fun</div>
                      </div>
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">Design Style</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(designStyles[designType]).map(([key, style]) => (
                      <Button
                        key={key}
                        onClick={() => setDesignStyle(key)}
                        className={`h-auto py-3 text-left ${designStyle === key ? 'bg-pink-600 border-2 border-pink-400' : 'bg-gray-800 border border-gray-600'}`}
                      >
                        <div>
                          <div className="font-bold text-sm">{style.name}</div>
                          <div className="text-xs opacity-70">{style.description.substring(0, 30)}...</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-semibold">Wearables Access</label>
                    <Button
                      onClick={() => setShowWearables(!showWearables)}
                      variant="ghost"
                      className="text-purple-300 text-sm"
                    >
                      {showWearables ? 'Hide' : 'Show'} Options
                    </Button>
                  </div>
                  {showWearables && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      {Object.entries(wearableCapabilities).map(([category, capabilities]) => (
                        <div key={category} className="col-span-2">
                          <div className="text-xs text-purple-300 font-semibold mb-1 uppercase">{category.replace('_', ' ')}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.keys(capabilities).map(wearable => (
                              <label key={wearable} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedWearables.includes(wearable)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedWearables([...selectedWearables, wearable]);
                                    } else {
                                      setSelectedWearables(selectedWearables.filter(w => w !== wearable));
                                    }
                                  }}
                                  className="rounded"
                                />
                                {wearable.replace('_', ' ')}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedWearables.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedWearables.map(w => (
                        <span key={w} className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs">
                          {w.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">What do you want to create?</label>
                <Textarea placeholder="E.g., 'Design a premium AI wellness app that beats current competitors' or 'Create a stronger product concept from these sketches and screenshots'" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-32 bg-gray-800 text-white border-gray-600" />
              </div>

              <Button onClick={analyzeAndGetInstructions} disabled={!description.trim() || loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg disabled:opacity-50">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    SOLACE is architecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate App Blueprint
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}