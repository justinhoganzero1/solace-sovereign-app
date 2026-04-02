import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Eye, Mic, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export default function OracleEye() {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oracleResponse, setOracleResponse] = useState(null);

  const submitSuggestion = async () => {
    if (!suggestion.trim()) {
      toast.error('Share your vision with the Oracle');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await base44.functions.invoke('empireSelfBuilder', {
        suggestion_text: suggestion
      });

      setOracleResponse(data.oracle_says);
      toast.success(`+${data.credits_awarded} Empire Credits! Feasibility: ${data.analysis.feasibility_score}%`);
      
      if (data.analysis.can_auto_build) {
        toast.success('🚀 Oracle can build this! Adding to blueprint...');
      }
    } catch (error) {
      toast.error('Oracle communication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSuggestion('');
    setOracleResponse(null);
  };

  return (
    <>
      {/* Floating Oracle Eye Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(34, 211, 238, 0.5)',
              '0 0 40px rgba(34, 211, 238, 0.8)',
              '0 0 20px rgba(34, 211, 238, 0.5)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center"
        >
          <Eye className="w-8 h-8 text-white" />
        </motion.div>
      </motion.button>

      {/* Suggestion Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-2">
              <Eye className="w-6 h-6 text-cyan-400" />
              The Oracle Eye
            </DialogTitle>
          </DialogHeader>

          {oracleResponse ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
                <p className="text-sm text-purple-300 mb-2">The Oracle speaks:</p>
                <p className="text-white leading-relaxed">{oracleResponse}</p>
              </div>
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
              >
                Return to Empire
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300">
                What superpower should the Oracle gain next? Describe your vision...
              </p>

              <Textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Example: I want Oracle to predict when my favorite band announces concerts..."
                className="bg-gray-900/50 text-white border-cyan-500/30 min-h-32"
              />

              <div className="flex gap-2">
                <Button
                  onClick={submitSuggestion}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Transmitting...' : 'Send to Oracle'}
                </Button>
                <Button
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                +10 Empire Credits for every suggestion submitted
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}