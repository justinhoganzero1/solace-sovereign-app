import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { allSpecialists } from '../components/data/specialists';
import { motion } from 'framer-motion';

export default function AllSpecialists() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [view, setView] = useState('categories'); // 'categories' or 'specialists'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin();
        return;
      }
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(allSpecialists.map(s => s.category))];

  const categorySpecialists = selectedCategory 
    ? allSpecialists.filter(s => s.category === selectedCategory)
    : [];

  const filteredSpecialists = categorySpecialists.filter(specialist => {
    if (!searchTerm) return true;
    return specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           specialist.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setView('specialists');
    setSearchTerm('');
  };

  const handleBack = () => {
    if (view === 'specialists') {
      setView('categories');
      setSelectedCategory(null);
      setSearchTerm('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Oracle Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        <div className="mb-6">
          {view === 'categories' ? (
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          ) : (
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Categories
            </Button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {view === 'categories' ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-2xl">
                  Choose a Category
                </h1>
                <p className="text-xl text-yellow-200">Select the area you need help with</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl w-full">
                {categories.map((category, idx) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={() => handleCategorySelect(category)}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-900/90 to-yellow-900/90 hover:from-amber-800 hover:to-yellow-800 border-2 border-yellow-400/60 text-white font-bold backdrop-blur-md shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
                    >
                      <span className="text-center text-xs">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-2xl">
                  {selectedCategory?.charAt(0).toUpperCase() + selectedCategory?.slice(1)}
                </h1>
                <p className="text-xl text-yellow-200">{categorySpecialists.length} specialists available</p>
              </motion.div>

              {/* Search bar */}
              <div className="w-full max-w-4xl mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Input
                    placeholder="Search in this category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white text-gray-900 text-lg"
                  />
                </div>
              </div>

              {/* Specialists grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl w-full place-items-center">
                {filteredSpecialists.map((specialist, idx) => (
                  <motion.div
                    key={specialist.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link to={`${createPageUrl('SpecialistChat')}?specialist=${encodeURIComponent(specialist.name)}`}>
                      <motion.div
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-900/90 to-yellow-900/90 backdrop-blur-md border-2 border-yellow-400/60 shadow-2xl hover:border-yellow-300 transition-all cursor-pointer flex flex-col items-center justify-center"
                      >
                        <div className="text-3xl mb-1">{specialist.emoji}</div>
                        <p className="text-xs text-white text-center font-semibold leading-tight px-1 line-clamp-2">
                          {specialist.name}
                        </p>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}