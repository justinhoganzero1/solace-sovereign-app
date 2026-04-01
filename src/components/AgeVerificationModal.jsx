import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

export default function AgeVerificationModal({ isOpen, onComplete }) {
  const [selectedAge, setSelectedAge] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!selectedAge) return;
    
    setLoading(true);
    try {
      await base44.functions.invoke('verifyAge', { age_category: selectedAge });
      onComplete(selectedAge);
    } catch (error) {
      console.error('Age verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-yellow-50 to-amber-50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-amber-900">Age Verification</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <p className="text-amber-800">
            We need to know your age to provide appropriate content. This helps us keep the experience safe for everyone.
          </p>

          <RadioGroup value={selectedAge} onValueChange={setSelectedAge}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition-all cursor-pointer">
                <RadioGroupItem value="under_16" id="under_16" />
                <Label htmlFor="under_16" className="flex-1 cursor-pointer">
                  <span className="font-semibold text-amber-900">Under 16</span>
                  <p className="text-sm text-amber-700">Restricted to G-rated content only</p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition-all cursor-pointer">
                <RadioGroupItem value="age_16_18" id="age_16_18" />
                <Label htmlFor="age_16_18" className="flex-1 cursor-pointer">
                  <span className="font-semibold text-amber-900">16-18 years old</span>
                  <p className="text-sm text-amber-700">Access to PG-13 and PG content</p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition-all cursor-pointer">
                <RadioGroupItem value="age_18_plus" id="age_18_plus" />
                <Label htmlFor="age_18_plus" className="flex-1 cursor-pointer">
                  <span className="font-semibold text-amber-900">18 or older</span>
                  <p className="text-sm text-amber-700">Full access to all content</p>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <Button
            onClick={handleVerify}
            disabled={!selectedAge || loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3"
          >
            {loading ? 'Verifying...' : 'Verify Age'}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}