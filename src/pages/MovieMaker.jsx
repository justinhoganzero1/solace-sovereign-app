import React, { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Film, Download, Loader2, Sparkles, ChevronLeft, Clapperboard, Wand2, Users, Eye, Volume2, Layers, Play, RotateCcw, Palette, Settings2, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Helpers ─── */
const wait = ms => new Promise(r => setTimeout(r, ms));
const norm = l => l.replace(/^[\s\-\*\d.)]+/, '').trim();
const splitSections = s => { const p = s.split(/\n{2,}/).map(x => x.trim()).filter(Boolean); return p.length ? p : s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean); };
const extractDlg = s => s.split('\n').map(l => norm(l)).filter(Boolean).map(l => { const m = l.match(/^([A-Za-z][A-Za-z\s]{1,24}):\s*(.+)$/); return m ? { character: m[1].trim(), line: m[2].trim() } : null; }).filter(Boolean);
const inferChars = (s, d) => { const n = d.map(e => e.character); const t = s.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b/g) || []; const stop = new Set(['The', 'This', 'That', 'Scene', 'Camera', 'Night', 'Day', 'Interior', 'Exterior']); return [...new Set([...n, ...t].filter(x => x && !stop.has(x)))].slice(0, 8).map((name, i) => ({ name, role: i === 0 ? 'lead' : 'supporting' })); };
const buildScenes = (secs, dur, genre) => { const n = Math.max(secs.length, 1); const b = Math.max(2, Math.floor(dur / n)); return secs.map((s, i) => { const c = norm(s); const m = c.match(/(?:in|at|inside|outside|near)\s+([^,.!?]+)/i); return { number: i + 1, description: c, duration: i === n - 1 ? Math.max(2, dur - b * i) : b, setting: m?.[1]?.trim() || `${genre} env ${i + 1}`, visual: ['Wide establishing', 'Close-up', 'Tracking', 'Reaction', 'Over-shoulder', 'Aerial', 'Dutch angle', 'POV'][i % 8] }; }); };

/* ─── Constants ─── */
const PALETTES = {
  drama: ['#7c3aed', '#ec4899', '#a855f7'], comedy: ['#f59e0b', '#ef4444', '#fb923c'], action: ['#dc2626', '#0f172a', '#f97316'],
  scifi: ['#06b6d4', '#8b5cf6', '#22d3ee'], horror: ['#991b1b', '#111827', '#dc2626'], romance: ['#db2777', '#fb7185', '#f472b6'],
  documentary: ['#0f766e', '#2563eb', '#14b8a6'], fantasy: ['#4f46e5', '#22c55e', '#a78bfa']
};

const STYLES = {
  '8k_realistic': { name: '8K Cinematic', desc: 'Photorealistic Ultra HD', icon: Eye, accent: '#a78bfa' },
  'animated_3d': { name: '3D Animated', desc: 'Pixar-quality Ray-traced', icon: Layers, accent: '#22d3ee' },
  'anime': { name: 'Anime', desc: 'Japanese Cel-shaded', icon: Star, accent: '#f472b6' },
  'cartoon': { name: 'Toon', desc: 'Stylized Bold-line', icon: Palette, accent: '#fb923c' },
  'claymation': { name: 'Clay', desc: 'Stop-motion Tactile', icon: Settings2, accent: '#a3e635' },
};

const GENRES = [
  { id: 'drama', name: 'Drama', icon: '🎭' }, { id: 'comedy', name: 'Comedy', icon: '😂' },
  { id: 'action', name: 'Action', icon: '💥' }, { id: 'scifi', name: 'Sci-Fi', icon: '🚀' },
  { id: 'horror', name: 'Horror', icon: '👻' }, { id: 'romance', name: 'Romance', icon: '💕' },
  { id: 'documentary', name: 'Doc', icon: '📹' }, { id: 'fantasy', name: 'Fantasy', icon: '🧙' }
];

const STEPS = ['Analyze', 'Cast', 'Render', 'Voice', 'Compose', 'Optimize'];

