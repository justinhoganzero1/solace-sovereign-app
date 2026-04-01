import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '../utils';
import { Upload, ArrowLeft, Zap, X, Loader2, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';

export default function Mechanic() {
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
    if (!description.trim()) {
      alert('Please describe the problem');
      return;
    }

    setLoading(true);
    try {
      const prompt = `You are Oracle's Mechanic Mode - an expert automotive and mechanical repair assistant covering:
  - A-Grade Motor Mechanics
  - Diesel Engineering
  - Mechanical Engineering
  - Fitter & Turner work
  - Gas Mechanic systems
  - Auto Electrical Engineering
  - Aviation Engineering

  The user needs help with a mechanical issue.

User's request: ${description}

Analyze the provided images carefully and provide detailed mechanical repair instructions. Format your response as JSON with this structure:
{
  "title": "Clear title of the repair task",
  "steps": [
    {
      "step_number": 1,
      "instruction": "Detailed instruction text",
      "tip": "Helpful tip or warning (optional)"
    }
  ],
  "estimated_time": "How long this will take",
  "difficulty": "Easy/Medium/Hard",
  "safety_warnings": ["Any safety concerns"],
  "tools_needed": ["List of required tools"]
}

Be thorough, practical, and include all necessary safety information for mechanical work.`;

      const { data } = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: images,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
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
            estimated_time: { type: "string" },
            difficulty: { type: "string" },
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
              New Repair
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
                {instructions.title}
              </h1>
              <div className="flex gap-4 justify-center text-sm text-gray-300">
                <span>⏱️ {instructions.estimated_time}</span>
                <span>📊 {instructions.difficulty}</span>
                <span>📋 {instructions.steps.length} Steps</span>
              </div>
            </motion.div>

            {instructions.tools_needed?.length > 0 && (
              <Card className="bg-blue-900/30 border-blue-500 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-blue-300 font-bold mb-2">🔧 Tools Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructions.tools_needed.map((tool, idx) => (
                      <span key={idx} className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm">
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
                  <Card className={`border-2 transition-all cursor-pointer ${activeStep === idx ? 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-400 shadow-lg shadow-orange-500/50' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`} onClick={() => setActiveStep(idx)}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${activeStep === idx ? 'bg-orange-500 text-black' : 'bg-gray-700 text-white'}`}>
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
              <Button onClick={resetMode} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                ✨ Start New Repair
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
            <Wrench className="w-20 h-20 mx-auto mb-4 text-orange-400" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-4">
              Mechanic Mode
            </h1>
            <p className="text-xl text-yellow-200">Show me what needs fixing</p>
          </motion.div>

          <Card className="w-full bg-gray-900/80 border-orange-500/50">
            <CardContent className="p-6 space-y-6">
              {images.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Your Photos ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-orange-500/30" />
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
                <Button onClick={() => fileInputRef.current?.click()} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-14 text-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photos
                </Button>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">What needs to be repaired?</label>
                <Textarea placeholder="E.g., 'Flat tire on my car' or 'Engine making strange noise'" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-32 bg-gray-800 text-white border-gray-600" />
              </div>

              <Button 
                onClick={analyzeAndGetInstructions} 
                disabled={!description.trim() || loading} 
                className={`w-full h-14 text-lg transition-all ${
                  !description.trim() || loading
                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Get Repair Instructions
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