import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Share2, X, Mail, MessageSquare, Copy, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { universalShare } from '../lib/universalShare';

export default function ShareButton({ url, title, text, className = '' }) {
  const [showPicker, setShowPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async (targetId) => {
    try {
      await universalShare.shareToTarget(targetId, { url, title, text });
      setShowPicker(false);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCopy = async () => {
    await universalShare.shareToTarget('copy', { url, title, text });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhoneShare = async () => {
    if (phoneNumber) {
      await universalShare.shareToPhoneNumber(phoneNumber, { url, title, text });
      setPhoneNumber('');
    }
  };

  const handleEmailShare = async () => {
    if (emailAddress) {
      await universalShare.shareToEmail(emailAddress, { url, title, text });
      setEmailAddress('');
    }
  };

  const targets = universalShare.getAllTargets();

  return (
    <>
      <Button
        onClick={() => setShowPicker(true)}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      <AnimatePresence>
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="bg-gray-900 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Share</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowPicker(false)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <Button
                      onClick={handleCopy}
                      className="h-auto py-4 flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700"
                    >
                      <Copy className="w-6 h-6" />
                      <span className="text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
                    </Button>
                    <Button
                      onClick={() => handleShare('qr')}
                      className="h-auto py-4 flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700"
                    >
                      <QrCode className="w-6 h-6" />
                      <span className="text-xs">QR Code</span>
                    </Button>
                    <Button
                      onClick={() => handleShare('email')}
                      className="h-auto py-4 flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700"
                    >
                      <Mail className="w-6 h-6" />
                      <span className="text-xs">Email</span>
                    </Button>
                    <Button
                      onClick={() => handleShare('sms')}
                      className="h-auto py-4 flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700"
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="text-xs">SMS</span>
                    </Button>
                  </div>

                  {/* Share to Phone Number */}
                  <div className="mb-6">
                    <label className="text-white text-sm font-semibold mb-2 block">Share to Phone Number</label>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-gray-800 text-white border-gray-600"
                      />
                      <Button
                        onClick={handlePhoneShare}
                        disabled={!phoneNumber}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Send
                      </Button>
                    </div>
                  </div>

                  {/* Share to Email */}
                  <div className="mb-6">
                    <label className="text-white text-sm font-semibold mb-2 block">Share to Email</label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="bg-gray-800 text-white border-gray-600"
                      />
                      <Button
                        onClick={handleEmailShare}
                        disabled={!emailAddress}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Send
                      </Button>
                    </div>
                  </div>

                  {/* Social Media Platforms */}
                  <div className="space-y-4">
                    {Object.entries(universalShare.shareTargets).map(([category, categoryTargets]) => (
                      <div key={category}>
                        <h3 className="text-white font-semibold mb-2 capitalize">{category}</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {categoryTargets.map((target) => (
                            <Button
                              key={target.id}
                              onClick={() => handleShare(target.id)}
                              className="h-auto py-3 flex flex-col items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white"
                            >
                              <span className="text-2xl">{target.icon}</span>
                              <span className="text-xs text-center">{target.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
