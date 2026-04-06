import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2, 
  Download, Shield, Cpu, HardDrive, Wifi, WifiOff, Zap, Terminal,
  GitBranch, Database, Eye, Settings, RotateCcw, Play, Pause,
  ChevronDown, ChevronRight, Clock, Search, FileText, AlertOctagon,
  MessageCircle, Send, Mic, MicOff, Wrench, Bot
} from 'lucide-react';
import { base44 } from '../api/base44Client';

const GITHUB_REPO = 'justinhoganzero1/solace-sovereign-app';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`;
const GITHUB_RAW = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;

// All known pages in the app
const ALL_PAGES = [
  'AllSpecialists', 'AvatarCustomizer', 'AvatarGenerator', 'Builder', 'Chat',
  'CommunityHub', 'CrisisHub', 'Dashboard', 'DiagnosticCenter', 'DigitalMall',
  'EmpireProfile', 'FamilyHub', 'Handyman', 'Home', 'Interpreter', 'Inventor',
  'LiveVision', 'Mechanic', 'MediaLibrary', 'MindHub', 'MovieMaker',
  'Onboarding', 'OracleCouncil', 'OracleTrainingCenter', 'OwnerDashboard',
  'PhygitalHub', 'PointAndShoot', 'ProfessionalHub', 'Profile', 'Safety',
  'SafetyCenter', 'SafetyCenter2090', 'Settings', 'SovereignEmpire',
  'SovereignMall', 'SpecialistChat', 'SplashChat', 'SplashHome',
  'SplashInterpreter', 'SplashLanding', 'SplashSpecialists', 'TierSystem',
  'TitanHeart', 'VideoEditor', 'VoiceGenerator', 'WellnessCenter'
];

// All known components
const ALL_COMPONENTS = [
  'OracleMaster', 'oracle/AnimatedOracle'
];

// Storage keys used by the app
const STORAGE_KEYS = [
  'solace_user', 'solace_profiles', 'solace_settings', 'solace_media',
  'solace_conversations', 'openai_api_key'
];

const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PASS: 'pass',
  FAIL: 'fail',
  WARN: 'warn',
  FIXED: 'fixed'
};

const statusIcon = (status) => {
  switch (status) {
    case STATUS.PASS: return <CheckCircle size={16} color="#22c55e" />;
    case STATUS.FAIL: return <XCircle size={16} color="#ef4444" />;
    case STATUS.WARN: return <AlertTriangle size={16} color="#f59e0b" />;
    case STATUS.FIXED: return <CheckCircle size={16} color="#06b6d4" />;
    case STATUS.RUNNING: return <RefreshCw size={16} color="#a855f7" style={{ animation: 'spin 1s linear infinite' }} />;
    default: return <Clock size={16} color="#64748b" />;
  }
};

const statusColor = (status) => {
  switch (status) {
    case STATUS.PASS: return '#22c55e';
    case STATUS.FAIL: return '#ef4444';
    case STATUS.WARN: return '#f59e0b';
    case STATUS.FIXED: return '#06b6d4';
    case STATUS.RUNNING: return '#a855f7';
    default: return '#64748b';
  }
};

export default function DiagnosticCenter() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRepair, setAutoRepair] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [repairLog, setRepairLog] = useState([]);
  const [gitStatus, setGitStatus] = useState(null);
  const [gitCommits, setGitCommits] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [aiChatMessages, setAiChatMessages] = useState([
    { role: 'ai', content: 'I\'m your Diagnostic AI. Tell me what\'s broken or not working and I\'ll diagnose and fix it. I have full access to all app pages, storage, components, and settings.' }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [aiListening, setAiListening] = useState(false);
  const aiRecognitionRef = useRef(null);
  const logRef = useRef(null);
  const aiChatEndRef = useRef(null);

  const addLog = useCallback((msg, type = 'info') => {
    const entry = { time: new Date().toLocaleTimeString(), msg, type };
    setRepairLog(prev => [...prev, entry]);
    setConsoleOutput(prev => [...prev.slice(-200), entry]);
  }, []);

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ═══════════════════════════════════════════
  // DIAGNOSTIC CHECKS
  // ═══════════════════════════════════════════

  const checkPageImports = async () => {
    addLog('Scanning all page imports...', 'info');
    const results = [];

    for (const page of ALL_PAGES) {
      try {
        await import(`../pages/${page}.jsx`);
        results.push({ name: `Page: ${page}`, status: STATUS.PASS, detail: 'Loads successfully' });
      } catch (err) {
        results.push({ 
          name: `Page: ${page}`, 
          status: STATUS.FAIL, 
          detail: `Import error: ${err.message}`,
          fixable: false 
        });
        addLog(`FAIL: ${page} — ${err.message}`, 'error');
      }
    }

    return { category: 'Page Imports', icon: <FileText size={18} />, results };
  };

  const checkComponentImports = async () => {
    addLog('Scanning component imports...', 'info');
    const results = [];

    for (const comp of ALL_COMPONENTS) {
      try {
        await import(`../components/${comp}.jsx`);
        results.push({ name: `Component: ${comp}`, status: STATUS.PASS, detail: 'Loads successfully' });
      } catch (err) {
        results.push({ 
          name: `Component: ${comp}`, 
          status: STATUS.FAIL, 
          detail: `Import error: ${err.message}`,
          fixable: false
        });
        addLog(`FAIL: Component ${comp} — ${err.message}`, 'error');
      }
    }

    return { category: 'Component Imports', icon: <Cpu size={18} />, results };
  };

  const checkLocalStorage = () => {
    addLog('Checking localStorage integrity...', 'info');
    const results = [];

    // Check total storage usage
    let totalSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        totalSize += (key.length + (val ? val.length : 0)) * 2; // UTF-16
      }
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      const maxMB = 5; // typical browser limit
      const pct = ((totalSize / (maxMB * 1024 * 1024)) * 100).toFixed(1);
      
      results.push({
        name: 'Storage Usage',
        status: parseFloat(pct) > 80 ? STATUS.WARN : STATUS.PASS,
        detail: `${sizeMB} MB used (${pct}% of ~${maxMB} MB limit)`
      });
    } catch (err) {
      results.push({ name: 'Storage Access', status: STATUS.FAIL, detail: err.message });
    }

    // Check individual keys
    for (const key of STORAGE_KEYS) {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          JSON.parse(val); // validate JSON
          results.push({ name: `Key: ${key}`, status: STATUS.PASS, detail: `Valid (${val.length} chars)` });
        } else {
          results.push({ name: `Key: ${key}`, status: STATUS.WARN, detail: 'Not set' });
        }
      } catch (err) {
        results.push({ 
          name: `Key: ${key}`, 
          status: STATUS.FAIL, 
          detail: 'Corrupted JSON data',
          fixable: true,
          fixAction: () => { localStorage.removeItem(key); }
        });
      }
    }

    // Check all entity storage
    let entityCount = 0;
    let corruptEntities = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('solace_entity_')) {
        entityCount++;
        try {
          JSON.parse(localStorage.getItem(key));
        } catch {
          corruptEntities.push(key);
        }
      }
    }
    
    results.push({
      name: 'Entity Storage',
      status: corruptEntities.length > 0 ? STATUS.FAIL : STATUS.PASS,
      detail: `${entityCount} entities found, ${corruptEntities.length} corrupted`,
      fixable: corruptEntities.length > 0,
      fixAction: () => { corruptEntities.forEach(k => localStorage.removeItem(k)); }
    });

    return { category: 'Local Storage', icon: <Database size={18} />, results };
  };

  const checkBrowserAPIs = () => {
    addLog('Checking browser API availability...', 'info');
    const results = [];

    // Speech Recognition
    const hasSpeech = !!(window['SpeechRecognition'] || window['webkitSpeechRecognition']);
    results.push({
      name: 'Speech Recognition',
      status: hasSpeech ? STATUS.PASS : STATUS.WARN,
      detail: hasSpeech ? 'Available' : 'Not supported — voice input disabled'
    });

    // Speech Synthesis
    results.push({
      name: 'Speech Synthesis',
      status: window.speechSynthesis ? STATUS.PASS : STATUS.WARN,
      detail: window.speechSynthesis ? `Available (${window.speechSynthesis.getVoices().length} voices)` : 'Not supported'
    });

    // MediaDevices (camera/mic)
    results.push({
      name: 'MediaDevices (Camera/Mic)',
      status: navigator.mediaDevices ? STATUS.PASS : STATUS.FAIL,
      detail: navigator.mediaDevices ? 'Available' : 'Not available — HTTPS required'
    });

    // Service Worker
    results.push({
      name: 'Service Worker',
      status: 'serviceWorker' in navigator ? STATUS.PASS : STATUS.WARN,
      detail: 'serviceWorker' in navigator ? 'Supported' : 'Not supported — offline mode unavailable'
    });

    // IndexedDB
    results.push({
      name: 'IndexedDB',
      status: window.indexedDB ? STATUS.PASS : STATUS.WARN,
      detail: window.indexedDB ? 'Available' : 'Not available'
    });

    // WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      results.push({
        name: 'WebGL',
        status: gl ? STATUS.PASS : STATUS.WARN,
        detail: gl ? `${gl.getParameter(gl.RENDERER)}` : 'Not available — 3D features limited'
      });
    } catch {
      results.push({ name: 'WebGL', status: STATUS.WARN, detail: 'Could not test' });
    }

    // Clipboard
    results.push({
      name: 'Clipboard API',
      status: navigator.clipboard ? STATUS.PASS : STATUS.WARN,
      detail: navigator.clipboard ? 'Available' : 'Not available'
    });

    // Notifications
    results.push({
      name: 'Notifications',
      status: 'Notification' in window ? 
        (Notification.permission === 'granted' ? STATUS.PASS : STATUS.WARN) : STATUS.FAIL,
      detail: 'Notification' in window ? `Permission: ${Notification.permission}` : 'Not supported'
    });

    return { category: 'Browser APIs', icon: <Shield size={18} />, results };
  };

  const checkNetworkConnectivity = async () => {
    addLog('Testing network connectivity...', 'info');
    const results = [];

    // Basic online check
    results.push({
      name: 'Network Status',
      status: navigator.onLine ? STATUS.PASS : STATUS.FAIL,
      detail: navigator.onLine ? 'Online' : 'Offline — some features unavailable'
    });

    // Test GitHub API
    try {
      const resp = await fetch(`${GITHUB_API}`, { method: 'GET', signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const data = await resp.json();
        results.push({ name: 'GitHub Repository', status: STATUS.PASS, detail: `Connected — ${data.full_name}` });
      } else {
        results.push({ name: 'GitHub Repository', status: STATUS.WARN, detail: `HTTP ${resp.status}` });
      }
    } catch (err) {
      results.push({ name: 'GitHub Repository', status: STATUS.FAIL, detail: `Unreachable: ${err.message}` });
    }

    // Test OpenAI API key
    const apiKey = localStorage.getItem('openai_api_key');
    if (apiKey) {
      try {
        const resp = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(5000)
        });
        results.push({
          name: 'OpenAI API Key',
          status: resp.ok ? STATUS.PASS : STATUS.FAIL,
          detail: resp.ok ? 'Valid and connected' : `Invalid — HTTP ${resp.status}`
        });
      } catch (err) {
        results.push({ name: 'OpenAI API Key', status: STATUS.WARN, detail: `Could not verify: ${err.message}` });
      }
    } else {
      results.push({ name: 'OpenAI API Key', status: STATUS.WARN, detail: 'Not set — Oracle using local knowledge only' });
    }

    return { category: 'Network & Services', icon: <Wifi size={18} />, results };
  };

  const checkPerformance = () => {
    addLog('Running performance checks...', 'info');
    const results = [];

    // Memory
    const perfMemory = /** @type {any} */ (performance).memory;
    if (perfMemory) {
      const used = (perfMemory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
      const total = (perfMemory.totalJSHeapSize / (1024 * 1024)).toFixed(1);
      const limit = (perfMemory.jsHeapSizeLimit / (1024 * 1024)).toFixed(0);
      const pct = ((perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit) * 100).toFixed(1);
      
      results.push({
        name: 'JS Heap Memory',
        status: parseFloat(pct) > 80 ? STATUS.WARN : STATUS.PASS,
        detail: `${used} MB / ${total} MB allocated (${pct}% of ${limit} MB limit)`,
        fixable: parseFloat(pct) > 60,
        fixAction: () => { 
          // Clear image cache and unnecessary data
          if (window['gc']) window['gc']();
        }
      });
    }

    // DOM Node count
    const nodeCount = document.querySelectorAll('*').length;
    results.push({
      name: 'DOM Nodes',
      status: nodeCount > 3000 ? STATUS.WARN : STATUS.PASS,
      detail: `${nodeCount} nodes ${nodeCount > 3000 ? '(high — may cause slowness)' : '(healthy)'}`
    });

    // Event listeners estimate
    const perfEntries = performance.getEntriesByType('navigation');
    if (perfEntries.length > 0) {
      const nav = /** @type {PerformanceNavigationTiming} */ (perfEntries[0]);
      results.push({
        name: 'Page Load Time',
        status: nav.loadEventEnd - nav.startTime > 5000 ? STATUS.WARN : STATUS.PASS,
        detail: `${(nav.loadEventEnd - nav.startTime).toFixed(0)} ms`
      });
      results.push({
        name: 'DOM Content Loaded',
        status: STATUS.PASS,
        detail: `${(nav.domContentLoadedEventEnd - nav.startTime).toFixed(0)} ms`
      });
    }

    // Check for console errors
    results.push({
      name: 'Console Error Monitor',
      status: STATUS.PASS,
      detail: 'Active — errors will appear in repair log'
    });

    return { category: 'Performance', icon: <Activity size={18} />, results };
  };

  const checkAppState = () => {
    addLog('Checking app state consistency...', 'info');
    const results = [];

    // Check user profile
    try {
      const user = JSON.parse(localStorage.getItem('solace_user') || 'null');
      results.push({
        name: 'User Session',
        status: user ? STATUS.PASS : STATUS.WARN,
        detail: user ? `Logged in as ${user.name || user.email}` : 'No user session',
        fixable: !user,
        fixAction: () => {
          localStorage.setItem('solace_user', JSON.stringify({
            email: 'justinbretthogan@gmail.com',
            id: 'owner_user_123',
            role: 'owner',
            name: 'Justin Brett Hogan'
          }));
        }
      });
    } catch {
      results.push({ 
        name: 'User Session', 
        status: STATUS.FAIL, 
        detail: 'Corrupted',
        fixable: true,
        fixAction: () => { localStorage.removeItem('solace_user'); }
      });
    }

    // Check profile entity
    try {
      const profiles = JSON.parse(localStorage.getItem('solace_entity_UserProfile') || '[]');
      results.push({
        name: 'User Profile Entity',
        status: profiles.length > 0 ? STATUS.PASS : STATUS.WARN,
        detail: `${profiles.length} profile(s) found`,
        fixable: profiles.length === 0,
        fixAction: () => {
          localStorage.setItem('solace_entity_UserProfile', JSON.stringify([{
            id: 'profile_owner_123',
            created_by: 'justinbretthogan@gmail.com',
            email: 'justinbretthogan@gmail.com',
            full_name: 'Justin Brett Hogan',
            tier: 'owner',
            subscription_tier: 'owner',
            oracle_gender: 'female',
            created_at: new Date().toISOString()
          }]));
        }
      });
    } catch {
      results.push({ name: 'User Profile Entity', status: STATUS.FAIL, detail: 'Corrupted data' });
    }

    // React root check
    const root = document.getElementById('root');
    results.push({
      name: 'React Root Mount',
      status: root && root.children.length > 0 ? STATUS.PASS : STATUS.FAIL,
      detail: root ? `Mounted with ${root.children.length} children` : 'Root element missing'
    });

    // CSS injection check
    const css = document.getElementById('solace-neon-css');
    results.push({
      name: 'Global CSS Injection',
      status: css ? STATUS.PASS : STATUS.WARN,
      detail: css ? 'Injected and active' : 'Missing — styles may not render correctly'
    });

    return { category: 'App State', icon: <Settings size={18} />, results };
  };

  // ═══════════════════════════════════════════
  // RUN ALL DIAGNOSTICS
  // ═══════════════════════════════════════════

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    setRepairLog([]);
    addLog('═══ SOLACE Diagnostic System v2.0 ═══', 'system');
    addLog('Starting full system scan...', 'info');

    const allResults = [];

    // Run checks sequentially for clean logging
    const appState = checkAppState();
    allResults.push(appState);
    setDiagnostics([...allResults]);

    const storage = checkLocalStorage();
    allResults.push(storage);
    setDiagnostics([...allResults]);

    const browserAPIs = checkBrowserAPIs();
    allResults.push(browserAPIs);
    setDiagnostics([...allResults]);

    const perf = checkPerformance();
    allResults.push(perf);
    setDiagnostics([...allResults]);

    const network = await checkNetworkConnectivity();
    allResults.push(network);
    setDiagnostics([...allResults]);

    const pages = await checkPageImports();
    allResults.push(pages);
    setDiagnostics([...allResults]);

    const components = await checkComponentImports();
    allResults.push(components);
    setDiagnostics([...allResults]);

    // Calculate health score
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let warnings = 0;

    allResults.forEach(cat => {
      cat.results.forEach(r => {
        totalChecks++;
        if (r.status === STATUS.PASS || r.status === STATUS.FIXED) passedChecks++;
        else if (r.status === STATUS.FAIL) failedChecks++;
        else if (r.status === STATUS.WARN) warnings++;
      });
    });

    const healthScore = Math.round((passedChecks / totalChecks) * 100);
    setSystemHealth({ score: healthScore, total: totalChecks, passed: passedChecks, failed: failedChecks, warnings });

    addLog(`Scan complete: ${passedChecks}/${totalChecks} passed, ${failedChecks} failed, ${warnings} warnings`, 
      failedChecks > 0 ? 'error' : 'success');
    addLog(`System Health: ${healthScore}%`, healthScore > 80 ? 'success' : 'warning');

    // Auto-repair if enabled
    if (autoRepair && failedChecks > 0) {
      addLog('Auto-repair enabled — attempting fixes...', 'warning');
      await runAutoRepair(allResults);
    }

    setIsRunning(false);
  };

  // ═══════════════════════════════════════════
  // AUTO REPAIR
  // ═══════════════════════════════════════════

  const runAutoRepair = async (results) => {
    let fixed = 0;
    
    for (const cat of results) {
      for (const check of cat.results) {
        if ((check.status === STATUS.FAIL || check.status === STATUS.WARN) && check.fixable && check.fixAction) {
          try {
            addLog(`Repairing: ${check.name}...`, 'warning');
            check.fixAction();
            check.status = STATUS.FIXED;
            check.detail += ' → FIXED';
            fixed++;
            addLog(`Fixed: ${check.name}`, 'success');
          } catch (err) {
            addLog(`Repair failed for ${check.name}: ${err.message}`, 'error');
          }
        }
      }
    }

    setDiagnostics([...results]);
    addLog(`Auto-repair complete: ${fixed} issues fixed`, fixed > 0 ? 'success' : 'info');
  };

  // ═══════════════════════════════════════════
  // MANUAL REPAIR ACTIONS
  // ═══════════════════════════════════════════

  const clearAllStorage = () => {
    addLog('Clearing all app storage...', 'warning');
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('solace')) keys.push(key);
    }
    keys.forEach(k => localStorage.removeItem(k));
    addLog(`Cleared ${keys.length} storage keys`, 'success');
  };

  const resetAppState = () => {
    addLog('Resetting app state to defaults...', 'warning');
    localStorage.setItem('solace_user', JSON.stringify({
      email: 'justinbretthogan@gmail.com',
      id: 'owner_user_123',
      role: 'owner',
      name: 'Justin Brett Hogan'
    }));
    localStorage.setItem('solace_entity_UserProfile', JSON.stringify([{
      id: 'profile_owner_123',
      created_by: 'justinbretthogan@gmail.com',
      email: 'justinbretthogan@gmail.com',
      full_name: 'Justin Brett Hogan',
      tier: 'owner',
      subscription_tier: 'owner',
      oracle_gender: 'female',
      created_at: new Date().toISOString()
    }]));
    addLog('App state reset to defaults', 'success');
  };

  const hardReload = () => {
    addLog('Performing hard reload...', 'warning');
    window.location.reload();
  };

  const clearCacheAndReload = async () => {
    addLog('Clearing caches...', 'warning');
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
      addLog(`Cleared ${names.length} cache entries`, 'success');
    }
    // Clear module cache by reloading
    setTimeout(() => window.location.reload(), 500);
  };

  // ═══════════════════════════════════════════
  // GIT INTEGRATION
  // ═══════════════════════════════════════════

  const fetchGitStatus = async () => {
    addLog('Fetching GitHub repository status...', 'info');
    try {
      const [repoResp, commitsResp] = await Promise.all([
        fetch(GITHUB_API, { signal: AbortSignal.timeout(8000) }),
        fetch(`${GITHUB_API}/commits?per_page=10`, { signal: AbortSignal.timeout(8000) })
      ]);

      if (repoResp.ok) {
        const repo = await repoResp.json();
        setGitStatus({
          name: repo.full_name,
          defaultBranch: repo.default_branch,
          stars: repo.stargazers_count,
          lastPush: repo.pushed_at,
          size: repo.size,
          url: repo.html_url,
          description: repo.description,
          connected: true
        });
        addLog(`Connected to ${repo.full_name}`, 'success');
      } else {
        setGitStatus({ connected: false, error: `HTTP ${repoResp.status}` });
        addLog('GitHub connection failed', 'error');
      }

      if (commitsResp.ok) {
        const commits = await commitsResp.json();
        setGitCommits(commits.map(c => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message,
          author: c.commit.author.name,
          date: new Date(c.commit.author.date).toLocaleString(),
          url: c.html_url
        })));
      }
    } catch (err) {
      setGitStatus({ connected: false, error: err.message });
      addLog(`Git error: ${err.message}`, 'error');
    }
  };

  const fetchFileFromGit = async (filePath) => {
    addLog(`Fetching ${filePath} from GitHub...`, 'info');
    try {
      const resp = await fetch(`${GITHUB_RAW}/${filePath}`, { signal: AbortSignal.timeout(10000) });
      if (resp.ok) {
        const content = await resp.text();
        addLog(`Retrieved ${filePath} (${content.length} chars)`, 'success');
        return content;
      } else {
        addLog(`Failed to fetch ${filePath}: HTTP ${resp.status}`, 'error');
        return null;
      }
    } catch (err) {
      addLog(`Fetch error: ${err.message}`, 'error');
      return null;
    }
  };

  // ═══════════════════════════════════════════
  // AI DIAGNOSTIC CHAT
  // ═══════════════════════════════════════════

  const gatherSystemSnapshot = () => {
    const snapshot = {};
    // Storage summary
    snapshot.storageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key);
      snapshot.storageKeys.push({ key, size: val ? val.length : 0, valid: (() => { try { JSON.parse(val); return true; } catch { return false; } })() });
    }
    // DOM info
    snapshot.domNodes = document.querySelectorAll('*').length;
    snapshot.reactRoot = !!(document.getElementById('root')?.children.length);
    snapshot.cssInjected = !!document.getElementById('solace-neon-css');
    // Browser
    snapshot.online = navigator.onLine;
    snapshot.speechRecognition = !!(window['SpeechRecognition'] || window['webkitSpeechRecognition']);
    snapshot.speechSynthesis = !!window.speechSynthesis;
    snapshot.mediaDevices = !!navigator.mediaDevices;
    // OpenAI
    snapshot.hasOpenAIKey = !!localStorage.getItem('openai_api_key');
    // User
    try { snapshot.user = JSON.parse(localStorage.getItem('solace_user') || 'null'); } catch { snapshot.user = 'corrupted'; }
    // Recent diagnostics summary
    if (diagnostics.length > 0) {
      snapshot.lastDiagnostics = diagnostics.map(cat => ({
        category: cat.category,
        passed: cat.results.filter(r => r.status === STATUS.PASS || r.status === STATUS.FIXED).length,
        failed: cat.results.filter(r => r.status === STATUS.FAIL).length,
        warnings: cat.results.filter(r => r.status === STATUS.WARN).length,
        failures: cat.results.filter(r => r.status === STATUS.FAIL).map(r => `${r.name}: ${r.detail}`)
      }));
    }
    return snapshot;
  };

  // Repair actions the AI can execute
  const REPAIR_ACTIONS = {
    clear_storage: () => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('solace')) keys.push(key);
      }
      keys.forEach(k => localStorage.removeItem(k));
      return `Cleared ${keys.length} storage keys`;
    },
    reset_user: () => {
      localStorage.setItem('solace_user', JSON.stringify({
        email: 'justinbretthogan@gmail.com', id: 'owner_user_123', role: 'owner', name: 'Justin Brett Hogan'
      }));
      return 'User session reset to owner defaults';
    },
    reset_profile: () => {
      localStorage.setItem('solace_entity_UserProfile', JSON.stringify([{
        id: 'profile_owner_123', created_by: 'justinbretthogan@gmail.com',
        email: 'justinbretthogan@gmail.com', full_name: 'Justin Brett Hogan',
        tier: 'owner', subscription_tier: 'owner', oracle_gender: 'female',
        created_at: new Date().toISOString()
      }]));
      return 'User profile entity reset';
    },
    delete_storage_key: (key) => {
      localStorage.removeItem(key);
      return `Deleted storage key: ${key}`;
    },
    set_storage_key: (key, value) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return `Set storage key: ${key}`;
    },
    clear_cache: async () => {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(n => caches.delete(n)));
        return `Cleared ${names.length} browser caches`;
      }
      return 'No caches to clear';
    },
    hard_reload: () => {
      setTimeout(() => window.location.reload(), 1000);
      return 'Hard reload scheduled in 1 second...';
    },
    test_page: async (pageName) => {
      try {
        await import(`../pages/${pageName}.jsx`);
        return `Page "${pageName}" loads successfully`;
      } catch (err) {
        return `Page "${pageName}" FAILED to load: ${err.message}`;
      }
    },
    test_component: async (compName) => {
      try {
        await import(`../components/${compName}.jsx`);
        return `Component "${compName}" loads successfully`;
      } catch (err) {
        return `Component "${compName}" FAILED to load: ${err.message}`;
      }
    },
    run_full_scan: async () => {
      return 'Triggered full diagnostic scan';
    },
    set_openai_key: (key) => {
      localStorage.setItem('openai_api_key', key);
      return 'OpenAI API key saved. Oracle will now use GPT for answers.';
    },
    fix_corrupt_entities: () => {
      let fixed = 0;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('solace_entity_')) {
          try { JSON.parse(localStorage.getItem(key)); } catch {
            localStorage.removeItem(key);
            fixed++;
          }
        }
      }
      return `Removed ${fixed} corrupted entity records`;
    },
    // ── DEEP PAGE INSPECTION — enter the core of each page ──
    deep_inspect_page: async (pageName) => {
      const report = [];
      try {
        const mod = await import(`../pages/${pageName}.jsx`);
        report.push(`✓ Module loaded (exports: ${Object.keys(mod).join(', ')})`);
        const Component = mod.default;
        if (!Component) {
          report.push('✗ No default export — page cannot render');
          return report.join('\n');
        }
        report.push(`✓ Default export: ${Component.name || 'anonymous'} (${typeof Component})`);
        // Check if it uses hooks correctly by examining toString
        const src = Component.toString();
        if (src.includes('Link') && src.includes('createPageUrl')) {
          report.push('✗ USES Link/createPageUrl — will crash (these were removed)');
        }
        if (src.includes('base44.entities')) report.push('⚠ Uses base44.entities — will fallback to localStorage');
        if (src.includes('base44.functions')) report.push('⚠ Uses base44.functions — needs API connection');
        if (src.includes('navigator.mediaDevices')) report.push('ℹ Uses camera/mic APIs');
        if (src.includes('SpeechRecognition')) report.push('ℹ Uses speech recognition');
        if (src.includes('localStorage')) report.push('ℹ Uses localStorage');
        if (src.includes('fetch(') || src.includes('fetch (')) report.push('ℹ Makes network requests');
        report.push(`✓ Source length: ${src.length} chars`);
      } catch (err) {
        report.push(`✗ FAILED to load: ${err.message}`);
        report.push(`Stack: ${err.stack?.split('\n').slice(0,3).join(' | ')}`);
      }
      return report.join('\n');
    },
    // ── FETCH SOURCE FROM GITHUB for analysis ──
    fetch_source: async (filePath) => {
      try {
        const resp = await fetch(`${GITHUB_RAW}/${filePath}`, { signal: AbortSignal.timeout(10000) });
        if (!resp.ok) return `Failed to fetch ${filePath}: HTTP ${resp.status}`;
        const content = await resp.text();
        // Analyze content
        const lines = content.split('\n');
        const issues = [];
        lines.forEach((line, i) => {
          if (line.includes('import') && line.includes('createPageUrl')) issues.push(`Line ${i+1}: Uses createPageUrl (removed)`);
          if (line.includes('import') && line.includes("from 'react-router-dom'") && line.includes('Link')) issues.push(`Line ${i+1}: Uses Link from react-router-dom (removed)`);
          if (line.includes('throw new Error') || line.includes('throw Error')) issues.push(`Line ${i+1}: Throws error intentionally`);
        });
        return `Source: ${filePath} (${lines.length} lines, ${content.length} chars)\nImports: ${lines.filter(l => l.trim().startsWith('import')).length}\nExports: ${lines.filter(l => l.includes('export')).length}\nIssues found: ${issues.length > 0 ? '\n' + issues.join('\n') : 'None'}`;
      } catch (err) {
        return `Fetch error: ${err.message}`;
      }
    },
    // ── FIX NAVIGATION STATE ──
    fix_navigation: () => {
      // Dispatch a navigate event back to Home to reset any stuck navigation
      window.dispatchEvent(new CustomEvent('solace-navigate', { detail: { page: 'Home' } }));
      return 'Navigation reset — dispatched solace-navigate to Home';
    },
    // ── INJECT RUNTIME FIX for known issues ──
    inject_runtime_fix: (fixName) => {
      const fixes = {
        'voice_settings': () => {
          localStorage.setItem('solace_entity_VoiceSettings', JSON.stringify([{
            id: 'vs_default', created_by: 'justinbretthogan@gmail.com',
            auto_play: true, voice_type: 'default', volume: 1.0, pitch: 1.0, rate: 1.0
          }]));
          return 'Voice settings initialized';
        },
        'oracle_memory': () => {
          // Reset oracle memory to fresh state
          localStorage.removeItem('solace_oracle_memory');
          localStorage.removeItem('solace_conversations');
          localStorage.removeItem('solace_user_profile_deep');
          localStorage.removeItem('solace_interaction_stats');
          return 'Oracle memory reset to fresh state';
        },
        'css_reinject': () => {
          const existing = document.getElementById('solace-neon-css');
          if (existing) existing.remove();
          // Force re-render which will re-inject CSS
          window.dispatchEvent(new Event('resize'));
          return 'CSS cleared for re-injection on next render';
        },
        'error_boundary_reset': () => {
          // Clear any error boundary states by triggering re-render
          const root = document.getElementById('root');
          if (root) {
            root.querySelectorAll('[data-error]').forEach(el => el.remove());
          }
          return 'Error boundary elements cleared';
        },
      };
      if (fixes[fixName]) {
        return fixes[fixName]();
      }
      return `Unknown fix: ${fixName}. Available: ${Object.keys(fixes).join(', ')}`;
    },
    // ── TEST ALL PAGES AT ONCE ──
    test_all_pages: async () => {
      const results = { passed: [], failed: [] };
      for (const page of ALL_PAGES) {
        try {
          await import(`../pages/${page}.jsx`);
          results.passed.push(page);
        } catch (err) {
          results.failed.push({ page, error: err.message.split('\n')[0] });
        }
      }
      let report = `Pages tested: ${ALL_PAGES.length}\nPassed: ${results.passed.length}\nFailed: ${results.failed.length}`;
      if (results.failed.length > 0) {
        report += '\n\nFailing pages:\n' + results.failed.map(f => `✗ ${f.page}: ${f.error}`).join('\n');
      }
      return report;
    },
  };

  const buildAIPrompt = (userMessage) => {
    const snapshot = gatherSystemSnapshot();
    return `You are the SOLACE Diagnostic AI with FULL access to the app internals. You can diagnose and fix problems.

