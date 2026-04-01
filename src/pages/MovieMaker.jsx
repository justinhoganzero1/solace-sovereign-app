import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '../utils';
import { ArrowLeft, Film, Play, Download, Loader2, Users, Sparkles, Clock, DollarSign, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MovieMaker() {
  const [user, setUser] = useState(null);
  const [movieScript, setMovieScript] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [duration, setDuration] = useState(10);
  const [avatarStyle, setAvatarStyle] = useState('8k_realistic');
  const [genre, setGenre] = useState('drama');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedMovie, setGeneratedMovie] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    calculateCost();
  }, [duration]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const calculateCost = () => {
    if (duration <= 10) {
      setEstimatedCost(0); // Free for videos up to 10 seconds
    } else {
      const chargeableMinutes = Math.ceil((duration - 10) / 60);
      setEstimatedCost(chargeableMinutes * 3); // $3 per minute over 10 seconds
    }
  };

  const avatarStyles = {
    '8k_realistic': {
      name: '8K Realistic',
      description: 'Photorealistic human avatars in 8K quality',
      icon: '👤',
      quality: 'ultra_high'
    },
    'animated_3d': {
      name: 'Animated 3D',
      description: 'Pixar-style 3D animated characters',
      icon: '🎭',
      quality: 'high'
    },
    'anime': {
      name: 'Anime Style',
      description: 'Japanese anime-style characters',
      icon: '🎌',
      quality: 'high'
    },
    'cartoon': {
      name: 'Cartoon',
      description: 'Western cartoon-style animation',
      icon: '🎨',
      quality: 'medium'
    },
    'claymation': {
      name: 'Claymation',
      description: 'Stop-motion clay animation style',
      icon: '🧱',
      quality: 'medium'
    }
  };

  const genres = [
    { id: 'drama', name: 'Drama', icon: '🎭' },
    { id: 'comedy', name: 'Comedy', icon: '😂' },
    { id: 'action', name: 'Action', icon: '💥' },
    { id: 'scifi', name: 'Sci-Fi', icon: '🚀' },
    { id: 'horror', name: 'Horror', icon: '👻' },
    { id: 'romance', name: 'Romance', icon: '💕' },
    { id: 'documentary', name: 'Documentary', icon: '📹' },
    { id: 'fantasy', name: 'Fantasy', icon: '🧙' }
  ];

  const handleGenerateMovie = async () => {
    if (!movieScript.trim() || !movieTitle.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Analyze script and generate scene breakdown
      setGenerationProgress(10);
      const sceneAnalysis = await analyzeScript(movieScript);

      // Step 2: Generate avatars for characters
      setGenerationProgress(25);
      const avatars = await generateAvatars(sceneAnalysis.characters, avatarStyle);

      // Step 3: Generate scenes with proxy rendering
      setGenerationProgress(40);
      const scenes = await generateScenes(sceneAnalysis.scenes, avatars, avatarStyle);

      // Step 4: Add voice synthesis
      setGenerationProgress(60);
      const voiceover = await generateVoiceover(sceneAnalysis.dialogue);

      // Step 5: Compose final movie
      setGenerationProgress(80);
      const finalMovie = await composeMovie({
        title: movieTitle,
        scenes,
        voiceover,
        duration,
        genre
      });

      // Step 6: Optimize and compress
      setGenerationProgress(95);
      const optimizedMovie = await optimizeMovie(finalMovie);

      setGeneratedMovie(optimizedMovie);
      setGenerationProgress(100);

      // Process payment if needed
      if (estimatedCost > 0) {
        await processPayment(estimatedCost);
      }

    } catch (error) {
      console.error('Movie generation error:', error);
      alert('Failed to generate movie. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeScript = async (script) => {
    const prompt = `Analyze this movie script and break it down into scenes, characters, and dialogue.

Script: ${script}

Duration: ${duration} seconds
Genre: ${genre}

Return JSON with:
{
  "scenes": [{"number": 1, "description": "...", "duration": 5, "setting": "..."}],
  "characters": [{"name": "...", "description": "...", "role": "..."}],
  "dialogue": [{"character": "...", "line": "...", "timestamp": 0}]
}`;

    const { data } = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          scenes: { type: "array" },
          characters: { type: "array" },
          dialogue: { type: "array" }
        }
      }
    });

    return JSON.parse(data.response);
  };

  const generateAvatars = async (characters, style) => {
    const avatars = {};
    
    for (const character of characters) {
      const prompt = `Generate a ${style.replace('_', ' ')} avatar for: ${character.name}
Description: ${character.description}
Style: ${avatarStyles[style].name}
Quality: ${avatarStyles[style].quality}`;

      // Use AI image generation with high resolution settings
      const { data } = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'image-generation-ultra',
        parameters: {
          resolution: style === '8k_realistic' ? '7680x4320' : '3840x2160',
          quality: 'maximum',
          style: style
        }
      });

      avatars[character.name] = {
        imageUrl: data.image_url,
        character: character
      };
    }

    return avatars;
  };

  const generateScenes = async (scenes, avatars, style) => {
    const generatedScenes = [];

    for (const scene of scenes) {
      // Use proxy rendering for lightweight processing
      const sceneData = await generateSceneWithProxy({
        sceneNumber: scene.number,
        description: scene.description,
        duration: scene.duration,
        setting: scene.setting,
        avatars: avatars,
        style: style
      });

      generatedScenes.push(sceneData);
    }

    return generatedScenes;
  };

  const generateSceneWithProxy = async (sceneConfig) => {
    // Lightweight proxy rendering - generates low-res preview first
    const proxyPreview = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate video scene: ${sceneConfig.description}
Setting: ${sceneConfig.setting}
Duration: ${sceneConfig.duration}s
Style: ${sceneConfig.style}
Use proxy rendering for efficiency`,
      model: 'video-generation-proxy',
      parameters: {
        resolution: '1920x1080', // Proxy resolution
        fps: 24,
        duration: sceneConfig.duration,
        quality: 'proxy'
      }
    });

    // Then upscale to final quality
    const finalScene = await base44.integrations.Core.InvokeLLM({
      prompt: 'Upscale to final quality',
      model: 'video-upscaler-8k',
      file_urls: [proxyPreview.data.video_url],
      parameters: {
        target_resolution: sceneConfig.style === '8k_realistic' ? '7680x4320' : '3840x2160',
        quality: 'maximum'
      }
    });

    return {
      sceneNumber: sceneConfig.sceneNumber,
      videoUrl: finalScene.data.video_url,
      duration: sceneConfig.duration
    };
  };

  const generateVoiceover = async (dialogue) => {
    const voiceFiles = [];

    for (const line of dialogue) {
      // Use advanced voice synthesis
      const voice = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate voice for character: ${line.character}
Line: "${line.line}"
Use natural, expressive voice synthesis`,
        model: 'voice-synthesis-ultra',
        parameters: {
          quality: 'studio',
          emotion: 'natural',
          language: 'auto-detect'
        }
      });

      voiceFiles.push({
        character: line.character,
        audioUrl: voice.data.audio_url,
        timestamp: line.timestamp
      });
    }

    return voiceFiles;
  };

  const composeMovie = async (movieData) => {
    // Compose all scenes, voiceover, and effects into final movie
    const composition = await base44.integrations.Core.InvokeLLM({
      prompt: `Compose final movie:
Title: ${movieData.title}
Genre: ${movieData.genre}
Total Duration: ${movieData.duration}s
Scenes: ${movieData.scenes.length}`,
      model: 'video-compositor',
      file_urls: [
        ...movieData.scenes.map(s => s.videoUrl),
        ...movieData.voiceover.map(v => v.audioUrl)
      ],
      parameters: {
        output_format: 'mp4',
        codec: 'h265',
        quality: 'maximum',
        audio_sync: true
      }
    });

    return {
      title: movieData.title,
      videoUrl: composition.data.video_url,
      duration: movieData.duration,
      genre: movieData.genre,
      generatedAt: new Date().toISOString()
    };
  };

  const optimizeMovie = async (movie) => {
    // Compress and optimize for delivery
    const optimized = await base44.integrations.Core.InvokeLLM({
      prompt: 'Optimize movie for streaming and download',
      model: 'video-optimizer',
      file_urls: [movie.videoUrl],
      parameters: {
        target_size: 'optimal',
        maintain_quality: true,
        streaming_optimized: true
      }
    });

    return {
      ...movie,
      videoUrl: optimized.data.video_url,
      fileSize: optimized.data.file_size,
      optimized: true
    };
  };

  const processPayment = async (amount) => {
    // Process payment for movies over 10 seconds
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Process payment for movie generation: $${amount}`,
        model: 'payment-processor',
        parameters: {
          amount: amount,
          currency: 'USD',
          description: `AI Movie Generation - ${duration}s`
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
      throw new Error('Payment processing failed');
    }
  };

  const handleDownload = () => {
    if (!generatedMovie) return;
    
    const link = document.createElement('a');
    link.href = generatedMovie.videoUrl;
    link.download = `${generatedMovie.title}.mp4`;
    link.click();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-black">
      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home', { appFace: 'solace', from: 'MovieMaker' })}>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Film className="w-20 h-20 mx-auto mb-4 text-purple-400" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              AI Movie Maker
            </h1>
            <p className="text-xl text-purple-200">
              Create full-length movies with 8K avatars and AI-powered animation
            </p>
          </motion.div>

          {!generatedMovie ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/80 border-purple-500/50">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="text-white font-semibold mb-2 block">Movie Title</label>
                    <Input
                      placeholder="Enter your movie title..."
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      className="bg-gray-800 text-white border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Duration (seconds)</label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="1"
                        max="7200"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                        className="bg-gray-800 text-white border-gray-600"
                      />
                      <div className="text-sm text-purple-300">
                        {duration <= 10 ? (
                          <span className="text-green-400">✓ Free</span>
                        ) : (
                          <span className="text-yellow-400">${estimatedCost}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Free up to 10 seconds, then $3/minute
                    </p>
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Avatar Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(avatarStyles).map(([key, style]) => (
                        <Button
                          key={key}
                          onClick={() => setAvatarStyle(key)}
                          className={`h-auto py-3 text-left ${avatarStyle === key ? 'bg-purple-600 border-2 border-purple-400' : 'bg-gray-800 border border-gray-600'}`}
                        >
                          <div>
                            <div className="text-lg mb-1">{style.icon}</div>
                            <div className="font-bold text-sm">{style.name}</div>
                            <div className="text-xs opacity-70">{style.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Genre</label>
                    <div className="grid grid-cols-4 gap-2">
                      {genres.map((g) => (
                        <Button
                          key={g.id}
                          onClick={() => setGenre(g.id)}
                          className={`h-auto py-2 ${genre === g.id ? 'bg-pink-600 border-2 border-pink-400' : 'bg-gray-800 border border-gray-600'}`}
                        >
                          <div className="text-center">
                            <div className="text-xl">{g.icon}</div>
                            <div className="text-xs">{g.name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-purple-500/50">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="text-white font-semibold mb-2 block">Movie Script</label>
                    <Textarea
                      placeholder="Write your movie script here... Describe the story, characters, scenes, and dialogue. The AI will handle everything else automatically."
                      value={movieScript}
                      onChange={(e) => setMovieScript(e.target.value)}
                      className="min-h-96 bg-gray-800 text-white border-gray-600"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateMovie}
                    disabled={!movieScript.trim() || !movieTitle.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating... {generationProgress}%
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Movie {estimatedCost > 0 && `($${estimatedCost})`}
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-gray-900/80 border-purple-500/50">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">{generatedMovie.title}</h2>
                  <p className="text-purple-300">Your movie is ready!</p>
                </div>

                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={generatedMovie.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <div className="text-white font-bold">{generatedMovie.duration}s</div>
                    <div className="text-xs text-gray-400">Duration</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <Film className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <div className="text-white font-bold capitalize">{generatedMovie.genre}</div>
                    <div className="text-xs text-gray-400">Genre</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <div className="text-white font-bold">{avatarStyles[avatarStyle].name}</div>
                    <div className="text-xs text-gray-400">Style</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Movie
                  </Button>
                  <Button
                    onClick={() => {
                      setGeneratedMovie(null);
                      setMovieScript('');
                      setMovieTitle('');
                      setGenerationProgress(0);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-900/20 border-blue-500 mt-6">
            <CardContent className="p-4">
              <h3 className="text-blue-300 font-bold mb-2">✨ Features</h3>
              <ul className="text-blue-100/90 text-sm space-y-1 list-disc list-inside">
                <li>8K photorealistic avatars with lifelike animations</li>
                <li>Multiple animation styles: realistic, 3D, anime, cartoon, claymation</li>
                <li>Up to 120 minutes (7200 seconds) movie length</li>
                <li>Lightweight proxy rendering for fast generation</li>
                <li>AI-powered voice synthesis with natural dialogue</li>
                <li>Automatic scene composition and editing</li>
                <li>Free for videos up to 10 seconds, $3/minute after</li>
                <li>Studio-quality output optimized for streaming</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
