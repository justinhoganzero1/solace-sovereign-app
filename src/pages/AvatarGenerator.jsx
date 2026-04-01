import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';

export default function AvatarGenerator() {
  const [generating, setGenerating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [gender, setGender] = useState('female');

  const generateAvatar = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateOracleAvatar', { gender });
      setAvatarUrl(response.data.image_url);
    } catch (error) {
      console.error('Error generating avatar:', error);
      alert('Error generating avatar. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-white hover:bg-white/20 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
            Oracle Avatar Generator
          </h1>
          <p className="text-xl text-yellow-200 drop-shadow-lg">
            Generate your custom Oracle Lunar avatar
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Generator Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-8 bg-white/95 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Generate New Avatar</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Oracle Gender
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setGender('female')}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        gender === 'female'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-amber-300'
                      }`}
                    >
                      ✨ Female Oracle
                    </button>
                    <button
                      onClick={() => setGender('male')}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        gender === 'male'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-amber-300'
                      }`}
                    >
                      ⭐ Male Oracle
                    </button>
                  </div>
                </div>

                <Button
                  onClick={generateAvatar}
                  disabled={generating}
                  className="w-full h-12 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-lg font-semibold"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    '🎨 Generate Avatar'
                  )}
                </Button>

                {avatarUrl && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">Generated avatar URL:</p>
                    <textarea
                      value={avatarUrl}
                      readOnly
                      className="w-full p-2 text-xs bg-gray-100 rounded border text-gray-700 h-24"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Copy this URL to use in your app settings
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Avatar Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-8 bg-white/95 backdrop-blur-sm h-full">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Preview</h2>
              
              {generating ? (
                <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-3" />
                    <p className="text-gray-600">Creating your Oracle...</p>
                  </div>
                </div>
              ) : avatarUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full rounded-lg overflow-hidden border-4 border-amber-300 shadow-2xl"
                >
                  <img
                    src={avatarUrl}
                    alt="Oracle Avatar"
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                  <p className="text-gray-600 text-center">
                    Generate an avatar to see it here
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}