/* ─── SVG Poster Builder ─── */
function buildPoster(title, genre, _style) {
  const [a, b] = PALETTES[genre] || PALETTES.drama;
  const safe = (title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').substring(0, 22);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="1200" height="675" fill="url(#bg)" rx="24"/><rect x="40" y="40" width="1120" height="595" rx="16" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/><circle cx="1000" cy="120" r="200" fill="rgba(255,255,255,0.04)"/><circle cx="150" cy="580" r="250" fill="rgba(0,0,0,0.2)"/><text x="80" y="160" fill="rgba(255,255,255,0.5)" font-family="monospace" font-size="16" letter-spacing="6">SOLACE STUDIOS PRESENTS</text><text x="80" y="320" fill="white" font-family="system-ui" font-size="80" font-weight="800" filter="url(#glow)">${safe}</text><text x="80" y="400" fill="rgba(255,255,255,0.7)" font-family="system-ui" font-size="32">${(genre || '').toUpperCase()} PRODUCTION</text><rect x="80" y="440" width="120" height="3" fill="rgba(255,255,255,0.3)" rx="2"/><text x="80" y="560" fill="rgba(255,255,255,0.4)" font-family="monospace" font-size="14">AI-GENERATED PRODUCTION PACKAGE</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildSceneCover(sceneNum, genre) {
  const [a, b] = PALETTES[genre] || PALETTES.drama;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="bg${sceneNum}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient></defs><rect width="640" height="360" fill="url(#bg${sceneNum})" rx="12"/><rect x="20" y="20" width="600" height="320" rx="8" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/><text x="320" y="160" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-family="system-ui" font-size="120" font-weight="900">${sceneNum}</text><text x="320" y="220" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="monospace" font-size="14" letter-spacing="4">SCENE ${sceneNum}</text><circle cx="320" cy="280" r="20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/><polygon points="314,272 314,288 330,280" fill="rgba(255,255,255,0.3)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createPackage(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

/* ─── Background ─── */
function CinematicBg({ genre }) {
  const p = PALETTES[genre] || PALETTES.drama;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0, background: '#0a0a1a' }}>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 120% 80% at 20% 10%, ${p[0]}30 0%, transparent 60%), 
                     radial-gradient(ellipse 100% 60% at 80% 90%, ${p[1]}20 0%, transparent 50%), 
                     linear-gradient(180deg, #0a0a1a 0%, #12122a 50%, #0a0a1a 100%)`
      }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p[0]}50, ${p[1]}50, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p[1]}50, ${p[0]}50, transparent)` }} />
    </div>
  );
}

/* ─── Glass Panel ─── */
function GlassPanel({ children, className = '', glow, hover, ...props }) {
  return (
    <motion.div
      className={`mm-glass relative rounded-2xl border border-white/[0.06] ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.008) 100%)',
        backdropFilter: 'blur(24px)',
        boxShadow: glow ? `0 0 60px ${glow}10, inset 0 1px 0 rgba(255,255,255,0.06)` : 'inset 0 1px 0 rgba(255,255,255,0.06)'
      }}
      whileHover={hover ? { scale: 1.01, borderColor: 'rgba(255,255,255,0.12)' } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─── Step Progress ─── */
function StepProgress({ progress }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const threshold = ((i + 1) / STEPS.length) * 100;
        const prevThreshold = (i / STEPS.length) * 100;
        const done = progress >= threshold;
        const active = progress >= prevThreshold && progress < threshold;
        return (
          <div key={step} className="flex items-center gap-1.5">
            <div className={`rounded-full transition-all duration-700 ${active ? 'h-2 w-10 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]' : done ? 'h-1.5 w-7 bg-cyan-400/50' : 'h-1 w-5 bg-white/10'}`} />
            {active && <span className="text-[10px] text-cyan-300 font-mono animate-pulse whitespace-nowrap">{step}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Stat Pill ─── */
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <GlassPanel className="mm-stat p-4 flex flex-col items-center gap-2">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{label}</div>
    </GlassPanel>
  );
}

/* ─── Scene Card ─── */
function SceneCard({ scene, genre, index, active, onClick }) {
  const pal = PALETTES[genre] || PALETTES.drama;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={onClick}
      className={`mm-scene cursor-pointer group relative rounded-2xl overflow-hidden border transition-all duration-300 ${active ? 'border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'border-white/[0.06] hover:border-white/[0.12]'}`}
    >
      <div className="aspect-video relative overflow-hidden">
        <img src={scene.coverUrl} alt={`Scene ${scene.sceneNumber}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white" style={{ background: `${pal[0]}90` }}>
            SC {scene.sceneNumber}
          </div>
          <div className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/60 bg-black/40 backdrop-blur-sm">
            {scene.duration}s
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="text-[10px] text-cyan-300/70 font-mono mb-1">{scene.visual}</div>
          <div className="text-white text-xs font-medium leading-relaxed line-clamp-2">{scene.description}</div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3 space-y-1" style={{ background: 'rgba(3,7,18,0.6)' }}>
        <div className="text-[10px] text-white/30 font-mono">{scene.setting}</div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function MovieMaker() {
  const [tab, setTab] = useState('script');
  const [movieScript, setMovieScript] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState('8k_realistic');
  const [genre, setGenre] = useState('scifi');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [movie, setMovie] = useState(null);
  const [activeScene, setActiveScene] = useState(0);
  const [_detailScene, setDetailScene] = useState(null);
  const scriptRef = useRef(null);

  const pal = PALETTES[genre] || PALETTES.drama;
  const canGenerate = movieScript.trim().length > 10 && movieTitle.trim().length > 0;

  const generate = useCallback(async () => {
    if (!canGenerate) return;
    setGenerating(true); setProgress(0); setMovie(null);
    try {
      // Step 1: Parse user script
      setProgress(5); await wait(200);
      const rawDlg = extractDlg(movieScript);
      const rawSections = splitSections(movieScript);
      const rawChars = inferChars(movieScript, rawDlg);
      setProgress(12); await wait(200);

      let aiScenes = null;
      let aiDialogue = null;
      let aiCharacters = null;

      // Step 2: Try AI-powered screenplay expansion
      setProgress(18);
      try {
        const aiPrompt = `You are an elite AI film director. Expand this screenplay concept into a complete production package.

TITLE: ${movieTitle}
GENRE: ${genre}
STYLE: ${STYLES[style].name}
DURATION: ${duration} seconds
USER SCRIPT:
${movieScript}

Generate a JSON response with this structure:
{
  "scenes": [
    { "number": 1, "description": "Vivid cinematic description of what happens", "setting": "Location description", "visual": "Camera direction (e.g. Wide establishing, Close-up, Tracking shot)", "mood": "Emotional tone", "duration": 10 }
  ],
  "characters": [
    { "name": "Character Name", "role": "lead/supporting", "description": "Brief character description" }
  ],
  "dialogue": [
    { "character": "Name", "line": "What they say", "direction": "How they say it", "timestamp": 0 }
  ],
  "director_notes": "Overall creative direction for this production"
}

Rules:
- Create ${Math.max(3, Math.ceil(duration / 15))} scenes minimum
- Scene durations must sum to approximately ${duration} seconds  
- Expand the user's script with cinematic detail — don't just repeat it
- Add visual directions, mood, and setting for each scene
- If dialogue exists, enhance it. If none, create fitting dialogue
- Characters should have distinct personalities`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: aiPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              scenes: { type: "array", items: { type: "object", properties: { number: {type:"integer"}, description: {type:"string"}, setting: {type:"string"}, visual: {type:"string"}, mood: {type:"string"}, duration: {type:"integer"} }}},
              characters: { type: "array", items: { type: "object", properties: { name: {type:"string"}, role: {type:"string"}, description: {type:"string"} }}},
              dialogue: { type: "array", items: { type: "object", properties: { character: {type:"string"}, line: {type:"string"}, direction: {type:"string"}, timestamp: {type:"integer"} }}},
              director_notes: { type: "string" }
            }
          }
        });
        const aiData = result?.data || result;
        if (aiData?.scenes?.length) {
          aiScenes = aiData.scenes;
          aiDialogue = aiData.dialogue || [];
          aiCharacters = aiData.characters || [];
        }
      } catch (aiErr) {
        console.log('AI expansion unavailable, using enhanced local generation:', aiErr.message);
      }

      setProgress(45); await wait(300);

      // Step 3: Build scenes (AI or enhanced local fallback)
      let renderedScenes;
      if (aiScenes) {
        renderedScenes = aiScenes.map(sc => ({
          sceneNumber: sc.number, duration: sc.duration || Math.ceil(duration / aiScenes.length),
          setting: sc.setting || `${genre} environment`, description: sc.description,
          visual: sc.visual || 'Wide shot', mood: sc.mood || genre,
          coverUrl: buildSceneCover(sc.number, genre)
        }));
      } else {
        // Enhanced local fallback: generate richer scenes from script
        const sections = rawSections.length > 0 ? rawSections : [movieScript];
        const numScenes = Math.max(3, Math.ceil(duration / 15));
        const VISUALS = ['Wide establishing shot', 'Close-up with shallow DOF', 'Tracking dolly shot', 'Over-the-shoulder', 'Aerial crane shot', 'Dutch angle', 'Steadicam follow', 'POV shot', 'Two-shot dialogue', 'Extreme close-up'];
        const MOODS = { drama: ['tense','melancholic','hopeful','confrontational'], comedy: ['upbeat','awkward','chaotic','heartwarming'], action: ['explosive','suspenseful','adrenaline','climactic'], scifi: ['mysterious','awe-inspiring','dystopian','transcendent'], horror: ['dread','paranoia','shock','eerie'], romance: ['tender','passionate','bittersweet','euphoric'], documentary: ['reflective','urgent','revelatory','contemplative'], fantasy: ['magical','ominous','wondrous','epic'] };
        const genreMoods = MOODS[genre] || MOODS.drama;
        renderedScenes = [];
        for (let i = 0; i < numScenes; i++) {
          const sectionText = sections[i % sections.length] || '';
          const cleanText = norm(sectionText);
          const settingMatch = cleanText.match(/(?:INT\.|EXT\.|in|at|inside|outside|near)\s+([^,.!?\n]+)/i);
          renderedScenes.push({
            sceneNumber: i + 1,
            duration: i === numScenes - 1 ? Math.max(3, duration - Math.floor(duration / numScenes) * i) : Math.floor(duration / numScenes),
            setting: settingMatch?.[1]?.trim() || `${genre.charAt(0).toUpperCase()+genre.slice(1)} location ${i+1}`,
            description: cleanText || `Scene ${i+1}: A pivotal ${genre} moment that advances the story of "${movieTitle}".`,
            visual: VISUALS[i % VISUALS.length],
            mood: genreMoods[i % genreMoods.length],
            coverUrl: buildSceneCover(i + 1, genre)
          });
        }
      }

      setProgress(65); await wait(300);

      // Step 4: Build characters
      const characters = aiCharacters?.length > 0
        ? aiCharacters.map(c => ({ name: c.name, role: c.role || 'supporting', description: c.description || '' }))
        : rawChars.length > 0
          ? rawChars.map(c => ({ ...c, description: '' }))
          : [{ name: movieTitle.split(' ')[0] || 'Protagonist', role: 'lead', description: 'The central character' }];

      setProgress(78); await wait(200);

      // Step 5: Build dialogue/voiceover
      const voiceover = aiDialogue?.length > 0
        ? aiDialogue.map(l => ({ character: l.character, line: l.line, timestamp: l.timestamp || 0, voice: `${l.character} - ${STYLES[style].name}`, direction: l.direction || '' }))
        : rawDlg.map((l, i, a) => ({ character: l.character, line: l.line, timestamp: i * Math.max(1, Math.floor(duration / Math.max(a.length, 1))), voice: `${l.character} - ${STYLES[style].name}` }));

      setProgress(90); await wait(200);

      // Step 6: Create downloadable package
      const pkg = createPackage({
        title: movieTitle, genre, duration, style: STYLES[style].name,
        generatedAt: new Date().toISOString(),
        scenes: renderedScenes, characters, dialogue: voiceover,
        productionPlan: {
          opening: renderedScenes[0]?.description,
          midpoint: renderedScenes[Math.floor(renderedScenes.length / 2)]?.description,
          ending: renderedScenes[renderedScenes.length - 1]?.description
        }
      });

      setProgress(100); await wait(250);
      setMovie({
        title: movieTitle, posterUrl: buildPoster(movieTitle, genre, style),
        duration, genre, scenes: renderedScenes, voiceover, characters,
        downloadUrl: pkg, fileSize: `${Math.max(1, renderedScenes.length * 0.8).toFixed(1)} MB`,
        generatedAt: new Date().toISOString()
      });
    } catch (e) { console.error('Generation error:', e); } finally { setGenerating(false); }
  }, [movieScript, movieTitle, duration, style, genre, canGenerate]);

  const download = () => {
    if (!movie) return;
    const a = document.createElement('a');
    a.href = movie.downloadUrl;
    a.download = `${movie.title.replace(/\s+/g, '_')}_package.json`;
    a.click();
  };

  const reset = () => { setMovie(null); setMovieScript(''); setMovieTitle(''); setProgress(0); setActiveScene(0); setDetailScene(null); };

  /* ─── RENDER ─── */
  return (
    <div id="movie-maker-root" className="relative min-h-screen overflow-hidden" style={{ background: '#0a0a1a' }}>
      {/* Simplified CSS overrides */}
      <style>{`
        #movie-maker-root { color: white; }
        #movie-maker-root .mm-glass {
          background: rgba(20,20,40,0.8) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(139,92,246,0.3) !important;
        }
        #movie-maker-root textarea, #movie-maker-root input {
          background: rgba(0,0,0,0.3) !important;
          border: 1px solid rgba(139,92,246,0.3) !important;
          color: white !important;
        }
      `}</style>
      <CinematicBg genre={genre} />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ════ TOP BAR ════ */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]"
          style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="flex items-center gap-1 text-white/40 hover:text-white transition text-xs font-mono">
              <ChevronLeft className="w-3.5 h-3.5" />BACK
            </button>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${pal[0]}, ${pal[1]})` }}>
                <Clapperboard className="w-4.5 h-4.5 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="text-white font-bold text-sm tracking-wide" style={{ letterSpacing: '0.08em' }}>SOLACE STUDIO</div>
                <div className="text-[9px] font-mono tracking-[0.2em]" style={{ color: pal[0] }}>AI MOVIE MAKER</div>
              </div>
            </div>
          </div>

          {generating && <StepProgress progress={progress} />}

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg text-[10px] font-mono border border-white/[0.08]" style={{ color: STYLES[style].accent, background: `${STYLES[style].accent}08` }}>
              {STYLES[style].name}
            </div>
            <div className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-white/40 border border-white/[0.08] bg-white/[0.02]">
              {genre.toUpperCase()}
            </div>
          </div>
        </header>

        {/* ════ MAIN ════ */}
        <div className="flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
            {!movie ? (
              <motion.div key="editor" className="flex-1 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* ──── LEFT SIDEBAR ──── */}
                <div className="mm-sidebar w-[300px] flex-shrink-0 border-r border-white/[0.05] flex flex-col overflow-hidden"
                  style={{ background: 'rgba(3,7,18,0.5)' }}>

                  {/* Sidebar Tabs */}
                  <div className="flex border-b border-white/[0.05]">
                    {[
                      { id: 'script', icon: Film, label: 'Script' },
                      { id: 'style', icon: Palette, label: 'Style' },
                      { id: 'cast', icon: Users, label: 'Cast' }
                    ].map(t => (
                      <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[11px] font-medium transition-all border-b-2 ${tab === t.id
                          ? 'text-white border-cyan-400'
                          : 'text-white/30 border-transparent hover:text-white/50'}`}>
                        <t.icon className="w-3.5 h-3.5" />{t.label}
                      </button>
                    ))}
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                    <AnimatePresence mode="wait">
                      {tab === 'script' && (
                        <motion.div key="s1" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-5">
                          <div>
                            <label className="text-[10px] text-white/40 font-mono uppercase tracking-[0.15em] mb-2 block">Project Title</label>
                            <Input placeholder="My Movie..." value={movieTitle} onChange={e => setMovieTitle(e.target.value)}
                              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/15 h-10 text-sm rounded-xl focus:border-cyan-500/40 focus:ring-cyan-500/10" />
                          </div>
                          <div>
                            <label className="text-[10px] text-white/40 font-mono uppercase tracking-[0.15em] mb-2 block">Duration</label>
                            <div className="flex items-center gap-3">
                              <Input type="number" min={5} max={7200} value={duration} onChange={e => setDuration(parseInt(e.target.value) || 30)}
                                className="bg-white/[0.03] border-white/[0.08] text-white h-10 text-sm rounded-xl w-24 focus:border-cyan-500/40" />
                              <span className="text-[10px] text-white/20 font-mono">sec</span>
                              {duration <= 10 && <span className="text-[9px] text-emerald-400 font-mono px-2 py-0.5 rounded-md bg-emerald-400/10">FREE</span>}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-white/40 font-mono uppercase tracking-[0.15em] mb-2 block">Genre</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {GENRES.map(g => (
                                <button key={g.id} onClick={() => setGenre(g.id)}
                                  className={`py-2.5 rounded-xl text-center transition-all duration-200 ${genre === g.id
                                    ? 'bg-white/[0.08] ring-1 ring-cyan-400/30 scale-[1.03]'
                                    : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                                  <div className="text-xl leading-none">{g.icon}</div>
                                  <div className="text-[8px] text-white/40 mt-1 font-mono">{g.name}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {tab === 'style' && (
                        <motion.div key="s2" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-2">
                          <label className="text-[10px] text-white/40 font-mono uppercase tracking-[0.15em] mb-3 block">Visual Style</label>
                          {Object.entries(STYLES).map(([k, v]) => {
                            const Icon = v.icon;
                            const sel = style === k;
                            return (
                              <button key={k} onClick={() => setStyle(k)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 ${sel ? 'bg-white/[0.06] ring-1' : 'bg-white/[0.015] hover:bg-white/[0.04]'}`}
                                style={sel ? { ringColor: `${v.accent}50` } : {}}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all" style={{ background: `${v.accent}${sel ? '25' : '10'}` }}>
                                  <Icon className="w-5 h-5" style={{ color: v.accent }} />
                                </div>
                                <div className="text-left">
                                  <div className="text-white text-sm font-semibold">{v.name}</div>
                                  <div className="text-[10px] text-white/30">{v.desc}</div>
                                </div>
                                {sel && <div className="ml-auto w-2 h-2 rounded-full" style={{ background: v.accent, boxShadow: `0 0 8px ${v.accent}` }} />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}

                      {tab === 'cast' && (
                        <motion.div key="s3" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3">
                          <label className="text-[10px] text-white/40 font-mono uppercase tracking-[0.15em] block">Auto-Detected Cast</label>
                          <GlassPanel className="p-3">
                            <div className="font-mono text-[10px] text-cyan-300/50 space-y-1 leading-relaxed">
                              <div>Elena: We need to leave now.</div>
                              <div>Marcus: Not without the drive.</div>
                            </div>
                            <div className="mt-2 text-[9px] text-white/20">Use NAME: dialogue format</div>
                          </GlassPanel>
                          {movieScript.trim() && (
                            <div className="space-y-1.5 pt-1">
                              {inferChars(movieScript, extractDlg(movieScript)).map((c, i) => (
                                <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: `${pal[i % 3]}20`, color: pal[i % 3], boxShadow: `inset 0 0 12px ${pal[i % 3]}15` }}>
                                    {c.name[0]}
                                  </div>
                                  <div>
                                    <div className="text-white text-xs font-medium">{c.name}</div>
                                    <div className="text-[9px] text-white/25 font-mono">{c.role}</div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Generate Button */}
                  <div className="p-4 border-t border-white/[0.05]">
                    <motion.button onClick={generate} disabled={!canGenerate || generating}
                      className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      whileHover={canGenerate ? { scale: 1.02 } : {}}
                      whileTap={canGenerate ? { scale: 0.98 } : {}}
                      style={{
                        background: canGenerate && !generating ? `linear-gradient(135deg, ${pal[0]}, ${pal[1]})` : 'rgba(255,255,255,0.04)',
                        color: 'white',
                        boxShadow: canGenerate && !generating ? `0 4px 30px ${pal[0]}25, 0 0 60px ${pal[1]}10` : 'none'
                      }}>
                      {generating
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Generating {progress}%</>
                        : <><Wand2 className="w-4 h-4" />Generate Production</>
                      }
                    </motion.button>
                    {generating && (
                      <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
                        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${pal[0]}, ${pal[1]}, ${pal[0]})`, backgroundSize: '200% 100%' }}
                          animate={{ width: `${progress}%`, backgroundPosition: ['0% 0%', '100% 0%'] }}
                          transition={{ width: { duration: 0.5 }, backgroundPosition: { duration: 2, repeat: Infinity } }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* ──── RIGHT: SCRIPT EDITOR ──── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="text-[10px] text-white/50 font-mono uppercase tracking-[0.2em]">Screenplay Editor</div>
                        <div className="flex items-center gap-3">
                          <div className="text-[10px] text-white/40 font-mono">{movieScript.length} chars</div>
                          {movieScript.trim().length > 0 && (
                            <div className="text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ color: pal[0], background: `${pal[0]}10` }}>
                              {splitSections(movieScript).length} scenes detected
                            </div>
                          )}
                        </div>
                      </div>

                      <GlassPanel className="p-1.5" glow={pal[0]}>
                        <Textarea
                          ref={scriptRef}
                          placeholder={`INT. COFFEE SHOP - NIGHT\n\nElena sits at the corner table, laptop open, fingers frozen above the keyboard. The neon sign outside flickers blue and pink.\n\nElena: I found something. Something they don't want us to see.\n\nMarcus enters through the back door, rain dripping from his jacket. He slides into the booth across from her.\n\nMarcus: Then we'd better move fast. They're already watching.\n\n---\n\nEXT. ROOFTOP - DAWN\n\nThe city stretches out below them, lights fading as the sun breaks the horizon.\n\nElena: After tonight, nothing will be the same.\n\n---\n\nWrite your screenplay above. Separate scenes with blank lines.\nUse CHARACTER: dialogue format for spoken lines.\nThe AI will auto-detect cast, scenes, and structure.`}
                          value={movieScript}
                          onChange={e => setMovieScript(e.target.value)}
                          className="min-h-[65vh] bg-transparent border-0 text-white/90 placeholder:text-white/30 text-sm leading-relaxed resize-none focus:ring-0 focus:outline-none p-4 font-mono"
                          style={{ caretColor: pal[0] }}
                        />
                      </GlassPanel>

                      {/* Quick Tips */}
                      <div className="flex items-center gap-4 px-1">
                        {[
                          { icon: Film, text: 'Blank lines = new scene' },
                          { icon: Users, text: 'Name: text = dialogue' },
                          { icon: Sparkles, text: 'Be descriptive for richer output' },
                        ].map((tip, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[9px] text-white/40">
                            <tip.icon className="w-3 h-3" />{tip.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ════════════════════════════════
                 RESULTS VIEW
                 ════════════════════════════════ */
              <motion.div key="results" className="flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="max-w-6xl mx-auto p-6 space-y-8">

                  {/* Hero Poster */}
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <GlassPanel className="overflow-hidden" glow={pal[0]}>
                      <div className="aspect-[21/9] relative">
                        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-[11px] font-mono tracking-[0.3em] mb-2" style={{ color: pal[0] }}>PRODUCTION COMPLETE</div>
                              <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: `0 0 40px ${pal[0]}40` }}>{movie.title}</h1>
                              <div className="text-sm text-white/50">{movie.genre.toUpperCase()} • {STYLES[style].name} • {movie.generatedAt.split('T')[0]}</div>
                            </div>
                            <div className="flex gap-2">
                              <motion.button onClick={download} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 text-white"
                                style={{ background: `linear-gradient(135deg, ${pal[0]}, ${pal[1]})`, boxShadow: `0 4px 20px ${pal[0]}30` }}>
                                <Download className="w-4 h-4" />Download Package
                              </motion.button>
                              <motion.button onClick={reset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 text-white/70 bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1]">
                                <RotateCcw className="w-4 h-4" />New Project
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassPanel>
                  </motion.div>

                  {/* Stats Row */}
                  <motion.div className="grid grid-cols-5 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <StatPill icon={Clock} label="Duration" value={`${movie.duration}s`} color={pal[0]} />
                    <StatPill icon={Film} label="Scenes" value={movie.scenes.length} color={pal[1]} />
                    <StatPill icon={Users} label="Cast" value={movie.characters.length} color="#22d3ee" />
                    <StatPill icon={Volume2} label="Lines" value={movie.voiceover.length} color="#a78bfa" />
                    <StatPill icon={Download} label="Package" value={movie.fileSize} color="#34d399" />
                  </motion.div>

                  {/* Scene Timeline */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[11px] text-white/40 font-mono uppercase tracking-[0.2em]">Scene Timeline</div>
                      <div className="text-[10px] text-white/20 font-mono">{movie.scenes.length} scenes • {movie.duration}s total</div>
                    </div>

                    {/* Timeline bar */}
                    <div className="mb-4 h-1 rounded-full bg-white/[0.04] overflow-hidden flex">
                      {movie.scenes.map((sc, i) => (
                        <div key={i}
                          className="h-full cursor-pointer transition-opacity hover:opacity-100"
                          style={{
                            width: `${(sc.duration / movie.duration) * 100}%`,
                            background: `linear-gradient(90deg, ${pal[i % 3]}, ${pal[(i + 1) % 3]})`,
                            opacity: activeScene === i ? 1 : 0.4
                          }}
                          onClick={() => setActiveScene(i)}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {movie.scenes.map((scene, i) => (
                        <SceneCard key={scene.sceneNumber} scene={scene} genre={genre} index={i}
                          active={activeScene === i} onClick={() => setActiveScene(i)} />
                      ))}
                    </div>
                  </motion.div>

                  {/* Cast & Dialogue */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Cast */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <div className="text-[11px] text-white/40 font-mono uppercase tracking-[0.2em] mb-4">Cast</div>
                      <GlassPanel className="p-5 space-y-3" glow={pal[1]}>
                        {movie.characters.map((c, i) => (
                          <div key={c.name} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{ background: `${pal[i % 3]}20`, color: pal[i % 3], boxShadow: `0 0 20px ${pal[i % 3]}10` }}>
                              {c.name[0]}
                            </div>
                            <div className="flex-1">
                              <div className="text-white text-sm font-semibold">{c.name}</div>
                              <div className="text-[10px] text-white/25 font-mono">{c.role}</div>
                            </div>
                            <div className="text-[9px] font-mono px-2 py-0.5 rounded-md" style={{ color: pal[i % 3], background: `${pal[i % 3]}10` }}>
                              {movie.voiceover.filter(v => v.character === c.name).length} lines
                            </div>
                          </div>
                        ))}
                      </GlassPanel>
                    </motion.div>

                    {/* Dialogue */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                      <div className="text-[11px] text-white/40 font-mono uppercase tracking-[0.2em] mb-4">Dialogue Script</div>
                      <GlassPanel className="p-5 space-y-3 max-h-80 overflow-y-auto" glow={pal[0]} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        {movie.voiceover.length > 0 ? movie.voiceover.map((line, i) => {
                          const charIdx = movie.characters.findIndex(c => c.name === line.character);
                          const col = pal[Math.max(charIdx, 0) % 3];
                          return (
                            <div key={i} className="flex gap-3 text-sm">
                              <div className="text-[10px] font-mono text-white/15 w-8 text-right flex-shrink-0 pt-0.5">{line.timestamp}s</div>
                              <div>
                                <span className="font-bold text-xs" style={{ color: col }}>{line.character}</span>
                                <span className="text-white/60 ml-2">{line.line}</span>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="text-white/20 text-sm text-center py-8">No dialogue detected. Add CHARACTER: line format to your script.</div>
                        )}
                      </GlassPanel>
                    </motion.div>
                  </div>

                  {/* Production Plan */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <div className="text-[11px] text-white/40 font-mono uppercase tracking-[0.2em] mb-4">Production Plan</div>
                    <GlassPanel className="p-6" glow={pal[0]}>
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { label: 'Opening Hook', desc: movie.scenes[0]?.description, num: '01' },
                          { label: 'Midpoint Beat', desc: movie.scenes[Math.floor(movie.scenes.length / 2)]?.description, num: '02' },
                          { label: 'Closing Shot', desc: movie.scenes[movie.scenes.length - 1]?.description, num: '03' },
                        ].map((beat, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md" style={{ color: pal[i], background: `${pal[i]}15` }}>{beat.num}</div>
                              <div className="text-xs text-white/60 font-semibold">{beat.label}</div>
                            </div>
                            <div className="text-white/40 text-xs leading-relaxed">{beat.desc || 'Scene content will appear here'}</div>
                          </div>
                        ))}
                      </div>
                    </GlassPanel>
                  </motion.div>

                  {/* Bottom spacer */}
                  <div className="h-8" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
