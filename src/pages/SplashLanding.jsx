import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function SplashLanding() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleGuestAccess = () => {
    navigate('/Home');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Disabled auto-redirect to check auth for now
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    );
  }



  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] flex flex-col text-white">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,210,74,0.16),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(255,153,0,0.12),_transparent_30%)]" />
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4a63c" strokeWidth="0.45" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Oracle Background - Full Screen */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(255,196,72,0.18),_transparent_26%),linear-gradient(180deg,_rgba(0,0,0,0.2),_rgba(0,0,0,0.78))]" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-10 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-xl"
        >
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-amber-400/25 bg-amber-400/8 px-4 py-2 text-xs uppercase tracking-[0.35em] text-amber-200/90">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
            Sovereign AI Companion
          </div>

          <div className="mb-10 flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-amber-400/30 bg-[linear-gradient(145deg,rgba(255,214,102,0.3),rgba(255,140,0,0.08))] shadow-[0_0_40px_rgba(255,173,51,0.16)]">
              <div className="bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-5xl font-black text-transparent">
                S
              </div>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-amber-100 via-amber-300 to-orange-400 bg-clip-text text-5xl font-black tracking-[0.2em] text-transparent md:text-6xl">
                SOLACE
              </h1>
              <p className="mt-3 text-base text-amber-100/70 md:text-lg">
                Your Sovereign AI Companion
              </p>
            </div>
          </div>

          <div className="space-y-5 text-left">
            <p className="max-w-xl text-lg leading-8 text-zinc-300 md:text-xl">
              A luxury command hub for creation, guidance, strategy, wellness, safety, and intelligent assistance from one sovereign interface.
            </p>
            <div className="grid gap-3 text-sm text-zinc-400 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/6 bg-white/4 px-4 py-4">Adaptive AI tools</div>
              <div className="rounded-2xl border border-white/6 bg-white/4 px-4 py-4">Premium voice and identity</div>
              <div className="rounded-2xl border border-white/6 bg-white/4 px-4 py-4">All-in-one sovereign workspace</div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="w-full max-w-md"
        >
          {/* Title Section */}
          <div className="rounded-[32px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(14,14,14,0.92),rgba(5,5,5,0.98))] p-7 shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-28 w-full max-w-[310px] items-center justify-center rounded-[28px] border border-amber-400/10 bg-[radial-gradient(circle_at_center,_rgba(255,191,0,0.16),_rgba(0,0,0,0.3)_70%)]">
                <div className="flex items-center gap-5 text-amber-300/90">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/8 text-3xl font-black">S</div>
                  <div className="text-left">
                    <div className="text-2xl font-bold tracking-[0.18em] text-amber-300">SOLACE</div>
                    <div className="text-xs uppercase tracking-[0.35em] text-amber-100/45">Sign In Portal</div>
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-amber-300">Sign In</h2>
            </div>

            {/* Two Circular Login Buttons */}
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleGuestAccess}
                className="h-12 w-full rounded-xl border border-amber-400/40 bg-transparent text-base font-medium text-amber-300 hover:bg-amber-400/10"
              >
                Continue with Google
              </Button>
              <Button
                type="button"
                onClick={handleGuestAccess}
                className="h-12 w-full rounded-xl border border-amber-400/40 bg-transparent text-base font-medium text-amber-300 hover:bg-amber-400/10"
              >
                Continue with Apple
              </Button>

              <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-[0.3em] text-zinc-500">
                <div className="h-px flex-1 bg-white/10" />
                <span>or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-xl border-amber-400/20 bg-[#0b0b0b] text-white placeholder:text-zinc-600 focus-visible:ring-amber-400/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 rounded-xl border-amber-400/20 bg-[#0b0b0b] text-white placeholder:text-zinc-600 focus-visible:ring-amber-400/40"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGuestAccess}
                className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 text-black hover:opacity-95"
              >
                Enter SOLACE
              </Button>

              <div className="flex items-center justify-between gap-4 pt-2 text-sm text-zinc-500">
                <button type="button" onClick={handleGuestAccess} className="transition hover:text-amber-300">
                  Continue as guest
                </button>
                <button type="button" onClick={handleGuestAccess} className="transition hover:text-amber-300">
                  Create account
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}