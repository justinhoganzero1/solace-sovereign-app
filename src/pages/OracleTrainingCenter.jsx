import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Brain, Smile, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function OracleTrainingCenter() {
  const [_user, setUser] = useState(null);
  const [training, setTraining] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [memories, setMemories] = useState([]);
  const [newTraining, setNewTraining] = useState({ type: 'communication_style', data: '' });
  const [newPersona, setNewPersona] = useState({
    name: '',
    mood: 'casual',
    formality: 5,
    verbosity: 'balanced',
    traits: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const userTraining = await base44.entities.OracleTraining.filter({ created_by: currentUser.email });
      setTraining(userTraining);

      const userPersonas = await base44.entities.OraclePersona.filter({ created_by: currentUser.email });
      setPersonas(userPersonas);

      const userMemories = await base44.entities.OracleMemory.filter({ created_by: currentUser.email });
      setMemories(userMemories.sort((a, b) => b.importance - a.importance));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddTraining = async () => {
    try {
      await base44.entities.OracleTraining.create({
        training_type: newTraining.type,
        training_data: newTraining.data,
        active: true
      });
      toast.success('Training data added!');
      setNewTraining({ type: 'communication_style', data: '' });
      loadData();
    } catch {
      toast.error('Failed to add training');
    }
  };

  const handleCreatePersona = async () => {
    try {
      await base44.entities.OraclePersona.create({
        persona_name: newPersona.name,
        mood: newPersona.mood,
        formality_level: newPersona.formality,
        verbosity: newPersona.verbosity,
        personality_traits: newPersona.traits.split(',').map(t => t.trim()).filter(t => t),
        is_active: false
      });
      toast.success('Persona created!');
      setNewPersona({ name: '', mood: 'casual', formality: 5, verbosity: 'balanced', traits: '' });
      loadData();
    } catch {
      toast.error('Failed to create persona');
    }
  };

  const handleActivatePersona = async (personaId) => {
    try {
      // Deactivate all others
      for (const p of personas) {
        await base44.entities.OraclePersona.update(p.id, { is_active: false });
      }
      // Activate selected
      await base44.entities.OraclePersona.update(personaId, { is_active: true });
      toast.success('Persona activated!');
      loadData();
    } catch {
      toast.error('Failed to activate');
    }
  };

  const moodEmojis = {
    professional: '💼',
    casual: '😊',
    witty: '😄',
    empathetic: '❤️',
    philosophical: '🤔',
    energetic: '⚡',
    calm: '🧘',
    mysterious: '🔮'
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0 opacity-20">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FuturisticOrb size="sm" glowColor="cyan">
                <ArrowLeft className="w-6 h-6 text-cyan-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Brain className="w-20 h-20 text-cyan-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(34,211,238,0.9)]" />
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2">
            Oracle Training Center
          </h1>
          <p className="text-xl text-gray-300">Personalize Your Oracle Experience</p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="personas" className="space-y-6">
            <TabsList className="bg-gray-800/50 backdrop-blur-sm w-full justify-start">
              <TabsTrigger value="personas" className="flex items-center gap-2">
                <Smile className="w-4 h-4" />
                Personas
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Training
              </TabsTrigger>
              <TabsTrigger value="memories" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Memories
              </TabsTrigger>
            </TabsList>

            {/* Personas Tab */}
            <TabsContent value="personas" className="space-y-6">
              <Card className="bg-gray-900/70 backdrop-blur-sm border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Create New Persona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Persona name (e.g., Work Mode, Chill Vibes)"
                    value={newPersona.name}
                    onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Select value={newPersona.mood} onValueChange={(v) => setNewPersona({ ...newPersona, mood: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">💼 Professional</SelectItem>
                      <SelectItem value="casual">😊 Casual</SelectItem>
                      <SelectItem value="witty">😄 Witty</SelectItem>
                      <SelectItem value="empathetic">❤️ Empathetic</SelectItem>
                      <SelectItem value="philosophical">🤔 Philosophical</SelectItem>
                      <SelectItem value="energetic">⚡ Energetic</SelectItem>
                      <SelectItem value="calm">🧘 Calm</SelectItem>
                      <SelectItem value="mysterious">🔮 Mysterious</SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Formality Level: {newPersona.formality}/10</label>
                    <Slider
                      value={[newPersona.formality]}
                      onValueChange={(v) => setNewPersona({ ...newPersona, formality: v[0] })}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <Select value={newPersona.verbosity} onValueChange={(v) => setNewPersona({ ...newPersona, verbosity: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Response length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Personality traits (comma separated, e.g., humorous, supportive)"
                    value={newPersona.traits}
                    onChange={(e) => setNewPersona({ ...newPersona, traits: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Button onClick={handleCreatePersona} className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Create Persona
                  </Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {personas.map((persona) => (
                  <Card key={persona.id} className={`bg-gray-900/70 backdrop-blur-sm ${persona.is_active ? 'border-cyan-500' : 'border-gray-700'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{moodEmojis[persona.mood]}</span>
                          <CardTitle className="text-lg text-cyan-300">{persona.persona_name}</CardTitle>
                        </div>
                        {persona.is_active && <Badge className="bg-cyan-600">Active</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-gray-400">
                        <div>Mood: {persona.mood}</div>
                        <div>Formality: {persona.formality_level}/10</div>
                        <div>Style: {persona.verbosity}</div>
                        {persona.personality_traits?.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {persona.personality_traits.map((trait, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs">{trait}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {!persona.is_active && (
                        <Button onClick={() => handleActivatePersona(persona.id)} size="sm" className="w-full mt-4">
                          Activate
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training" className="space-y-6">
              <Card className="bg-gray-900/70 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">Add Training Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={newTraining.type} onValueChange={(v) => setNewTraining({ ...newTraining, type: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="communication_style">Communication Style</SelectItem>
                      <SelectItem value="knowledge_domain">Knowledge Domain</SelectItem>
                      <SelectItem value="preferences">Preferences</SelectItem>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="humor_style">Humor Style</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Describe how Oracle should respond... (e.g., 'Always use tech metaphors', 'I prefer concise answers')"
                    value={newTraining.data}
                    onChange={(e) => setNewTraining({ ...newTraining, data: e.target.value })}
                    className="bg-gray-800 border-gray-700 min-h-32"
                  />
                  <Button onClick={handleAddTraining} className="w-full bg-purple-600 hover:bg-purple-700">
                    Add Training
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {training.map((t) => (
                  <Card key={t.id} className="bg-gray-900/70 backdrop-blur-sm border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="mb-2">{t.training_type}</Badge>
                          <p className="text-gray-300">{t.training_data}</p>
                        </div>
                        <Badge className={t.active ? 'bg-green-600' : 'bg-gray-600'}>
                          {t.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Memories Tab */}
            <TabsContent value="memories" className="space-y-6">
              <Card className="bg-gray-900/70 backdrop-blur-sm border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Oracle's Memories About You</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Oracle automatically remembers important details from your conversations. ({memories.length} memories stored)
                  </p>
                  <div className="space-y-3">
                    {memories.slice(0, 20).map((memory) => (
                      <div key={memory.id} className="p-3 bg-gray-800/50 rounded">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-yellow-900">{memory.memory_type}</Badge>
                          <span className="text-xs text-gray-500">Importance: {memory.importance}/10</span>
                        </div>
                        <p className="text-gray-300">{memory.content}</p>
                        {memory.tags?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {memory.tags.map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-700 rounded">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}