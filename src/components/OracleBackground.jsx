import React from 'react';
import { motion } from 'framer-motion';

export default function OracleBackground({ gender = 'female', fadeOut = false, children }) {
  const oracleImage = gender === 'male' 
    ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69659706b6fcdcdebe2d7e2f/94de49b14_e579ab8c-7d30-423c-9610-4bd9393b5dcd.png'
    : 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69659706b6fcdcdebe2d7e2f/326040f4d_c605241b-51a2-4d40-9ed0-dc08a2504e2c.png';

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <img
          src={oracleImage}
          alt="Oracle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </motion.div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}