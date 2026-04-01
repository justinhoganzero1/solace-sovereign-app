import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '../utils';
import { Upload, ArrowLeft, Zap, X, Loader2, Hammer, ClipboardList, ShieldAlert, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';

export default function Builder() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('capture');
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
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
    if (images.length === 0 || !description.trim()) return;

    setLoading(true);
    try {
      const prompt = `You are SOLACE Builder Mode - an expert build planner for construction, fabrication, installation, and real-world project execution. The user needs a practical project plan, not generic inspiration.

User's request: ${description}

Analyze the provided images carefully and provide detailed building instructions. Format your response as JSON with this structure:
{
  "title": "Clear title of the building project",
  "project_brief": "What is being built, for whom, and what success looks like",
  "site_readiness": ["Prep work, measurements, permissions, or checks required before starting"],
  "tooling": ["Key tools required"],
  "steps": [
    {
      "step_number": 1,
      "instruction": "Detailed instruction text",
      "tip": "Helpful tip or warning (optional)"
    }
  ],
  "quality_checks": ["Checks to confirm the build is solid and safe"],
  "estimated_time": "How long this will take",
  "difficulty": "Easy/Medium/Hard",
  "safety_warnings": ["Any safety concerns"],
  "materials_needed": ["List of required materials"],
  "cost_outlook": "Budget expectation or major cost drivers"
}

Be thorough, practical, sequence-aware, and include the major risks that could cause a failed build or unsafe result.`;

      const { data } = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: images,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            project_brief: { type: "string" },
            site_readiness: { type: "array", items: { type: "string" } },
            tooling: { type: "array", items: { type: "string" } },
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
            quality_checks: { type: "array", items: { type: "string" } },
            estimated_time: { type: "string" },
            difficulty: { type: "string" },
            safety_warnings: { type: "array", items: { type: "string" } },
            materials_needed: { type: "array", items: { type: "string" } },
            cost_outlook: { type: "string" }
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
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
          <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
        </div>

        <div className="relative z-10 min-h-screen p-6">
          <div className="mb-6">
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={resetMode}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2">
                {instructions.title}
              </h1>
              <div className="flex gap-4 justify-center text-sm text-gray-300">
                <span>⏱️ {instructions.estimated_time}</span>
                <span>📊 {instructions.difficulty}</span>
                <span>📋 {instructions.steps.length} Steps</span>
              </div>
            </motion.div>

            {instructions.project_brief && (
              <Card className="bg-white/5 border-white/10 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-white font-bold mb-2">Project Brief</h3>
                  <p className="text-zinc-300 text-sm leading-6">{instructions.project_brief}</p>
                </CardContent>
              </Card>
            )}

            {instructions.site_readiness?.length > 0 && (
              <Card className="bg-blue-900/20 border-blue-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-blue-300 font-bold mb-2">📐 Site Readiness</h3>
                  <ul className="list-disc list-inside text-blue-100/90 text-sm space-y-1">
                    {instructions.site_readiness.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {instructions.materials_needed?.length > 0 && (
              <Card className="bg-amber-900/30 border-amber-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-amber-300 font-bold mb-2">🪵 Materials Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructions.materials_needed.map((material, idx) => (
                      <span key={idx} className="bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-sm">
                        {material}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {instructions.tooling?.length > 0 && (
              <Card className="bg-emerald-900/20 border-emerald-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-emerald-300 font-bold mb-2">🛠️ Tooling</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructions.tooling.map((tool, idx) => (
                      <span key={idx} className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-sm">
                        {tool}
                      </span>
                    ))}
                  </div>
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

            {(instructions.quality_checks?.length > 0 || instructions.cost_outlook) && (
              <Card className="bg-orange-900/20 border-orange-500 mb-6">
                <CardContent className="p-4 space-y-4">
                  {instructions.quality_checks?.length > 0 && (
                    <div>
                      <h3 className="text-orange-300 font-bold mb-2">✅ Quality Checks</h3>
                      <ul className="list-disc list-inside text-orange-100/90 text-sm space-y-1">
                        {instructions.quality_checks.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {instructions.cost_outlook && (
                    <div>
                      <h3 className="text-orange-300 font-bold mb-2">💸 Cost Outlook</h3>
                      <p className="text-orange-100/90 text-sm leading-6">{instructions.cost_outlook}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {images.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-white font-bold mb-3">📸 Your Photos</h3>
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
                  <Card className={`border-2 transition-all cursor-pointer ${activeStep === idx ? 'bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-400 shadow-lg shadow-amber-500/50' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`} onClick={() => setActiveStep(idx)}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${activeStep === idx ? 'bg-amber-500 text-black' : 'bg-gray-700 text-white'}`}>
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
              <Button onClick={resetMode} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                ✨ Start New Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Hammer className="w-20 h-20 mx-auto mb-4 text-amber-400" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-4">
              Builder Command
            </h1>
            <p className="text-xl text-yellow-200">Plan physical builds with real sequencing, risk checks, materials, and execution logic</p>
          </motion.div>

          <Card className="w-full bg-gray-900/80 border-amber-500/50">
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300 md:grid-cols-3">
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="mb-2 flex items-center gap-2 text-amber-300"><ClipboardList className="w-4 h-4" /> Project planning</div>
                  <p>Translate a rough idea into a build brief, prep list, and execution sequence.</p>
                </div>
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="mb-2 flex items-center gap-2 text-amber-300"><ShieldAlert className="w-4 h-4" /> Risk control</div>
                  <p>Surface safety issues, weak assumptions, and quality checks before work starts.</p>
                </div>
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="mb-2 flex items-center gap-2 text-amber-300"><Ruler className="w-4 h-4" /> Execution detail</div>
                  <p>Use photos and references to reason about materials, setup, and build practicality.</p>
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Your Photos ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-amber-500/30" />
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
                <Button onClick={() => fileInputRef.current?.click()} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-14 text-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photos
                </Button>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">What do you want to build?</label>
                <Textarea placeholder="E.g., 'Build a compact garden deck in this space' or 'Help me plan the safest and strongest version of this shelving project'" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-32 bg-gray-800 text-white border-gray-600" />
              </div>

              <Button onClick={analyzeAndGetInstructions} disabled={images.length === 0 || !description.trim() || loading} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white h-14 text-lg disabled:opacity-50">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Planning build...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Build Plan
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