SYSTEM SNAPSHOT:
${JSON.stringify(snapshot, null, 2)}

AVAILABLE REPAIR ACTIONS (you can instruct these):
- clear_storage: Wipe all solace storage keys
- reset_user: Reset user session to owner defaults
- reset_profile: Reset user profile entity
- delete_storage_key(key): Delete a specific storage key
- set_storage_key(key, value): Set a specific storage key
- clear_cache: Clear browser caches
- hard_reload: Force page reload
- test_page(pageName): Test if a page loads (e.g. MovieMaker, Inventor)
- test_component(compName): Test if a component loads
- run_full_scan: Run complete diagnostic
- fix_corrupt_entities: Remove corrupted entity data
- set_openai_key(key): Set OpenAI API key for Oracle intelligence
- deep_inspect_page(pageName): DEEP inspection — enters the core of a page, analyzes exports, checks for known issues like removed imports, API dependencies
- fetch_source(filePath): Fetch and analyze source code from GitHub (e.g. src/pages/MovieMaker.jsx)
- fix_navigation: Reset navigation state back to Home
- inject_runtime_fix(fixName): Apply known runtime fixes (voice_settings, oracle_memory, css_reinject, error_boundary_reset)
- test_all_pages: Test EVERY page in the app at once and report which fail

ALL PAGES: ${ALL_PAGES.join(', ')}

