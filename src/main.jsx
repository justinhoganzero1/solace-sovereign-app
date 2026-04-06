import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import OracleMaster from './components/OracleMaster'

class PageErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Page error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⚠️</div>
          <p style={{ marginBottom: '12px' }}>This page encountered an error.</p>
          <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'left', maxWidth: '600px', margin: '0 auto', whiteSpace: 'pre-wrap', color: '#fca5a5' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => { this.setState({ hasError: false, error: null }); if (this.props.onBack) this.props.onBack(); }}
            style={{ marginTop: '16px', padding: '10px 24px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '8px', color: '#c4b5fd', cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Futuristic neon icon SVGs - clean geometric designs
const Icon = ({ path, color = '#a855f7', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

const ICONS = {
  wellness:   'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  video:      'M23 7l-7 5 7 5V7z M1 5h14a2 2 0 012 2v10a2 2 0 01-2 2H1a2 2 0 01-2-2V7a2 2 0 012-2z',
  oracle:     'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  titan:      'M6.5 6.5l11 11 M6.5 17.5l11-11 M12 2v20 M2 12h20',
  builder:    'M2 20h20 M4 20V10l8-6 8 6v10 M9 20v-6h6v6',
  mechanic:   'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  interpreter:'M12 22a10 10 0 100-20 10 10 0 000 20z M2 12h20 M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
  appmaker:   'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  inventor:   'M9 18h6 M10 22h4 M12 2v1 M4.22 7.22l.71.71 M1 14h1 M22 14h1 M19.07 7.93l.71-.71 M12 6a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V18a1 1 0 01-1 1h-4a1 1 0 01-1-1v-.8A6 6 0 0112 6z',
  handyman:   'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  mind:       'M12 2a8 8 0 018 8c0 6-8 12-8 12S4 16 4 10a8 8 0 018-8z M12 10m-3 0a3 3 0 116 0 3 3 0 01-6 0',
  safety:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  movie:      'M4 8V4a2 2 0 012-2h8a2 2 0 012 2v4 M2 14h20 M6 14v4 M10 14v4 M14 14v4 M18 14v4 M2 10a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V10z',
  voice:      'M12 1v10.5 M19 10a7 7 0 01-14 0 M12 18.5V23 M8 23h8',
  mall:       'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0',
  family:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  professional:'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16',
  training:   'M4 19.5A2.5 2.5 0 016.5 17H20 M4 15.5A2.5 2.5 0 016.5 13H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  community:  'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  crisis:     'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  vision:     'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 116 0 3 3 0 01-6 0',
  diagnostic: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2 M9 18l1-3 M15 18l-1-3',
  marketing:   'M22 2L11 13 M22 2l-7 20-4-9-9-4z',
}

const neonColors = [
  { glow: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
  { glow: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  { glow: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  { glow: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  { glow: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { glow: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
  { glow: '#f43f5e', bg: 'rgba(244,63,94,0.08)' },
]

// All launchable apps — no more "specialists", Oracle handles everything
const APPS = [
  { name: 'AI Chat', icon: 'oracle', desc: 'Talk to SOLACE Oracle', ci: 0, page: 'Chat' },
  { name: 'App Maker', icon: 'appmaker', desc: 'Build apps with AI', ci: 4, page: 'Inventor' },
  { name: 'Video Editor', icon: 'video', desc: 'AI video tools', ci: 1, page: 'VideoEditor' },
  { name: 'Movie Maker', icon: 'movie', desc: 'AI movie generation', ci: 1, page: 'MovieMaker' },
  { name: 'Voice Generator', icon: 'voice', desc: 'Multilingual voices', ci: 5, page: 'VoiceGenerator' },
  { name: 'Interpreter', icon: 'interpreter', desc: '200+ languages', ci: 2, page: 'Interpreter' },
  { name: 'Avatar Companion', icon: 'wellness', desc: 'AI partner with room', ci: 0, page: 'AvatarCompanion' },
  { name: 'Live Vision', icon: 'vision', desc: 'Camera & AR', ci: 1, page: 'LiveVision' },
  { name: 'Marketing Hub', icon: 'marketing', desc: 'AI campaigns', ci: 1, page: 'MarketingHub' },
  { name: 'Diagnostics', icon: 'diagnostic', desc: 'Self-repair system', ci: 6, page: 'DiagnosticCenter' },
  { name: 'Safety', icon: 'safety', desc: 'Personal safety', ci: 6, page: 'SafetyCenter' },
  { name: 'Digital Mall', icon: 'mall', desc: 'Marketplace', ci: 3, page: 'SovereignMall' },
  { name: 'Settings', icon: 'mind', desc: 'Preferences', ci: 2, page: 'Settings' },
  { name: 'App Store', icon: 'mall', desc: 'Connect any app + billing', ci: 4, page: 'AppStore' },
  { name: 'Owner Dashboard', icon: 'professional', desc: 'Revenue & analytics', ci: 4, page: 'OwnerDashboard' },
  { name: 'Home', icon: 'builder', desc: 'All tools grid', ci: 3, page: 'Home' },
]

const allPages = [
  'AppStore', 'AvatarCompanion', 'Builder', 'Chat', 'CommunityHub', 'CrisisHub',
  'Dashboard', 'DiagnosticCenter', 'FamilyHub', 'Handyman', 'Home', 'MarketingHub',
  'Interpreter', 'Inventor', 'LiveVision', 'Mechanic', 'MediaLibrary',
  'MindHub', 'MovieMaker', 'OracleCouncil', 'OracleTrainingCenter',
  'OwnerDashboard', 'ProfessionalHub', 'Profile',
  'SafetyCenter', 'Settings', 'SovereignMall', 'SovereignEmpire',
  'TitanHeart', 'VideoEditor', 'VoiceGenerator', 'WellnessCenter'
]

// ═══════════════════════════════════════════
// AUTO-RECOVERY SYSTEM
// Monitors for crashes, memory leaks, stuck states
// ═══════════════════════════════════════════
function initAutoRecovery() {
  if (window.__solaceRecoveryActive) return;
  window.__solaceRecoveryActive = true;

  let consecutiveErrors = 0;
  const MAX_ERRORS_BEFORE_RESET = 5;
  const HEALTH_CHECK_INTERVAL = 30000; // 30s

  // Global error handler
  window.addEventListener('error', (e) => {
    consecutiveErrors++;
    console.warn(`[SOLACE Recovery] Error #${consecutiveErrors}: ${e.message}`);
    if (consecutiveErrors >= MAX_ERRORS_BEFORE_RESET) {
      console.warn('[SOLACE Recovery] Too many errors — triggering soft reset');
      consecutiveErrors = 0;
      try {
        // Clear potentially corrupt data
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
          if (k.startsWith('solace_entity_')) {
            try { JSON.parse(localStorage.getItem(k)); } catch {
              console.warn(`[SOLACE Recovery] Removing corrupt key: ${k}`);
              localStorage.removeItem(k);
            }
          }
        });
      } catch { /* ignore */ }
    }
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    console.warn('[SOLACE Recovery] Unhandled rejection:', e.reason);
    e.preventDefault(); // Prevent crash
  });

  // Periodic health check
  setInterval(() => {
    // Check DOM is alive
    const root = document.getElementById('root');
    if (root && root.children.length === 0) {
      console.warn('[SOLACE Recovery] Empty root detected — app may have crashed');
    }

    // Check memory (Chrome only)
    const perf = /** @type {any} */ (performance);
    if (perf.memory) {
      const pct = perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit;
      if (pct > 0.85) {
        console.warn(`[SOLACE Recovery] High memory usage: ${(pct * 100).toFixed(0)}%`);
      }
    }

    // Reset error counter if things are stable
    if (consecutiveErrors > 0) consecutiveErrors = Math.max(0, consecutiveErrors - 1);
  }, HEALTH_CHECK_INTERVAL);

  console.info('[SOLACE Recovery] Auto-recovery system active');
}

// Start recovery on load
if (typeof window !== 'undefined') initAutoRecovery();

// CSS injected once
const cssInjected = React.useRef ? false : false
function injectCSS() {
  if (document.getElementById('solace-neon-css')) return
  const style = document.createElement('style')
  style.id = 'solace-neon-css'
  style.textContent = `
    @keyframes neonPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
    @keyframes floatUp { 0%{transform:translateY(4px);opacity:0} 100%{transform:translateY(0);opacity:1} }
    @keyframes spinLoader { to{transform:rotate(360deg)} }
    @keyframes glowShift { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(30deg)} }
    @keyframes borderGlow { 0%{border-color:rgba(139,92,246,0.2)} 50%{border-color:rgba(236,72,153,0.3)} 100%{border-color:rgba(139,92,246,0.2)} }
    @keyframes subtlePulse { 0%,100%{opacity:0.7} 50%{opacity:1} }

    /* ═══ NUCLEAR BLACK BACKGROUND — EVERY SCREEN ═══ */
    html, body, #root { margin:0; background:#000 !important; color:#e2e8f0; min-height:100vh; }
    body * { box-sizing: border-box; }
    .min-h-screen, [class*="min-h-screen"] { background: #000 !important; }
    [class*="bg-gradient-to"], [class*="from-amber"], [class*="from-purple"],
    [class*="from-blue"], [class*="from-green"], [class*="from-red"],
    [class*="from-yellow"], [class*="from-pink"], [class*="from-cyan"],
    [class*="via-yellow"], [class*="via-purple"] {
      background: #000 !important;
    }
    [class*="bg-white"], [class*="bg-gray-1"], [class*="bg-gray-5"],
    [class*="bg-amber-"], [class*="bg-yellow-"], [class*="bg-green-5"],
    [class*="bg-blue-5"], [class*="bg-red-5"], [class*="bg-purple-5"],
    [class*="bg-pink-5"], [class*="bg-orange-5"] {
      background: rgba(8,8,18,0.9) !important;
    }
    /* Kill any white/light text on dark cards */
    [class*="text-amber-9"], [class*="text-gray-6"], [class*="text-gray-7"],
    [class*="text-amber-7"], [class*="text-gray-8"] {
      color: #a3a3c2 !important;
    }
    .neon-bubble {
      position:relative; border-radius:20px; padding:28px 24px;
      background:rgba(10,10,20,0.7); backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,0.06);
      cursor:pointer; transition:all 0.35s cubic-bezier(0.4,0,0.2,1);
      overflow:visible; animation:floatUp 0.5s ease-out forwards;
    }
    .neon-bubble::after {
      content:''; position:absolute; bottom:-6px; left:15%; right:15%; height:12px;
      border-radius:50%; filter:blur(10px); opacity:0.5;
      transition:all 0.35s; animation:neonPulse 3s ease-in-out infinite;
    }
    .neon-bubble:hover { transform:translateY(-6px); border-color:rgba(255,255,255,0.12); }
    .neon-bubble:hover::after { opacity:0.9; filter:blur(14px); bottom:-8px; left:10%; right:10%; height:16px; }
    .neon-bubble:hover .icon-orb { transform:scale(1.1); }
    .icon-orb {
      width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center;
      margin-bottom:14px; transition:transform 0.3s; position:relative;
    }
    .icon-orb::after {
      content:''; position:absolute; inset:-3px; border-radius:50%;
      opacity:0.3; animation:neonPulse 4s ease-in-out infinite;
    }
    .stat-orb {
      background:rgba(10,10,20,0.7); backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:24px;
      text-align:center; position:relative; overflow:hidden;
    }
    .stat-orb::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background:linear-gradient(90deg, transparent, var(--stat-color, #a855f7), transparent);
    }
    .page-pill {
      background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
      border-radius:12px; padding:12px 16px; text-align:center;
      cursor:pointer; transition:all 0.25s; color:#94a3b8; font-size:0.82rem;
      font-weight:500; letter-spacing:0.02em;
    }
    .page-pill:hover { background:rgba(139,92,246,0.12); border-color:rgba(139,92,246,0.3); color:#c4b5fd; transform:translateY(-2px); }

    /* ═══════════════════════════════════════════════════════════
       GLOBAL HIGH-TECH OVERRIDES — transforms all specialist pages
       ═══════════════════════════════════════════════════════════ */

    /* Base page background */
    [data-component-name], .max-w-6xl, .max-w-4xl, .max-w-7xl, .min-h-screen, .container {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif !important;
    }

    /* ── Cards: dark glass with neon borders ── */
    .rounded-xl, .rounded-lg, .rounded-2xl,
    [class*="bg-gray-900"], [class*="bg-gray-800\\/"],
    [class*="bg-black\\/"], .card, [class*="text-card"],
    [class*="bg-white/95"], [class*="bg-white/90"],
    [class*="bg-white/80"], [class*="bg-white/10"] {
      background: rgba(6,6,14,0.85) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(139,92,246,0.1) !important;
      box-shadow: 0 0 1px rgba(139,92,246,0.08), 0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02) !important;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important;
      color: #e2e8f0 !important;
    }
    .rounded-xl:hover, .rounded-lg:hover, .rounded-2xl:hover,
    [class*="bg-gray-900"]:hover {
      border-color: rgba(139,92,246,0.25) !important;
      box-shadow: 0 0 2px rgba(139,92,246,0.15), 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.05), inset 0 1px 0 rgba(255,255,255,0.04) !important;
    }

    /* ── Tab system: colorful gradient pills ── */
    [role="tablist"] {
      background: rgba(6,6,14,0.6) !important;
      border: 1px solid rgba(255,255,255,0.05) !important;
      border-radius: 14px !important;
      padding: 4px !important;
      gap: 2px !important;
      border-bottom: none !important;
    }
    [role="tab"] {
      background: transparent !important;
      border: none !important;
      border-radius: 10px !important;
      color: #64748b !important;
      font-weight: 600 !important;
      font-size: 0.78rem !important;
      padding: 8px 14px !important;
      transition: all 0.25s !important;
      letter-spacing: 0.02em !important;
    }
    [role="tab"]:hover {
      background: rgba(139,92,246,0.08) !important;
      color: #a78bfa !important;
    }
    [role="tab"][data-state="active"], [role="tab"][aria-selected="true"] {
      background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.2)) !important;
      color: #e9d5ff !important;
      box-shadow: 0 0 12px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05) !important;
      border: 1px solid rgba(139,92,246,0.2) !important;
    }
    [role="tabpanel"] {
      background: transparent !important;
      border: none !important;
    }

    /* ── Toggle switches: neon ── */
    [role="switch"] {
      background: rgba(30,30,50,0.8) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
    }
    [role="switch"][data-state="checked"] {
      background: linear-gradient(135deg, #8b5cf6, #ec4899) !important;
      border-color: rgba(139,92,246,0.4) !important;
      box-shadow: 0 0 12px rgba(139,92,246,0.3) !important;
    }

    /* ── Select dropdowns ── */
    [role="combobox"], [class*="SelectTrigger"], [data-radix-select-trigger] {
      background: rgba(6,6,14,0.9) !important;
      border: 1px solid rgba(139,92,246,0.15) !important;
      color: #e2e8f0 !important;
      border-radius: 10px !important;
    }
    [role="listbox"], [data-radix-select-content] {
      background: rgba(8,8,18,0.98) !important;
      border: 1px solid rgba(139,92,246,0.15) !important;
      backdrop-filter: blur(20px) !important;
    }
    [role="option"] {
      color: #c4c4e0 !important;
    }
    [role="option"]:hover, [role="option"][data-highlighted] {
      background: rgba(139,92,246,0.12) !important;
      color: #e9d5ff !important;
    }

    /* ── Feature toggle rows (Settings) ── */
    [class*="bg-green-50"], [class*="bg-blue-50"], [class*="bg-purple-50"],
    [class*="bg-pink-50"], [class*="bg-yellow-50"], [class*="bg-orange-50"],
    [class*="bg-red-50"], [class*="bg-amber-50"], [class*="bg-gray-100"] {
      background: rgba(10,10,25,0.7) !important;
      border: 1px solid rgba(255,255,255,0.05) !important;
      border-radius: 14px !important;
      color: #e2e8f0 !important;
    }
    [class*="text-gray-600"], [class*="text-sm text-gray"] {
      color: #64748b !important;
    }

    /* ── Inputs: sleek dark with neon focus ring ── */
    input, textarea, select,
    input[class*="bg-gray"], textarea[class*="bg-gray"], select[class*="bg-gray"] {
      background: rgba(6,6,15,0.9) !important;
      border: 1px solid rgba(139,92,246,0.15) !important;
      border-radius: 10px !important;
      color: #e2e8f0 !important;
      padding: 10px 14px !important;
      font-size: 0.9rem !important;
      transition: all 0.25s !important;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.3) !important;
    }
    input:focus, textarea:focus, select:focus {
      outline: none !important;
      border-color: rgba(139,92,246,0.5) !important;
      box-shadow: 0 0 0 3px rgba(139,92,246,0.1), 0 0 12px rgba(139,92,246,0.08), inset 0 1px 3px rgba(0,0,0,0.3) !important;
    }
    input::placeholder, textarea::placeholder {
      color: #4a4a6a !important;
      font-style: normal !important;
    }

    /* ── Buttons: gradient glass with glow ── */
    button, [role="button"], .btn,
    button[class*="bg-purple"], button[class*="bg-blue"],
    button[class*="bg-gradient"], [class*="btn-primary"] {
      border-radius: 10px !important;
      font-weight: 600 !important;
      letter-spacing: 0.01em !important;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important;
      position: relative !important;
    }
    button[class*="bg-purple"], button[class*="bg-gradient"],
    [class*="from-purple"] {
      background: linear-gradient(135deg, rgba(139,92,246,0.9), rgba(236,72,153,0.8)) !important;
      border: 1px solid rgba(168,130,255,0.3) !important;
      color: white !important;
      box-shadow: 0 2px 12px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1) !important;
    }
    button[class*="bg-purple"]:hover, button[class*="bg-gradient"]:hover,
    [class*="from-purple"]:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 20px rgba(139,92,246,0.4), 0 0 30px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.15) !important;
    }
    button[class*="bg-gray"], button[class*="border-gray"],
    button[class*="bg-white\\/"] {
      background: rgba(255,255,255,0.04) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      color: #a3a3c2 !important;
    }
    button[class*="bg-gray"]:hover, button[class*="border-gray"]:hover {
      background: rgba(139,92,246,0.1) !important;
      border-color: rgba(139,92,246,0.25) !important;
      color: #c4b5fd !important;
    }

    /* ── Headers & titles: gradient text ── */
    h1 { 
      background: linear-gradient(135deg, #e2e8f0 0%, #c4b5fd 40%, #f0abfc 100%) !important;
      -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
      font-weight: 800 !important; letter-spacing: -0.02em !important;
    }
    h2, h3 {
      color: #e9d5ff !important; font-weight: 700 !important; letter-spacing: -0.01em !important;
    }
    h4, h5, h6 { color: #c4b5fd !important; font-weight: 600 !important; }

    /* ── Labels ── */
    label {
      color: #a78bfa !important; font-weight: 600 !important;
      font-size: 0.82rem !important; letter-spacing: 0.03em !important;
      text-transform: uppercase !important;
    }

    /* ── Paragraphs & text ── */
    p, span, div { font-family: 'Segoe UI', system-ui, sans-serif !important; }
    [class*="text-gray-400"], [class*="text-gray-300"], [class*="text-purple-200"] {
      color: #8b8bb0 !important;
    }

    /* ── Sliders / range inputs ── */
    input[type="range"] {
      -webkit-appearance: none !important; appearance: none !important;
      height: 4px !important; border-radius: 4px !important;
      background: linear-gradient(90deg, rgba(139,92,246,0.4), rgba(236,72,153,0.3)) !important;
      border: none !important; box-shadow: none !important; padding: 0 !important;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none !important; width: 18px !important; height: 18px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #a855f7, #ec4899) !important;
      box-shadow: 0 0 10px rgba(139,92,246,0.5), 0 0 20px rgba(139,92,246,0.2) !important;
      cursor: pointer !important; border: 2px solid rgba(255,255,255,0.2) !important;
    }

    /* ── Grid layouts: tighter gaps ── */
    [class*="grid"][class*="gap-6"] { gap: 16px !important; }

    /* ── Scrollbars ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(6,6,15,0.5); }
    ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.5); }

    /* ── Progress bars ── */
    [class*="bg-purple"][class*="h-2"], [class*="bg-purple"][class*="h-1"],
    [class*="bg-gradient"][class*="h-2"] {
      background: linear-gradient(90deg, #a855f7, #ec4899) !important;
      border-radius: 8px !important;
      box-shadow: 0 0 8px rgba(139,92,246,0.4) !important;
    }

    /* ── Badges & tags ── */
    [class*="rounded-full"][class*="px-"] {
      background: rgba(139,92,246,0.1) !important;
      border: 1px solid rgba(139,92,246,0.2) !important;
      color: #c4b5fd !important; font-weight: 500 !important;
      font-size: 0.75rem !important; letter-spacing: 0.04em !important;
    }

    /* ── Dividers ── */
    hr, [class*="border-gray"], [class*="divide-gray"] > * + * {
      border-color: rgba(139,92,246,0.08) !important;
    }

    /* ── Lucide icons: neon glow ── */
    .lucide { filter: drop-shadow(0 0 4px rgba(139,92,246,0.3)); }
    svg[class*="text-purple"] { color: #a855f7 !important; filter: drop-shadow(0 0 6px rgba(139,92,246,0.4)); }
    svg[class*="text-pink"] { color: #ec4899 !important; filter: drop-shadow(0 0 6px rgba(236,72,153,0.4)); }
    svg[class*="text-blue"] { color: #3b82f6 !important; filter: drop-shadow(0 0 6px rgba(59,130,246,0.4)); }
    svg[class*="text-green"] { color: #22c55e !important; filter: drop-shadow(0 0 6px rgba(34,197,94,0.4)); }

    /* ── Tab-like navigation inside pages ── */
    [role="tablist"], [class*="flex"][class*="gap-2"][class*="mb-"],
    [class*="flex"][class*="space-x"] {
      border-bottom: 1px solid rgba(139,92,246,0.1) !important;
      padding-bottom: 2px !important;
    }
    [role="tab"], [class*="tab"] {
      border-radius: 8px 8px 0 0 !important;
      transition: all 0.2s !important;
    }

    /* ── Tooltips & popovers ── */
    [role="tooltip"], [data-state="open"] {
      background: rgba(8,8,18,0.95) !important;
      border: 1px solid rgba(139,92,246,0.2) !important;
      backdrop-filter: blur(16px) !important;
      border-radius: 10px !important;
    }

    /* ── Tables ── */
    table { border-collapse: separate !important; border-spacing: 0 !important; }
    th { 
      background: rgba(139,92,246,0.06) !important; color: #a78bfa !important;
      font-size: 0.75rem !important; text-transform: uppercase !important;
      letter-spacing: 0.06em !important; font-weight: 600 !important;
    }
    td { border-bottom: 1px solid rgba(255,255,255,0.03) !important; color: #c4c4e0 !important; }
    tr:hover td { background: rgba(139,92,246,0.04) !important; }

    /* ── Animations for page entrance ── */
    [data-component-name] > div:first-child {
      animation: floatUp 0.4s ease-out;
    }
  `
  document.head.appendChild(style)
}

function OwnerDashboard() {
  const [activePage, setActivePage] = React.useState(null)
  const [PageComponent, setPageComponent] = React.useState(null)
  const [pageError, setPageError] = React.useState(null)
  const [loadingPage, setLoadingPage] = React.useState(false)
  React.useEffect(() => { injectCSS() }, [])

  // Listen for navigation events from Chat/Oracle intent routing
  React.useEffect(() => {
    const handler = (e) => {
      const page = e.detail?.page;
      if (page) navigateTo(page);
    };
    window.addEventListener('solace-navigate', handler);
    return () => window.removeEventListener('solace-navigate', handler);
  }, []);

  const navigateTo = (pageName) => {
    setLoadingPage(true)
    setPageError(null)
    setActivePage(pageName)
    import(`./pages/${pageName}.jsx`)
      .then((mod) => { setPageComponent(() => mod.default); setLoadingPage(false) })
      .catch((err) => {
        console.error(`Failed to load ${pageName}:`, err)
        setPageError(`Failed to load ${pageName}: ${err.message || JSON.stringify(err)}`)
        setLoadingPage(false)
      })
  }

  const goHome = () => { setActivePage(null); setPageComponent(null); setPageError(null) }

  const headerStyle = {
    padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(139,92,246,0.12)', background: 'rgba(6,6,15,0.8)', backdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 50,
  }
  const logoStyle = {
    fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  }

  // ── Global floating app launcher (visible on EVERY page) — TOP, draggable, professional ──
  const AppLauncher = () => {
    const [open, setOpen] = React.useState(false)
    const [launcherPos, setLauncherPos] = React.useState({ x: Math.max(0, (window.innerWidth / 2) - 30), y: 10 })
    const [draggingLauncher, setDraggingLauncher] = React.useState(false)
    const launcherDragOff = React.useRef({ x: 0, y: 0 })

    React.useEffect(() => {
      if (!draggingLauncher) return
      const onMove = (e) => {
        setLauncherPos({
          x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - launcherDragOff.current.x)),
          y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - launcherDragOff.current.y)),
        })
      }
      const onUp = () => setDraggingLauncher(false)
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
      window.addEventListener('touchmove', (e) => { const t = e.touches[0]; onMove(t) })
      window.addEventListener('touchend', onUp)
      return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    }, [draggingLauncher])

    const startDrag = (e) => {
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0
      launcherDragOff.current = { x: clientX - launcherPos.x, y: clientY - launcherPos.y }
      setDraggingLauncher(true)
    }

    return (
      <>
        {/* Floating launcher button — TOP of screen, draggable */}
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          style={{
            position: 'fixed', left: launcherPos.x, top: launcherPos.y, zIndex: 9999,
            touchAction: 'none', userSelect: 'none',
          }}
        >
          <button
            onClick={() => { if (!draggingLauncher) setOpen(!open) }}
            style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: open ? 'rgba(244,63,94,0.85)' : 'rgba(15,15,30,0.85)',
              border: open ? '1px solid rgba(244,63,94,0.4)' : '1px solid rgba(139,92,246,0.2)',
              cursor: draggingLauncher ? 'grabbing' : 'grab',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 24px rgba(139,92,246,0.15)',
              backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: draggingLauncher ? 'none' : 'all 0.3s',
            }}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            )}
          </button>
          {!open && <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.55rem', fontFamily: 'monospace', letterSpacing: '0.05em', marginTop: '2px', pointerEvents: 'none' }}>APPS</div>}
        </div>

        {/* App grid overlay */}
        {open && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(6,6,15,0.95)', backdropFilter: 'blur(30px)',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '24px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ ...logoStyle, fontSize: '1.4rem' }}>SOLACE Apps</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>Open any app from anywhere</div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)',
                borderRadius: '10px', padding: '8px 20px', color: '#fca5a5', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600,
              }}>Close</button>
            </div>

            <div style={{ flex: 1, padding: '12px 24px 100px', overflowY: 'auto' }}>
              {/* Main apps grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                {APPS.map((app, i) => {
                  const nc = neonColors[app.ci]
                  return (
                    <div key={app.name}
                      onClick={() => { setOpen(false); navigateTo(app.page); }}
                      style={{
                        background: 'rgba(10,10,20,0.7)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
                        padding: '20px 14px', textAlign: 'center', cursor: 'pointer',
                        transition: 'all 0.25s',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = nc.glow + '40'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', background: nc.bg, border: `1px solid ${nc.glow}22` }}>
                        <Icon path={ICONS[app.icon]} color={nc.glow} size={22} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '2px' }}>{app.name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.3 }}>{app.desc}</div>
                    </div>
                  )
                })}
              </div>

              {/* All pages quick links */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>All Pages</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                {allPages.map((page) => (
                  <div key={page} className="page-pill" onClick={() => { setOpen(false); navigateTo(page); }}>
                    {page.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Render loaded page
  if (activePage && PageComponent && !loadingPage) {
    const isChat = activePage === 'Chat';
    return (
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div style={headerStyle}>
            <div style={{ ...logoStyle, cursor: 'pointer' }} onClick={goHome}>SOLACE</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{activePage.replace(/([A-Z])/g, ' $1').trim()}</span>
              <button onClick={goHome} style={{
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: '8px', padding: '6px 16px', color: '#c4b5fd', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s',
              }}>Back</button>
            </div>
          </div>
          <PageErrorBoundary onBack={goHome}>
            <React.Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid rgba(139,92,246,0.2)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spinLoader 0.8s linear infinite' }} />
              </div>
            }>
              <PageComponent />
            </React.Suspense>
          </PageErrorBoundary>
          <AppLauncher />
          {/* Hide OracleMaster on Chat page (it has its own oracle). Show as minimal draggable orb on all other pages */}
          {!isChat && <OracleMaster onNavigate={navigateTo} onGoHome={goHome} minimal />}
        </div>
      </BrowserRouter>
    )
  }

  // Loading state
  if (loadingPage) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '2px solid rgba(139,92,246,0.15)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spinLoader 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem', letterSpacing: '0.05em' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Page load error
  if (pageError) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Icon path={ICONS.crisis} color="#f43f5e" size={22} />
          </div>
          <p style={{ color: '#f87171', marginBottom: '16px', fontSize: '0.9rem' }}>{pageError}</p>
          <button onClick={goHome} className="page-pill" style={{ display: 'inline-block', color: '#c4b5fd' }}>Back</button>
        </div>
        <AppLauncher />
      </div>
    )
  }

  // Main landing — FULL-SCREEN ORACLE is the single interface, one Oracle only
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif", position: 'relative' }}>
      {/* Full-screen Oracle — the ONE and ONLY oracle on the main screen */}
      <OracleMaster onNavigate={navigateTo} onGoHome={goHome} fullScreen />

      {/* App launcher — draggable at top of screen */}
      <AppLauncher />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<OwnerDashboard />)
