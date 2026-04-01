import React, { useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function PrivacyToggle() {
  const [silentMode, setSilentMode] = useState(false);

  const togglePrivacy = () => {
    const newMode = !silentMode;
    setSilentMode(newMode);

    if (newMode) {
      // Activate silent mode - hide all data
      document.body.classList.add('privacy-mode');
      toast.success('Silent Mode: All data hidden');
    } else {
      // Deactivate
      document.body.classList.remove('privacy-mode');
      toast.success('Privacy Mode: Deactivated');
    }
  };

  return (
    <motion.button
      onClick={togglePrivacy}
      className="fixed top-6 right-6 z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        animate={{
          backgroundColor: silentMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'
        }}
        className="p-3 rounded-full border-2"
        style={{
          borderColor: silentMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'
        }}
      >
        {silentMode ? (
          <ShieldOff className="w-6 h-6 text-red-400" />
        ) : (
          <Shield className="w-6 h-6 text-green-400" />
        )}
      </motion.div>
    </motion.button>
  );
}