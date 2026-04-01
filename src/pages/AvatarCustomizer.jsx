import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPageUrl } from '../utils';
import { ArrowLeft, Sparkles, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import { toast } from 'sonner';

export default function AvatarCustomizer() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [credits, setCredits] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('hairstyle');
  const [ownedItems, setOwnedItems] = useState([]);
  const [loading, setLoading] = useState(false);

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

      const creditRecords = await base44.entities.EmpireCredit.filter({ created_by: currentUser.email });
      if (creditRecords.length > 0) {
        setCredits(creditRecords[0].balance || 0);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const customizationItems = {
    hairstyle: [
      { id: 'hair_long', name: 'Long Hair', cost: 5, preview: '💇‍♀️' },
      { id: 'hair_short', name: 'Short Hair', cost: 5, preview: '💇‍♂️' },
      { id: 'hair_curly', name: 'Curly Hair', cost: 8, preview: '🦱' },
      { id: 'hair_bald', name: 'Bald', cost: 3, preview: '👨‍🦲' },
    ],
    outfit: [
      { id: 'outfit_casual', name: 'Casual Wear', cost: 10, preview: '👕' },
      { id: 'outfit_formal', name: 'Formal Suit', cost: 15, preview: '🤵' },
      { id: 'outfit_athletic', name: 'Athletic Wear', cost: 12, preview: '🏃' },
      { id: 'outfit_elegant', name: 'Elegant Dress', cost: 20, preview: '👗' },
    ],
    accessories: [
      { id: 'acc_glasses', name: 'Glasses', cost: 5, preview: '👓' },
      { id: 'acc_hat', name: 'Hat', cost: 8, preview: '🎩' },
      { id: 'acc_jewelry', name: 'Jewelry', cost: 15, preview: '💎' },
      { id: 'acc_watch', name: 'Watch', cost: 12, preview: '⌚' },
    ],
    effects: [
      { id: 'effect_glow', name: 'Glow Effect', cost: 25, preview: '✨' },
      { id: 'effect_sparkle', name: 'Sparkle Aura', cost: 30, preview: '⭐' },
      { id: 'effect_hologram', name: 'Hologram Mode', cost: 50, preview: '🌟' },
    ]
  };

  const purchaseItem = async (item) => {
    if (credits < item.cost) {
      toast.error("Not enough credits!");
      return;
    }

    if (ownedItems.includes(item.id)) {
      toast.info("You already own this item!");
      return;
    }

    setLoading(true);
    try {
      // Deduct credits
      const creditRecords = await base44.entities.EmpireCredit.filter({ created_by: user.email });
      if (creditRecords.length > 0) {
        await base44.entities.EmpireCredit.update(creditRecords[0].id, {
          balance: credits - item.cost
        });
      }

      // Add to owned items
      setOwnedItems(prev => [...prev, item.id]);
      setCredits(credits - item.cost);
      
      toast.success(`Purchased ${item.name}!`);
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast.error("Purchase failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-6 flex justify-between items-center">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 rounded-full">
            <span className="text-white font-bold text-lg">💰 {credits} Credits</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              Avatar Customizer
            </h1>
            <p className="text-xl text-gray-300">Personalize your Oracle companion</p>
          </motion.div>

          {/* Category Selection */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {Object.keys(customizationItems).map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={selectedCategory === category 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-300 border-gray-600 hover:border-purple-500"
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customizationItems[selectedCategory]?.map(item => {
              const owned = ownedItems.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className={`bg-gray-900/80 border-2 ${owned ? 'border-green-500' : 'border-purple-500/50'}`}>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{item.preview}</div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                        
                        {owned ? (
                          <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold">
                            ✓ Owned
                          </div>
                        ) : (
                          <Button
                            onClick={() => purchaseItem(item)}
                            disabled={loading || credits < item.cost}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            {item.cost} Credits
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Get More Credits */}
          <Card className="mt-12 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-yellow-300 mb-4">Need More Credits?</h3>
              <p className="text-gray-300 mb-4">Complete challenges, use the app, or purchase credit packs!</p>
              <Link to={createPageUrl('SovereignMall')}>
                <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                  Visit Sovereign Mall
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}