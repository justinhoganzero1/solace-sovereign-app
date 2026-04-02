import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Trophy, Star, Target, Award, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { FuturisticOrb } from '../components/ui/futuristic-cloud';

export default function EmpireProfile() {
  const [user, setUser] = useState(null);
  const [empireLevel, setEmpireLevel] = useState(null);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const levels = await base44.entities.EmpireLevel.filter({ created_by: currentUser.email });
      if (levels.length > 0) {
        setEmpireLevel(levels[0]);
      } else {
        const newLevel = await base44.entities.EmpireLevel.create({
          level: 1,
          xp: 0,
          xp_to_next_level: 100
        });
        setEmpireLevel(newLevel);
      }

      const userBadges = await base44.entities.Badge.filter({ created_by: currentUser.email });
      setBadges(userBadges);

      const userAchievements = await base44.entities.Achievement.filter({ created_by: currentUser.email });
      setAchievements(userAchievements);

      const userReferrals = await base44.entities.Referral.filter({ created_by: currentUser.email });
      setReferrals(userReferrals);

      // Load recommendations
      try {
        const recResponse = await base44.functions.invoke('generateRecommendations');
        setRecommendations(recResponse.data?.recommendations || []);
      } catch (error) {
        console.log('Recommendations not available');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const rarityColors = {
    common: 'bg-gray-600',
    rare: 'bg-blue-600',
    epic: 'bg-purple-600',
    legendary: 'bg-yellow-600'
  };

  const progressPercentage = empireLevel ? (empireLevel.xp / empireLevel.xp_to_next_level) * 100 : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0 opacity-20">
        <AnimatedOracle gender="female" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FuturisticOrb size="sm" glowColor="yellow">
                <ArrowLeft className="w-6 h-6 text-yellow-400" />
              </FuturisticOrb>
            </motion.button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(250,204,21,0.9)]" />
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-2">
            Empire Profile
          </h1>
          <p className="text-xl text-gray-300">{user?.full_name || 'Loading...'}</p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Level Progress */}
          <Card className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 backdrop-blur-sm border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-3xl text-yellow-400 flex items-center gap-3">
                <Zap className="w-8 h-8" />
                Level {empireLevel?.level || 1} - {empireLevel?.rank_title || 'Initiate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>{empireLevel?.xp || 0} XP</span>
                    <span>{empireLevel?.xp_to_next_level || 100} XP to next level</span>
                  </div>
                  <Progress value={progressPercentage} className="h-4 bg-gray-800" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">{empireLevel?.total_quests_completed || 0}</div>
                    <div className="text-sm text-gray-400">Quests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{empireLevel?.total_forum_posts || 0}</div>
                    <div className="text-sm text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{empireLevel?.total_referrals || 0}</div>
                    <div className="text-sm text-gray-400">Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{badges.length}</div>
                    <div className="text-sm text-gray-400">Badges</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="bg-gray-900/70 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Earned Badges ({badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: 1.05 }}
                      className={`p-4 rounded-lg ${rarityColors[badge.rarity]} text-white text-center`}
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-bold">{badge.badge_name}</div>
                      <div className="text-xs opacity-80">{badge.description}</div>
                      <Badge className="mt-2 bg-black/30">{badge.rarity}</Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Complete activities to earn badges!</p>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-gray-900/70 backdrop-blur-sm border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <div className="font-bold text-white">{achievement.achievement_name}</div>
                            <div className="text-sm text-gray-400">{achievement.description}</div>
                          </div>
                        </div>
                        {achievement.completed && (
                          <Badge className="bg-green-600">Completed</Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{achievement.progress} / {achievement.target}</span>
                          <span>{Math.floor((achievement.progress / achievement.target) * 100)}%</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Your achievements will appear here!</p>
              )}
            </CardContent>
          </Card>

          {/* Referrals */}
          <Card className="bg-gray-900/70 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Referrals ({referrals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Invite friends to earn 100 XP + 50 credits per successful referral!</p>
              {referrals.length > 0 && (
                <div className="space-y-2">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="p-3 bg-gray-800/50 rounded flex justify-between items-center">
                      <span className="text-gray-300">{ref.referred_email}</span>
                      <Badge className={ref.referral_status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                        {ref.referral_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personalized Recommendations */}
          {recommendations.length > 0 && (
            <Card className="bg-gray-900/70 backdrop-blur-sm border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-pink-400 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  Recommended For You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white mb-1">{rec.title}</div>
                          <div className="text-sm text-gray-400">{rec.reason}</div>
                        </div>
                        <Badge className="bg-pink-600">
                          {Math.floor(rec.relevance * 100)}% match
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}