When you identify a problem, respond with:
1. What you found wrong (diagnosis)
2. What you're doing to fix it (action)
3. Include ACTION: commands on separate lines for me to execute, e.g.:
   ACTION: reset_user
   ACTION: test_page(MovieMaker)
   ACTION: clear_cache

If no fix is needed, just explain the situation clearly. Be direct and technical.

USER PROBLEM: ${userMessage}`;
  };

  const executeAIActions = async (responseText) => {
    const actionLines = responseText.split('\n').filter(l => l.trim().startsWith('ACTION:'));
    const results = [];

    for (const line of actionLines) {
      const actionStr = line.replace('ACTION:', '').trim();
      const match = actionStr.match(/^(\w+)(?:\((.+)\))?$/);
      if (!match) continue;

      const [, actionName, argsStr] = match;
      const action = REPAIR_ACTIONS[actionName];
      if (!action) {
        results.push(`Unknown action: ${actionName}`);
        addLog(`Unknown repair action: ${actionName}`, 'error');
        continue;
      }

      try {
        addLog(`Executing repair: ${actionStr}`, 'warning');
        let result;
        if (argsStr) {
          const args = argsStr.split(',').map(a => a.trim().replace(/^['"]|['"]$/g, ''));
          result = await action(...args);
        } else {
          result = await action();
        }
        results.push(`${actionName}: ${result}`);
        addLog(`Repair result: ${result}`, 'success');

        // Special case: trigger full scan
        if (actionName === 'run_full_scan') {
          runFullDiagnostic();
        }
      } catch (err) {
        results.push(`${actionName} failed: ${err.message}`);
        addLog(`Repair failed: ${actionName} — ${err.message}`, 'error');
      }
    }

    return results;
  };

  const handleAIChatSend = async (overrideInput) => {
    const msg = (overrideInput || aiChatInput).trim();
    if (!msg) return;

    setAiChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setAiChatInput('');
    setAiThinking(true);
    addLog(`AI Chat: User said "${msg}"`, 'info');

    try {
      const prompt = buildAIPrompt(msg);
      const response = await base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: true });

      const answer = typeof response?.data === 'string'
        ? response.data.trim()
        : (response?.data?.answer || response?.data?.summary || '');

      const finalAnswer = answer && answer.length > 20 
        ? answer 
        : getDiagnosticFallback(msg);

      // Execute any ACTION: commands in the response
      const actionResults = await executeAIActions(finalAnswer);

      // Build final message with action results
      let fullResponse = finalAnswer.split('\n').filter(l => !l.trim().startsWith('ACTION:')).join('\n').trim();
      if (actionResults.length > 0) {
        fullResponse += '\n\n**Repairs executed:**\n' + actionResults.map(r => `✓ ${r}`).join('\n');
      }

      setAiChatMessages(prev => [...prev, { role: 'ai', content: fullResponse }]);
      addLog(`AI Chat: Responded with ${fullResponse.length} chars, ${actionResults.length} actions`, 'success');
    } catch (err) {
      const fallback = getDiagnosticFallback(msg);
      const actionResults = await executeAIActions(fallback);
      let fullFallback = fallback.split('\n').filter(l => !l.trim().startsWith('ACTION:')).join('\n').trim();
      if (actionResults.length > 0) {
        fullFallback += '\n\n**Repairs executed:**\n' + actionResults.map(r => `✓ ${r}`).join('\n');
      }
      setAiChatMessages(prev => [...prev, { role: 'ai', content: fullFallback }]);
      addLog(`AI Chat error, used fallback: ${err.message}`, 'warning');
    } finally {
      setAiThinking(false);
    }
  };

  const getDiagnosticFallback = (userMsg) => {
    const lower = userMsg.toLowerCase();

    if (lower.includes('black screen') || lower.includes('blank') || lower.includes('nothing shows')) {
      return `Diagnosing blank/black screen issue...\n\nCommon causes:\n1. Page component failed to import\n2. CSS background covering content (z-index issue)\n3. React error boundary caught a crash\n4. Missing dependencies in the page\n\nI'm running repairs now:\nACTION: reset_user\nACTION: fix_corrupt_entities\n\nIf a specific page is black, tell me which one and I'll test it directly.`;
    }

    if (lower.includes('oracle') || lower.includes('orb') || lower.includes('chat') || lower.includes('ai stupid')) {
      const hasKey = !!localStorage.getItem('openai_api_key');
      return `Oracle AI Diagnosis:\n\n${hasKey ? 'OpenAI key is set — Oracle should use GPT for answers.' : 'No OpenAI API key found — Oracle is running on local knowledge only.'}\n\nTo make Oracle super intelligent:\n1. Get an API key from platform.openai.com\n2. Tell me the key and I'll set it up, or paste it below\n\nThe Oracle uses the InvokeLLM integration which ${hasKey ? 'is connected to GPT-4o-mini' : 'falls back to built-in knowledge base without an API key'}.`;
    }

    if (lower.includes('storage') || lower.includes('data') || lower.includes('corrupt') || lower.includes('reset')) {
      return `Running storage repair...\n\nACTION: fix_corrupt_entities\nACTION: reset_user\nACTION: reset_profile\n\nThis resets your user session and profile to defaults and removes any corrupted data entries.`;
    }

    if (lower.includes('video') || lower.includes('movie') || lower.includes('generat')) {
      return `Deep-scanning video/movie generation system...\n\nACTION: deep_inspect_page(MovieMaker)\nACTION: deep_inspect_page(VideoEditor)\n\nVideo generation requires:\n1. A working API connection (base44.functions or OpenAI)\n2. Proper media storage in localStorage\n3. Canvas/WebGL support for preview\n\nCommon issues:\n- No API key set → videos can't be generated server-side\n- base44.functions.invoke fails → needs fallback generation\n- MediaRecorder not supported in some browsers\n\nLet me inspect both pages and report what I find.`;
    }

    if (lower.includes('app maker') || lower.includes('inventor') || lower.includes('study') || lower.includes('comment')) {
      return `Deep-scanning the App Maker / Inventor system...\n\nACTION: deep_inspect_page(Inventor)\n\nThe App Maker should:\n1. Study the target app's category, competitors, and reviews\n2. Analyze both positive AND negative comments/reviews\n3. Research the best-in-class apps in that category\n4. Generate a comprehensive development plan\n5. Build a production-ready app scaffold\n\nI'm inspecting the Inventor page core to identify what's missing or broken. If the AI isn't studying apps properly, it likely needs:\n- A web search integration for app research\n- Review analysis from app stores\n- Competitive analysis framework\n\nChecking now...`;
    }

    if (lower.includes('page') || lower.includes('load') || lower.includes('crash') || lower.includes('error')) {
      const pageName = ALL_PAGES.find(p => lower.includes(p.toLowerCase()));
      if (pageName) {
        return `Deep-inspecting page "${pageName}"...\n\nACTION: deep_inspect_page(${pageName})\nACTION: test_page(${pageName})\n\nI'm entering the core of this page to analyze its exports, dependencies, and potential issues.`;
      }
      return `I can deep-inspect any page. Which one is broken?\n\nI'll enter the core of the page, analyze its code, check dependencies, and identify the root cause.\n\nAvailable pages: ${ALL_PAGES.slice(0, 15).join(', ')}... and ${ALL_PAGES.length - 15} more.\n\nOr say "test all pages" and I'll scan every single one.`;
    }

    if (lower.includes('test all') || lower.includes('scan all') || lower.includes('every page')) {
      return `Running deep scan on ALL ${ALL_PAGES.length} pages...\n\nACTION: test_all_pages\n\nThis will test every page in the app and report which ones fail to load. After that, I can deep-inspect any failing pages.`;
    }

    if (lower.includes('mic') || lower.includes('voice') || lower.includes('speech') || lower.includes('listen')) {
      const hasSpeech = !!(window['SpeechRecognition'] || window['webkitSpeechRecognition']);
      return `Voice System Diagnosis:\n\n- Speech Recognition: ${hasSpeech ? 'SUPPORTED' : 'NOT SUPPORTED in this browser'}\n- Speech Synthesis: ${window.speechSynthesis ? 'AVAILABLE' : 'NOT AVAILABLE'}\n- MediaDevices: ${navigator.mediaDevices ? 'AVAILABLE' : 'NOT AVAILABLE (need HTTPS)'}\n\n${hasSpeech ? 'Your browser supports voice. Make sure you click ALLOW when the mic permission popup appears. The mic only works when you click the mic button first.' : 'Your browser does not support Web Speech API. Try Chrome or Edge.'}`;
    }

    if (lower.includes('slow') || lower.includes('performance') || lower.includes('lag')) {
      return `Performance Diagnosis:\n\n- DOM Nodes: ${document.querySelectorAll('*').length}\n- Online: ${navigator.onLine}\n\nRunning cleanup:\nACTION: fix_corrupt_entities\nACTION: clear_cache\n\nThis clears stale data and browser caches. If still slow, consider closing other browser tabs.`;
    }

    if (lower.includes('reload') || lower.includes('refresh') || lower.includes('restart')) {
      return `Performing full app reset and reload:\n\nACTION: reset_user\nACTION: reset_profile\nACTION: fix_corrupt_entities\nACTION: clear_cache\nACTION: hard_reload\n\nThe app will reload in a moment with fresh state.`;
    }

    // Generic diagnostic
    return `I've analyzed your report: "${userMsg}"\n\nLet me gather system info:\n- Storage keys: ${localStorage.length}\n- Online: ${navigator.onLine}\n- DOM nodes: ${document.querySelectorAll('*').length}\n- CSS injected: ${!!document.getElementById('solace-neon-css')}\n- OpenAI key: ${localStorage.getItem('openai_api_key') ? 'Set' : 'Not set'}\n\nTo help more specifically, tell me:\n1. Which page is affected?\n2. What exactly do you see (black screen, error, missing content)?\n3. What did you expect to happen?\n\nOr say "full scan" and I'll run a complete diagnostic.`;
  };

  // Voice input for AI chat
  const toggleAIVoice = async () => {
    const SpeechRecognition = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    if (!SpeechRecognition) return;

    if (aiListening && aiRecognitionRef.current) {
      aiRecognitionRef.current.stop();
      setAiListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch { return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setAiListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0]?.transcript || '').join(' ').trim();
      if (transcript) setAiChatInput(transcript);
      if (event.results[0]?.isFinal && transcript) {
        setTimeout(() => handleAIChatSend(transcript), 300);
      }
    };
    recognition.onerror = () => setAiListening(false);
    recognition.onend = () => setAiListening(false);

    aiRecognitionRef.current = recognition;
    try { recognition.start(); } catch {}
  };

  // ═══════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════

  useEffect(() => {
    // Auto-scroll log
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [repairLog, consoleOutput]);

  useEffect(() => {
    if (aiChatEndRef.current) {
      aiChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatMessages, aiThinking]);

  // Capture console errors
  useEffect(() => {
    const origError = console.error;
    console.error = (...args) => {
      addLog(`Console Error: ${args.map(a => typeof a === 'object' ? JSON.stringify(a).slice(0, 200) : String(a)).join(' ')}`, 'error');
      origError.apply(console, args);
    };
    return () => { console.error = origError; };
  }, [addLog]);

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  const glassPanel = {
    background: 'rgba(8,8,18,0.75)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(139,92,246,0.12)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px'
  };

  const tabStyle = (active) => ({
    padding: '10px 20px',
    borderRadius: '10px 10px 0 0',
    background: active ? 'rgba(139,92,246,0.15)' : 'transparent',
    border: active ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
    borderBottom: active ? '1px solid transparent' : '1px solid rgba(139,92,246,0.1)',
    color: active ? '#c4b5fd' : '#64748b',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#06060f', 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes healthPulse { 0%,100% { opacity: 0.8; } 50% { opacity: 1; } }
        @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ 
            fontSize: '1.8rem', fontWeight: 800, 
            background: 'linear-gradient(135deg, #ef4444, #f59e0b, #22c55e)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Diagnostic Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
            Self-diagnosing repair system — full access to all app internals
          </p>
        </div>
        
        {systemHealth && (
          <div style={{ 
            textAlign: 'center', padding: '16px 24px', borderRadius: '16px',
            background: systemHealth.score > 80 ? 'rgba(34,197,94,0.1)' : 
                        systemHealth.score > 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${systemHealth.score > 80 ? 'rgba(34,197,94,0.3)' : 
                                  systemHealth.score > 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
          }}>
            <div style={{ 
              fontSize: '2rem', fontWeight: 800,
              color: systemHealth.score > 80 ? '#22c55e' : systemHealth.score > 50 ? '#f59e0b' : '#ef4444'
            }}>
              {systemHealth.score}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Health
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div style={{ ...glassPanel, display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={runFullDiagnostic}
          disabled={isRunning}
          style={{
            padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem',
            background: isRunning ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #22c55e, #06b6d4)',
            border: 'none', color: '#fff', cursor: isRunning ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: isRunning ? 'none' : '0 4px 20px rgba(34,197,94,0.3)'
          }}
        >
          {isRunning ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={18} />}
          {isRunning ? 'Scanning...' : 'Run Full Diagnostic'}
        </button>

        <label style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          color: autoRepair ? '#22c55e' : '#64748b', fontSize: '0.85rem'
        }}>
          <input 
            type="checkbox" 
            checked={autoRepair} 
            onChange={(e) => setAutoRepair(e.target.checked)}
            style={{ accentColor: '#22c55e' }}
          />
          Auto-Repair
        </label>

        <div style={{ flex: 1 }} />

        <button onClick={resetAppState} style={{ 
          padding: '8px 16px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)',
          border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <RotateCcw size={14} /> Reset State
        </button>

        <button onClick={clearAllStorage} style={{ 
          padding: '8px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Trash2 size={14} /> Clear Storage
        </button>

        <button onClick={clearCacheAndReload} style={{ 
          padding: '8px 16px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <RefreshCw size={14} /> Clear Cache + Reload
        </button>

        <button onClick={hardReload} style={{ 
          padding: '8px 16px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.3)', color: '#a855f7', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Zap size={14} /> Hard Reload
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(139,92,246,0.1)', marginBottom: '20px' }}>
        <button style={tabStyle(activeTab === 'diagnostics')} onClick={() => setActiveTab('diagnostics')}>
          <Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Diagnostics
        </button>
        <button style={tabStyle(activeTab === 'git')} onClick={() => { setActiveTab('git'); if (!gitStatus) fetchGitStatus(); }}>
          <GitBranch size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Git Source
        </button>
        <button style={tabStyle(activeTab === 'console')} onClick={() => setActiveTab('console')}>
          <Terminal size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Console Log
        </button>
        <button style={tabStyle(activeTab === 'storage')} onClick={() => setActiveTab('storage')}>
          <Database size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Storage Inspector
        </button>
        <button style={{
          ...tabStyle(activeTab === 'aichat'),
          ...(activeTab !== 'aichat' ? {
            background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(6,182,212,0.08))',
            borderColor: 'rgba(34,197,94,0.2)',
            color: '#22c55e'
          } : {})
        }} onClick={() => setActiveTab('aichat')}>
          <Bot size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />AI Repair Chat
        </button>
      </div>

      {/* TAB: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div>
          {diagnostics.length === 0 && !isRunning && (
            <div style={{ ...glassPanel, textAlign: 'center', padding: '60px 24px' }}>
              <AlertOctagon size={48} color="#64748b" style={{ marginBottom: '16px' }} />
              <p style={{ color: '#94a3b8', fontSize: '1rem' }}>No diagnostic data yet</p>
              <p style={{ color: '#475569', fontSize: '0.85rem' }}>Click "Run Full Diagnostic" to scan the entire app</p>
            </div>
          )}

          {diagnostics.map((cat, ci) => {
            const passed = cat.results.filter(r => r.status === STATUS.PASS || r.status === STATUS.FIXED).length;
            const total = cat.results.length;
            const hasFails = cat.results.some(r => r.status === STATUS.FAIL);
            const isExpanded = expandedSections[cat.category] !== false; // default open

            return (
              <div key={cat.category} style={{ ...glassPanel, padding: 0, overflow: 'hidden' }}>
                <div 
                  onClick={() => toggleSection(cat.category)}
                  style={{ 
                    padding: '16px 20px', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'space-between',
                    background: hasFails ? 'rgba(239,68,68,0.05)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid rgba(139,92,246,0.08)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isExpanded ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
                    <span style={{ color: '#a855f7' }}>{cat.icon}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>{cat.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px',
                      background: passed === total ? 'rgba(34,197,94,0.15)' : hasFails ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: passed === total ? '#22c55e' : hasFails ? '#ef4444' : '#f59e0b'
                    }}>
                      {passed}/{total} passed
                    </span>
                  </div>
                </div>
                
                {isExpanded && (
                  <div style={{ padding: '8px 0' }}>
                    {cat.results.map((r, ri) => (
                      <div key={ri} style={{ 
                        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px',
                        borderBottom: ri < cat.results.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none'
                      }}>
                        {statusIcon(r.status)}
                        <span style={{ color: '#c4b5fd', fontWeight: 500, fontSize: '0.85rem', minWidth: '200px' }}>
                          {r.name}
                        </span>
                        <span style={{ color: statusColor(r.status), fontSize: '0.8rem', flex: 1 }}>
                          {r.detail}
                        </span>
                        {r.fixable && r.fixAction && r.status !== STATUS.FIXED && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              try {
                                r.fixAction();
                                r.status = STATUS.FIXED;
                                r.detail += ' → FIXED';
                                setDiagnostics([...diagnostics]);
                                addLog(`Manual fix: ${r.name}`, 'success');
                              } catch (err) {
                                addLog(`Fix failed: ${err.message}`, 'error');
                              }
                            }}
                            style={{
                              padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem',
                              background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
                              color: '#06b6d4', cursor: 'pointer', fontWeight: 600
                            }}
                          >
                            Fix
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Repair Log */}
          {repairLog.length > 0 && (
            <div style={{ ...glassPanel, padding: 0 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(139,92,246,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="#a855f7" />
                <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>Repair Log</span>
              </div>
              <div ref={logRef} style={{ maxHeight: '200px', overflowY: 'auto', padding: '12px 20px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {repairLog.map((entry, i) => (
                  <div key={i} style={{ 
                    padding: '3px 0',
                    color: entry.type === 'error' ? '#ef4444' : 
                           entry.type === 'success' ? '#22c55e' : 
                           entry.type === 'warning' ? '#f59e0b' :
                           entry.type === 'system' ? '#a855f7' : '#64748b'
                  }}>
                    <span style={{ color: '#475569' }}>[{entry.time}]</span> {entry.msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Git Source */}
      {activeTab === 'git' && (
        <div>
          <div style={{ ...glassPanel }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ color: '#e2e8f0', fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>
                <GitBranch size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#a855f7' }} />
                GitHub Repository
              </h3>
              <button onClick={fetchGitStatus} style={{
                padding: '8px 16px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 500
              }}>
                Refresh
              </button>
            </div>

            {gitStatus?.connected ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Repository</div>
                  <div style={{ color: '#22c55e', fontWeight: 600 }}>{gitStatus.name}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Branch</div>
                  <div style={{ color: '#a855f7', fontWeight: 600 }}>{gitStatus.defaultBranch}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Last Push</div>
                  <div style={{ color: '#3b82f6', fontWeight: 600 }}>{new Date(gitStatus.lastPush).toLocaleString()}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.15)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Size</div>
                  <div style={{ color: '#ec4899', fontWeight: 600 }}>{(gitStatus.size / 1024).toFixed(1)} MB</div>
                </div>
              </div>
            ) : gitStatus ? (
              <div style={{ color: '#ef4444', padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.05)' }}>
                Connection failed: {gitStatus.error}
              </div>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                <p>Loading repository data...</p>
              </div>
            )}
          </div>

          {/* Recent Commits */}
          {gitCommits.length > 0 && (
            <div style={glassPanel}>
              <h3 style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 16px', fontSize: '1rem' }}>Recent Commits</h3>
              {gitCommits.map((c, i) => (
                <div key={c.sha} style={{ 
                  padding: '12px 0', 
                  borderBottom: i < gitCommits.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  display: 'flex', gap: '12px', alignItems: 'flex-start'
                }}>
                  <code style={{ 
                    fontSize: '0.75rem', color: '#a855f7', background: 'rgba(139,92,246,0.1)',
                    padding: '2px 8px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap'
                  }}>{c.sha}</code>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: 500 }}>{c.message.split('\n')[0]}</div>
                    <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '2px' }}>{c.author} — {c.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Console Log */}
      {activeTab === 'console' && (
        <div style={{ ...glassPanel, padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(139,92,246,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>
              <Terminal size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: '#a855f7' }} />
              Live Console Output
            </span>
            <button onClick={() => setConsoleOutput([])} style={{
              padding: '4px 12px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem'
            }}>Clear</button>
          </div>
          <div ref={logRef} style={{ 
            height: '500px', overflowY: 'auto', padding: '16px 20px',
            fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace", fontSize: '0.8rem',
            background: 'rgba(0,0,0,0.3)'
          }}>
            {consoleOutput.length === 0 ? (
              <div style={{ color: '#475569', textAlign: 'center', padding: '60px 0' }}>
                Console output will appear here during diagnostics
              </div>
            ) : (
              consoleOutput.map((entry, i) => (
                <div key={i} style={{ 
                  padding: '2px 0',
                  color: entry.type === 'error' ? '#ef4444' : 
                         entry.type === 'success' ? '#22c55e' : 
                         entry.type === 'warning' ? '#f59e0b' :
                         entry.type === 'system' ? '#c084fc' : '#94a3b8'
                }}>
                  <span style={{ color: '#334155' }}>{entry.time} </span>
                  {entry.type === 'error' && <span style={{ color: '#ef4444' }}>[ERR] </span>}
                  {entry.type === 'success' && <span style={{ color: '#22c55e' }}>[OK] </span>}
                  {entry.type === 'warning' && <span style={{ color: '#f59e0b' }}>[WARN] </span>}
                  {entry.type === 'system' && <span style={{ color: '#c084fc' }}>[SYS] </span>}
                  {entry.msg}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: AI Repair Chat */}
      {activeTab === 'aichat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
          {/* Chat Area */}
          <div style={{ ...glassPanel, padding: 0, display: 'flex', flexDirection: 'column', height: '600px' }}>
            {/* Chat Header */}
            <div style={{ 
              padding: '14px 20px', borderBottom: '1px solid rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(6,182,212,0.05))'
            }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
                boxShadow: '0 0 12px rgba(34,197,94,0.3)'
              }}>
                <Wrench size={16} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem' }}>Diagnostic AI</div>
                <div style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 500 }}>Full system access active</div>
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={() => setAiChatMessages([
                { role: 'ai', content: 'Chat cleared. Tell me what\'s wrong and I\'ll diagnose and fix it.' }
              ])} style={{
                padding: '4px 10px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', fontSize: '0.7rem'
              }}>Clear Chat</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {aiChatMessages.map((msg, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    maxWidth: '85%', padding: '12px 16px', borderRadius: '14px',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15))'
                      : 'rgba(34,197,94,0.08)',
                    border: msg.role === 'user' 
                      ? '1px solid rgba(139,92,246,0.3)'
                      : '1px solid rgba(34,197,94,0.15)',
                    fontSize: '0.85rem', lineHeight: 1.6
                  }}>
                    {msg.role === 'ai' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Bot size={14} color="#22c55e" />
                        <span style={{ color: '#22c55e', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diagnostic AI</span>
                      </div>
                    )}
                    <div style={{ color: msg.role === 'user' ? '#e2e8f0' : '#c4d4e0', whiteSpace: 'pre-wrap' }}>
                      {msg.content.split('\n').map((line, li) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <div key={li} style={{ color: '#22c55e', fontWeight: 700, marginTop: '6px' }}>{line.replace(/\*\*/g, '')}</div>;
                        }
                        if (line.startsWith('✓ ')) {
                          return <div key={li} style={{ color: '#06b6d4', paddingLeft: '8px' }}>{line}</div>;
                        }
                        return <div key={li}>{line || '\u00A0'}</div>;
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {aiThinking && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ 
                    padding: '12px 20px', borderRadius: '14px',
                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)'
                  }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <RefreshCw size={14} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ color: '#22c55e', fontSize: '0.82rem' }}>Diagnosing and repairing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={aiChatEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ 
              padding: '12px 16px', borderTop: '1px solid rgba(34,197,94,0.1)',
              display: 'flex', gap: '8px', alignItems: 'center',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <button onClick={toggleAIVoice} style={{
                width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: aiListening ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.15)',
                border: aiListening ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(139,92,246,0.3)',
                cursor: 'pointer', transition: 'all 0.2s',
                animation: aiListening ? 'healthPulse 1s infinite' : 'none'
              }}>
                {aiListening ? <MicOff size={16} color="#ef4444" /> : <Mic size={16} color="#a855f7" />}
              </button>
              <input
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAIChatSend(); } }}
                placeholder={aiListening ? 'Listening...' : 'Describe the problem... (e.g. "MovieMaker shows black screen")'}
                disabled={aiThinking}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(6,6,15,0.9)', border: '1px solid rgba(34,197,94,0.15)',
                  color: '#e2e8f0', fontSize: '0.85rem', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <button 
                onClick={() => handleAIChatSend()}
                disabled={aiThinking || !aiChatInput.trim()}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: aiChatInput.trim() ? 'linear-gradient(135deg, #22c55e, #06b6d4)' : 'rgba(100,116,139,0.2)',
                  border: 'none', cursor: aiChatInput.trim() ? 'pointer' : 'default',
                  boxShadow: aiChatInput.trim() ? '0 0 12px rgba(34,197,94,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={16} color={aiChatInput.trim() ? '#fff' : '#475569'} />
              </button>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ ...glassPanel, padding: '14px' }}>
              <div style={{ color: '#a855f7', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Quick Prompts
              </div>
              {[
                { label: 'Full System Scan', prompt: 'Run a full system scan and fix any issues' },
                { label: 'Fix Black Screen', prompt: 'A page is showing a black screen, diagnose and fix it' },
                { label: 'Fix Oracle AI', prompt: 'The Oracle AI is not smart enough, it gives generic answers' },
                { label: 'Fix Microphone', prompt: 'The microphone is not working for voice input' },
                { label: 'Fix Storage', prompt: 'My data seems corrupted, fix all storage issues' },
                { label: 'Reset Everything', prompt: 'Reset all app state and reload from scratch' },
                { label: 'Performance Issues', prompt: 'The app is running slowly, diagnose and optimize' },
                { label: 'Test All Pages', prompt: 'Test every page in the app and report which ones fail' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAIChatSend(item.prompt)}
                  disabled={aiThinking}
                  style={{
                    width: '100%', padding: '8px 12px', marginBottom: '6px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.12)',
                    color: '#c4b5fd', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <Zap size={12} color="#a855f7" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* System Status Mini */}
            <div style={{ ...glassPanel, padding: '14px' }}>
              <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Live Status
              </div>
              {[
                { label: 'Online', ok: navigator.onLine },
                { label: 'Speech API', ok: !!(window['SpeechRecognition'] || window['webkitSpeechRecognition']) },
                { label: 'Camera/Mic', ok: !!navigator.mediaDevices },
                { label: 'OpenAI Key', ok: !!localStorage.getItem('openai_api_key') },
                { label: 'User Session', ok: !!localStorage.getItem('solace_user') },
                { label: 'CSS Active', ok: !!document.getElementById('solace-neon-css') },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {s.ok ? <CheckCircle size={12} color="#22c55e" /> : <XCircle size={12} color="#ef4444" />}
                  <span style={{ color: s.ok ? '#94a3b8' : '#f87171', fontSize: '0.78rem' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Storage Inspector */}
      {activeTab === 'storage' && (
        <StorageInspector addLog={addLog} glassPanel={glassPanel} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Storage Inspector Sub-Component
// ═══════════════════════════════════════════
function StorageInspector({ addLog, glassPanel }) {
  const [storageItems, setStorageItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    refreshStorage();
  }, []);

  const refreshStorage = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      items.push({ 
        key, 
        value, 
        size: ((key.length + (value ? value.length : 0)) * 2),
        isJSON: (() => { try { JSON.parse(value); return true; } catch { return false; } })()
      });
    }
    items.sort((a, b) => b.size - a.size);
    setStorageItems(items);
  };

  const deleteKey = (key) => {
    localStorage.removeItem(key);
    addLog(`Deleted storage key: ${key}`, 'warning');
    refreshStorage();
    if (selectedKey === key) setSelectedKey(null);
  };

  const saveEdit = () => {
    if (selectedKey && editValue !== undefined) {
      localStorage.setItem(selectedKey, editValue);
      addLog(`Updated storage key: ${selectedKey}`, 'success');
      refreshStorage();
    }
  };

  const filtered = storageItems.filter(item => 
    !filter || item.key.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div style={{ ...glassPanel, display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Search size={16} color="#64748b" />
        <input 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter storage keys..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: '8px',
            background: 'rgba(6,6,15,0.9)', border: '1px solid rgba(139,92,246,0.15)',
            color: '#e2e8f0', fontSize: '0.85rem', outline: 'none'
          }}
        />
        <button onClick={refreshStorage} style={{
          padding: '8px 14px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', cursor: 'pointer', fontSize: '0.8rem'
        }}>Refresh</button>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
          {filtered.length} keys | {(filtered.reduce((sum, i) => sum + i.size, 0) / 1024).toFixed(1)} KB
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedKey ? '1fr 1fr' : '1fr', gap: '16px' }}>
        <div style={{ ...glassPanel, padding: 0, maxHeight: '500px', overflowY: 'auto' }}>
          {filtered.map(item => (
            <div 
              key={item.key}
              onClick={() => { setSelectedKey(item.key); setEditValue(item.value); }}
              style={{
                padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.02)',
                background: selectedKey === item.key ? 'rgba(139,92,246,0.1)' : 'transparent'
              }}
            >
              <HardDrive size={14} color={item.key.startsWith('solace') ? '#a855f7' : '#64748b'} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ color: '#c4b5fd', fontSize: '0.82rem', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.key}
                </div>
                <div style={{ color: '#475569', fontSize: '0.7rem' }}>
                  {(item.size / 1024).toFixed(1)} KB · {item.isJSON ? 'JSON' : 'string'}
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteKey(item.key); }} style={{
                padding: '2px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', fontSize: '0.7rem'
              }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {selectedKey && (
          <div style={{ ...glassPanel, padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(139,92,246,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#a855f7', fontWeight: 600, fontSize: '0.85rem' }}>{selectedKey}</span>
              <button onClick={saveEdit} style={{
                padding: '4px 12px', borderRadius: '6px', background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
              }}>Save</button>
            </div>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: '100%', height: '420px', padding: '12px', resize: 'none',
                background: 'rgba(0,0,0,0.3)', border: 'none', color: '#94a3b8',
                fontFamily: "'Cascadia Code', 'Fira Code', monospace", fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
