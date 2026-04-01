import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '../utils';
import { Sparkles, MessageSquare, Zap, Languages, Settings, Shield, Trophy, Users, LogOut, GripHorizontal, BrainCircuit } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([
    { label: 'Chat Oracle', page: 'Chat', icon: MessageSquare, color: 'yellow', isMain: true, appFace: 'oracle' },
    { label: 'Specialists', page: 'AllSpecialists', icon: BrainCircuit, color: 'amber', appFace: 'solace' },
    { label: 'Luma Video Editor', page: 'VideoEditor', icon: Sparkles, color: 'purple', appFace: 'luma' },
    { label: 'Voice Generator', page: 'VoiceGenerator', icon: Sparkles, color: 'purple', appFace: 'solace' },
    { label: 'Movie Maker', page: 'MovieMaker', icon: Sparkles, color: 'purple', appFace: 'solace' },
    { label: 'Media Library', page: 'MediaLibrary', icon: Sparkles, color: 'cyan', appFace: 'library' },
    { label: 'Live Vision', page: 'LiveVision', icon: Sparkles, color: 'cyan', appFace: 'vision' },
    { label: 'Mechanic', page: 'Mechanic', icon: Zap, color: 'orange', appFace: 'mechanic' },
    { label: 'Builder', page: 'Builder', icon: Zap, color: 'yellow', appFace: 'builder' },
    { label: 'Handyman', page: 'Handyman', icon: Zap, color: 'green', appFace: 'builder' },
    { label: 'Inventor', page: 'Inventor', icon: Sparkles, color: 'purple', appFace: 'inventor' },
    { label: 'Avatar', page: 'AvatarCustomizer', icon: Sparkles, color: 'pink', appFace: 'solace' },
    { label: 'Crisis Hub', page: 'CrisisHub', icon: Shield, color: 'red', appFace: 'solace' },
    { label: 'Titan Heart', page: 'TitanHeart', icon: Zap, color: 'pink', appFace: 'solace' },
    { label: 'Mind Hub', page: 'MindHub', icon: Zap, color: 'pink', appFace: 'solace' },
    { label: 'Professional Hub', page: 'ProfessionalHub', icon: Sparkles, color: 'purple', appFace: 'solace' },
    { label: 'Family Hub', page: 'FamilyHub', icon: MessageSquare, color: 'yellow', appFace: 'solace' },
    { label: 'Phygital World', page: 'PhygitalHub', icon: Sparkles, color: 'cyan', appFace: 'solace' },
    { label: 'Sovereign Empire', page: 'SovereignEmpire', icon: Shield, color: 'purple', appFace: 'solace' },
    { label: 'Sovereign Mall', page: 'SovereignMall', icon: Languages, color: 'purple', appFace: 'solace' },
    { label: 'Tier System', page: 'TierSystem', icon: Shield, color: 'yellow', appFace: 'solace' },
    { label: "Oracle's Council", page: 'OracleCouncil', icon: MessageSquare, color: 'purple', appFace: 'solace' },
    { label: 'Empire Profile', page: 'EmpireProfile', icon: Trophy, color: 'yellow', appFace: 'solace' },
    { label: 'Training Center', page: 'OracleTrainingCenter', icon: Sparkles, color: 'cyan', appFace: 'solace' },
    { label: 'Community Hub', page: 'CommunityHub', icon: Users, color: 'green', appFace: 'solace' },
    { label: 'Settings', page: 'Settings', icon: Settings, color: 'green', appFace: 'solace' },
    { label: 'Logout', page: 'Logout', icon: LogOut, color: 'red' },
    ]);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-yellow-300" />
        </motion.div>
      </div>
    );
    }

    const handleLogout = async () => {
      await base44.auth.logout(createPageUrl('SplashLanding'));
    };

    const handleDragEnd = (result) => {
      const { source, destination } = result;
      if (!destination) return;

      const newItems = Array.from(widgets);
      const [reorderedWidget] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedWidget);

      setWidgets(newItems);
    };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,193,77,0.22),_transparent_28%),linear-gradient(180deg,_#17120b_0%,_#090909_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
              <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-14"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-amber-200/90">
            SOLACE Command Surface
          </div>
          <h1 className="bg-gradient-to-r from-amber-100 via-amber-300 to-orange-400 bg-clip-text text-6xl font-black tracking-[0.22em] text-transparent md:text-8xl mb-4">
            SOLACE
          </h1>
          <p className="text-xl md:text-2xl text-zinc-200">
            Your Sovereign AI Companion
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-zinc-400">
            Enter specialists, tools, creation systems, live camera assistance, and your personal media workspace from one retained in-app command hub.
          </p>
        </motion.div>

        {/* Widget Grid - All Visible */}
        <div className="w-full max-w-6xl px-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets" direction="horizontal" type="WIDGET">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-3 md:grid-cols-5 gap-6 justify-items-center"
                >
                  {widgets.map((widget, idx) => {
                    const Icon = widget.icon;
                    const isMainWidget = widget.isMain;

                    return (
                      <Draggable key={widget.page} draggableId={widget.page} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="relative"
                          >
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className={isMainWidget ? 'col-span-1' : ''}
                            >
                              <div className="relative">
                                <motion.div
                                  whileHover={{ scale: 1.2, y: -8 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
                                >
                                  {widget.page === 'Logout' ? (
                                    <button
                                      onClick={handleLogout}
                                      className="rounded-full w-24 h-24 flex items-center justify-center border-2 bg-gradient-to-br from-red-500 to-red-600 border-red-300 transition-all shadow-lg hover:scale-110"
                                    >
                                      <Icon className="w-8 h-8 text-white" />
                                    </button>
                                  ) : (
                                    <Link to={createPageUrl(widget.page, { appFace: widget.appFace, from: 'Home' })}>
                                      <div className="rounded-full flex items-center justify-center border-2 transition-all shadow-lg w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 border-yellow-200 hover:scale-110">
                                        <Icon className="w-8 h-8 text-black" />
                                      </div>
                                    </Link>
                                  )}
                                  <p className="text-center text-white font-semibold leading-tight text-sm max-w-20">
                                    {widget.label}
                                  </p>
                                </motion.div>
                                <div {...provided.dragHandleProps} className="absolute top-0 right-0 p-1 opacity-0 hover:opacity-100 transition-opacity">
                                  <GripHorizontal className="w-4 h-4 text-white/50" />
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}