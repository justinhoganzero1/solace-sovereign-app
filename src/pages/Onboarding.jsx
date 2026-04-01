import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedOracle from '../components/oracle/AnimatedOracle';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState([]);
  const [quests, setQuests] = useState([]);
  const [profile, setProfile] = useState(null);

  const interestOptions = [
    { id: 'safety', label: 'Personal Safety', icon: '🛡️' },
    { id: 'wellness', label: 'Mental Wellness', icon: '🧘' },
    { id: 'family', label: 'Family & Home', icon: '🏠' },
    { id: 'professional', label: 'Professional Growth', icon: '💼' },
    { id: 'creative', label: 'Creative Projects', icon: '🎨' },
    { id: 'social', label: 'Community & Social', icon: '👥' }
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        if (profiles[0].onboarding_completed) {
          navigate(createPageUrl('Home'));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const toggleInterest = (interestId) => {
    setInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const generateQuests = async () => {
    const questTemplates = {
      safety: [
        { title: 'Setup Emergency Contacts', description: 'Add 3 trusted contacts to Crisis Hub', action: 'add_emergency_contacts', page: 'CrisisHub' },
        { title: 'Explore Safety Features', description: 'Visit Ghost Follow and Evasion Navigator', action: 'explore_safety', page: 'SafetyCenter' }
      ],
      wellness: [
        { title: 'Track Your Emotions', description: 'Log your first emotion in Titan Heart', action: 'log_emotion', page: 'TitanHeart' },
        { title: 'Sync Your Device', description: 'Connect a wearable device', action: 'sync_device', page: 'TitanHeart' }
      ],
      family: [
        { title: 'Family Setup', description: 'Explore Family Hub features', action: 'visit_family_hub', page: 'FamilyHub' },
        { title: 'Pet Guardian', description: 'Set up Fatty Monitor for your pet', action: 'setup_pet', page: 'FamilyHub' }
      ],
      professional: [
        { title: 'Professional Tools', description: 'Visit Professional Hub', action: 'visit_professional', page: 'ProfessionalHub' },
        { title: 'Meet a Specialist', description: 'Chat with an AI specialist', action: 'chat_specialist', page: 'AllSpecialists' }
      ],
      creative: [
        { title: 'First Creation', description: 'Use Builder or Inventor mode', action: 'use_creator', page: 'Builder' },
        { title: 'Share Your Work', description: 'Post in Oracle\'s Council', action: 'forum_post', page: 'OracleCouncil' }
      ],
      social: [
        { title: 'Join the Community', description: 'Visit Oracle\'s Council', action: 'visit_council', page: 'OracleCouncil' },
        { title: 'Make a Friend', description: 'Connect with another user', action: 'add_friend', page: 'SovereignMall' }
      ]
    };

    const userQuests = [];
    let orderIndex = 0;
    
    for (const interest of interests) {
      if (questTemplates[interest]) {
        for (const template of questTemplates[interest]) {
          userQuests.push({
            quest_title: template.title,
            description: template.description,
            category: interest,
            target_page: template.page,
            target_action: template.action,
            reward_credits: 50,
            order_index: orderIndex++
          });
        }
      }
    }

    try {
      for (const quest of userQuests) {
        await base44.entities.Quest.create(quest);
      }
      
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          onboarding_completed: true,
          user_interests: interests
        });
      }
      
      await base44.entities.EmpireCredit.create({
        amount: 100,
        transaction_type: 'onboarding_complete',
        description: 'Completed onboarding'
      });
      
      toast.success('Welcome! +100 credits for joining!');
      navigate(createPageUrl('Home'));
    } catch (error) {
      toast.error('Error creating quests');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-gray-900/90 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <div className="text-center mb-4">
                <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Welcome to Oracle AI
                </CardTitle>
                <p className="text-gray-400 mt-2">Let's personalize your experience</p>
              </div>
              <Progress value={(step / 2) * 100} className="h-2" />
            </CardHeader>

            <CardContent>
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-purple-300 mb-4">What interests you?</h3>
                  <p className="text-gray-400 mb-6">Select all that apply (choose at least 2)</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {interestOptions.map((option) => (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all ${
                            interests.includes(option.id)
                              ? 'bg-purple-900/50 border-purple-500'
                              : 'bg-gray-800/50 border-gray-700 hover:border-purple-500/50'
                          }`}
                          onClick={() => toggleInterest(option.id)}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <Checkbox
                              checked={interests.includes(option.id)}
                              onCheckedChange={() => toggleInterest(option.id)}
                            />
                            <span className="text-2xl">{option.icon}</span>
                            <span className="text-white font-medium">{option.label}</span>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={interests.length < 2}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
                  >
                    Continue
                    <Zap className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="text-center mb-8">
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-purple-300 mb-2">Your Personalized Quests</h3>
                    <p className="text-gray-400">
                      We've created {interests.length * 2} quests based on your interests!
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-purple-300">
                      <Target className="w-5 h-5" />
                      <span className="font-medium">Complete quests to earn credits</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-400">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">Unlock exclusive features</span>
                    </div>
                    <div className="flex items-center gap-3 text-cyan-400">
                      <Trophy className="w-5 h-5" />
                      <span className="font-medium">Level up your Oracle experience</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={generateQuests}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                    >
                      Start My Journey (+100 Credits)
                      <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="w-full"
                    >
                      Go Back
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}