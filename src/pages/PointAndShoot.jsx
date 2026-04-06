import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ArrowLeft, Zap, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';

export default function PointAndShoot() {
  const [_user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('capture'); // 'capture' or 'instructions'
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
      const prompt = `You are Oracle, an advanced AI assistant. The user is using Point and Shoot mode and needs step-by-step visual instructions.

User's request: ${description}

Analyze the provided images carefully and provide detailed, easy-to-follow instructions. Format your response as JSON with this structure:
{
  "title": "Clear title of what we're doing",
  "steps": [
    {
      "step_number": 1,
      "instruction": "Detailed instruction text",
      "tip": "Helpful tip or warning (optional)"
    }
  ],
  "estimated_time": "How long this will take",
  "difficulty": "Easy/Medium/Hard",
  "safety_warnings": ["Any safety concerns"]
}

Be thorough, practical, and include safety information where relevant.`;

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
            safety_warnings: {
              type: "array",
              items: { type: "string" }
            }
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
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
        </div>

        <div className="relative z-10 min-h-screen p-6">
          <div className="mb-6">
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={resetMode}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              New Task
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                {instructions.title}
              </h1>
              <div className="flex gap-4 justify-center text-sm text-gray-300">
                <span>⏱️ {instructions.estimated_time}</span>
                <span>📊 {instructions.difficulty}</span>
                <span>📋 {instructions.steps.length} Steps</span>
              </div>
            </motion.div>

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

            {/* Reference Images */}
            {images.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-white font-bold mb-3">📸 Your Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-600"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step-by-step instructions */}
            <div className="space-y-4">
              {instructions.steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    className={`border-2 transition-all cursor-pointer ${
                      activeStep === idx
                        ? 'bg-gradient-to-br from-cyan-900/50 to-purple-900/50 border-cyan-400 shadow-lg shadow-cyan-500/50'
                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                            activeStep === idx
                              ? 'bg-cyan-500 text-black'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          {step.step_number}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-lg mb-2">{step.instruction}</p>
                          {step.tip && (
                            <p className="text-yellow-300 text-sm">💡 {step.tip}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                onClick={resetMode}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                ✨ Start New Task
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="text-6xl mb-4">📸</div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
              Point & Shoot
            </h1>
            <p className="text-xl text-yellow-200">
              Show me what you need help with
            </p>
          </motion.div>

          <Card className="w-full bg-gray-900/80 border-cyan-500/50">
            <CardContent className="p-6 space-y-6">
              {/* Images Preview */}
              {images.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Your Photos ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-cyan-500/30"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Buttons */}
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white h-14 text-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photos
                </Button>
              </div>

              {/* Description */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  What do you need help with?
                </label>
                <Textarea
                  placeholder="E.g., 'How do I change this flat tire?' or 'Help me build a bookshelf from these materials'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32 bg-gray-800 text-white border-gray-600"
                />
              </div>

              {/* Analyze Button */}
              <Button
                onClick={analyzeAndGetInstructions}
                disabled={images.length === 0 || !description.trim() || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Oracle is analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Get Instructions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <p className="text-gray-400 text-sm text-center mt-6">
            Take photos of what you need help with, tell Oracle what you want to do, and get step-by-step visual instructions
          </p>
        </div>
      </div>
    </div>
  );
}