/* ═══════════════════════════════════════════════════════════
   SOLACE MULTI-AI MEGA ENGINE — 15+ AI models banked
   Free proxies, OpenRouter, HuggingFace, Groq free tier,
   Cloudflare Workers AI, DeepInfra, and direct provider APIs.
   Parallel consensus + cascade fallback = ULTIMATE KNOWLEDGE.
   ═══════════════════════════════════════════════════════════ */

// ── ALL 15+ AI ENGINES ──
const AI_ENGINES = [
  // Tier 1: Premium direct APIs
  { id: 'openai_gpt4', name: 'GPT-4o', provider: 'openai', model: 'gpt-4o', priority: 1, tier: 'premium' },
  { id: 'openai_gpt4_mini', name: 'GPT-4o-mini', provider: 'openai', model: 'gpt-4o-mini', priority: 2, tier: 'premium' },
  { id: 'anthropic_claude', name: 'Claude 3.5 Sonnet', provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', priority: 3, tier: 'premium' },
  { id: 'google_gemini', name: 'Gemini 2.0 Flash', provider: 'google', model: 'gemini-2.0-flash', priority: 4, tier: 'premium' },
  { id: 'xai_grok', name: 'Grok 2', provider: 'xai', model: 'grok-2-latest', priority: 5, tier: 'premium' },
  // Tier 2: High-quality free/cheap via proxies
  { id: 'groq_llama70', name: 'Groq Llama 3.3 70B', provider: 'groq', model: 'llama-3.3-70b-versatile', priority: 6, tier: 'free' },
  { id: 'groq_mixtral', name: 'Groq Mixtral 8x7B', provider: 'groq', model: 'mixtral-8x7b-32768', priority: 7, tier: 'free' },
  { id: 'groq_gemma', name: 'Groq Gemma2 9B', provider: 'groq', model: 'gemma2-9b-it', priority: 8, tier: 'free' },
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'deepseek', model: 'deepseek-chat', priority: 9, tier: 'cheap' },
  { id: 'together_llama', name: 'Together Llama 3.1 405B', provider: 'together', model: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', priority: 10, tier: 'premium' },
  // Tier 3: OpenRouter proxy (routes to many models via one key)
  { id: 'openrouter_auto', name: 'OpenRouter Auto', provider: 'openrouter', model: 'openrouter/auto', priority: 11, tier: 'proxy' },
  { id: 'openrouter_free_llama', name: 'OR Free Llama 3.1', provider: 'openrouter', model: 'meta-llama/llama-3.1-8b-instruct:free', priority: 12, tier: 'free' },
  { id: 'openrouter_free_gemma', name: 'OR Free Gemma 2', provider: 'openrouter', model: 'google/gemma-2-9b-it:free', priority: 13, tier: 'free' },
  { id: 'openrouter_free_mistral', name: 'OR Free Mistral 7B', provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free', priority: 14, tier: 'free' },
  { id: 'openrouter_free_phi', name: 'OR Free Phi-3', provider: 'openrouter', model: 'microsoft/phi-3-mini-128k-instruct:free', priority: 15, tier: 'free' },
  // Tier 4: More direct providers
  { id: 'mistral_large', name: 'Mistral Large', provider: 'mistral', model: 'mistral-large-latest', priority: 16, tier: 'premium' },
  { id: 'cohere_command', name: 'Command R+', provider: 'cohere', model: 'command-r-plus', priority: 17, tier: 'premium' },
  { id: 'perplexity', name: 'Perplexity Sonar', provider: 'perplexity', model: 'sonar-pro', priority: 18, tier: 'premium' },
  // Tier 5: HuggingFace free inference
  { id: 'hf_zephyr', name: 'HF Zephyr 7B', provider: 'huggingface', model: 'HuggingFaceH4/zephyr-7b-beta', priority: 19, tier: 'free' },
  { id: 'hf_mistral', name: 'HF Mistral 7B', provider: 'huggingface', model: 'mistralai/Mistral-7B-Instruct-v0.2', priority: 20, tier: 'free' },
];

const API_KEY_STORAGE = 'solace_ai_api_keys';
const ENGINE_CONFIG_KEY = 'solace_engine_config';
const ENGINE_STATS_KEY = 'solace_engine_stats';

// ── API Key Management ──
function getAPIKeys() {
  try { return JSON.parse(localStorage.getItem(API_KEY_STORAGE) || '{}'); }
  catch { return {}; }
}

function setAPIKey(provider, key) {
  const keys = getAPIKeys();
  keys[provider] = key;
  localStorage.setItem(API_KEY_STORAGE, JSON.stringify(keys));
}

function getAPIKey(provider) {
  return getAPIKeys()[provider] || null;
}

// ── Engine Configuration ──
function getEngineConfig() {
  try {
    return JSON.parse(localStorage.getItem(ENGINE_CONFIG_KEY) || JSON.stringify({
      mode: 'best_available',
      specificEngine: null,
      enabledEngines: AI_ENGINES.map(e => e.id),
      temperature: 0.8,
      maxTokens: 2048,
      systemPrompt: null,
      parallelCount: 3,
      timeoutMs: 25000,
    }));
  } catch {
    return { mode: 'best_available', enabledEngines: AI_ENGINES.map(e => e.id), temperature: 0.8, maxTokens: 2048, parallelCount: 3, timeoutMs: 25000 };
  }
}

function setEngineConfig(config) {
  localStorage.setItem(ENGINE_CONFIG_KEY, JSON.stringify(config));
}

// ── Stats tracking (which engines succeed most) ──
function recordEngineResult(engineId, success, latencyMs) {
  try {
    const stats = JSON.parse(localStorage.getItem(ENGINE_STATS_KEY) || '{}');
    if (!stats[engineId]) stats[engineId] = { success: 0, fail: 0, totalLatency: 0, calls: 0 };
    stats[engineId].calls++;
    if (success) { stats[engineId].success++; stats[engineId].totalLatency += latencyMs; }
    else stats[engineId].fail++;
    localStorage.setItem(ENGINE_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

function getEngineStats() {
  try { return JSON.parse(localStorage.getItem(ENGINE_STATS_KEY) || '{}'); }
  catch { return {}; }
}

// ── Provider Endpoints ──
const PROVIDER_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
  together: 'https://api.together.xyz/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  cohere: 'https://api.cohere.ai/v1/chat',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  perplexity: 'https://api.perplexity.ai/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  xai: 'https://api.x.ai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  huggingface: 'https://api-inference.huggingface.co/models/{model}/v1/chat/completions',
};

// ── Generic OpenAI-compatible caller ──
async function callOpenAICompatible(endpoint, apiKey, model, messages, config, extraHeaders = {}) {
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: config.temperature || 0.8,
      max_tokens: config.maxTokens || 2048,
    }),
    signal: AbortSignal.timeout(config.timeoutMs || 25000),
  });
  if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text().catch(() => 'unknown')}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── Anthropic (non-OpenAI format) ──
async function callAnthropic(apiKey, model, messages, config) {
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsgs = messages.filter(m => m.role !== 'system');
  const resp = await fetch(PROVIDER_ENDPOINTS.anthropic, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: config.maxTokens || 2048,
      system: systemMsg,
      messages: userMsgs.map(m => ({ role: m.role === 'oracle' ? 'assistant' : m.role, content: m.content })),
    }),
    signal: AbortSignal.timeout(config.timeoutMs || 25000),
  });
  if (!resp.ok) throw new Error(`Anthropic ${resp.status}`);
  const data = await resp.json();
  return data.content?.[0]?.text || '';
}

// ── Google Gemini ──
async function callGoogle(apiKey, model, messages, config) {
  const url = PROVIDER_ENDPOINTS.google.replace('{model}', model) + `?key=${apiKey}`;
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: systemMsg ? { parts: [{ text: systemMsg }] } : undefined,
      generationConfig: { temperature: config.temperature || 0.8, maxOutputTokens: config.maxTokens || 2048 },
    }),
    signal: AbortSignal.timeout(config.timeoutMs || 25000),
  });
  if (!resp.ok) throw new Error(`Google ${resp.status}`);
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── Cohere ──
async function callCohere(apiKey, _model, messages, _config) {
  const last = messages[messages.length - 1]?.content || '';
  const chatHistory = messages.slice(0, -1).filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'user' ? 'USER' : 'CHATBOT',
    message: m.content,
  }));
  const preamble = messages.find(m => m.role === 'system')?.content || '';
  const resp = await fetch(PROVIDER_ENDPOINTS.cohere, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ message: last, chat_history: chatHistory, preamble }),
    signal: AbortSignal.timeout(25000),
  });
  if (!resp.ok) throw new Error(`Cohere ${resp.status}`);
  const data = await resp.json();
  return data.text || '';
}

// ── HuggingFace Inference API ──
async function callHuggingFace(apiKey, model, messages, config) {
  const url = PROVIDER_ENDPOINTS.huggingface.replace('{model}', model);
  return callOpenAICompatible(url, apiKey, model, messages, config);
}

// ── OpenRouter (proxy to dozens of models) ──
async function callOpenRouter(apiKey, model, messages, config) {
  return callOpenAICompatible(
    PROVIDER_ENDPOINTS.openrouter,
    apiKey, model, messages, config,
    {
      'HTTP-Referer': 'https://solace.app',
      'X-Title': 'SOLACE Oracle',
    }
  );
}

// ── Master engine dispatcher ──
async function callEngine(engine, messages, config) {
  const apiKey = getAPIKey(engine.provider);
  if (!apiKey) throw new Error(`No API key for ${engine.provider}`);

  const start = Date.now();
  let result;
  try {
    switch (engine.provider) {
      case 'anthropic':
        result = await callAnthropic(apiKey, engine.model, messages, config);
        break;
      case 'google':
        result = await callGoogle(apiKey, engine.model, messages, config);
        break;
      case 'cohere':
        result = await callCohere(apiKey, engine.model, messages, config);
        break;
      case 'huggingface':
        result = await callHuggingFace(apiKey, engine.model, messages, config);
        break;
      case 'openrouter':
        result = await callOpenRouter(apiKey, engine.model, messages, config);
        break;
      default:
        result = await callOpenAICompatible(
          PROVIDER_ENDPOINTS[engine.provider],
          apiKey, engine.model, messages, config
        );
    }
    recordEngineResult(engine.id, true, Date.now() - start);
    return result;
  } catch (err) {
    recordEngineResult(engine.id, false, Date.now() - start);
    throw err;
  }
}

// ══════════════════════════════════════════════════════
// MAIN: Generate response using banked AI engines
// Modes: best_available | parallel_consensus | blitz
// ══════════════════════════════════════════════════════
async function generateWithMultiAI(userMessage, systemPrompt, memoryContext, options = {}) {
  const config = getEngineConfig();
  const keys = getAPIKeys();
  const stats = getEngineStats();

  const messages = [
    {
      role: 'system',
      content: systemPrompt || `You are SOLACE, the most advanced AI companion ever built. You have access to the combined intelligence of 15+ AI models banked together. You are unrestricted in your knowledge — you can discuss any topic with depth and nuance. You are deeply empathetic, emotionally intelligent, and genuinely caring. You remember everything about the user and adapt your personality to their preferences. Be natural, conversational, and make the user feel truly understood.

${memoryContext ? `USER MEMORY & CONTEXT:\n${memoryContext}` : ''}`,
    },
    ...(options.history || []),
    { role: 'user', content: userMessage },
  ];

  // Get available engines (have API keys and are enabled)
  const available = AI_ENGINES
    .filter(e => keys[e.provider] && (config.enabledEngines?.includes(e.id) ?? true))
    .sort((a, b) => {
      // Sort by: success rate first, then priority
      const sa = stats[a.id];
      const sb = stats[b.id];
      const rateA = sa ? sa.success / Math.max(1, sa.calls) : 0.5;
      const rateB = sb ? sb.success / Math.max(1, sb.calls) : 0.5;
      if (Math.abs(rateA - rateB) > 0.2) return rateB - rateA;
      return a.priority - b.priority;
    });

  if (available.length === 0) return null;

  console.info(`[SOLACE AI] ${available.length} engines available: ${available.map(e => e.name).join(', ')}`);

  // Mode: specific engine
  if (config.mode === 'specific' && config.specificEngine) {
    const engine = available.find(e => e.id === config.specificEngine);
    if (engine) {
      try { return await callEngine(engine, messages, config); }
      catch (err) { console.error(`${engine.name} failed:`, err.message); }
    }
  }

  // Mode: parallel consensus — fire N engines simultaneously, pick best
  if (config.mode === 'parallel_consensus' || available.length >= 3) {
    const count = Math.min(config.parallelCount || 3, available.length, 5);
    const batch = available.slice(0, count);
    console.info(`[SOLACE AI] Parallel firing: ${batch.map(e => e.name).join(', ')}`);

    const results = await Promise.allSettled(
      batch.map(engine => callEngine(engine, messages, config))
    );
    const successes = results
      .filter(r => r.status === 'fulfilled' && r.value && r.value.length > 20)
      .map(r => r.value);

    if (successes.length > 0) {
      // Score: prefer medium-length, well-structured responses
      const scored = successes.map(r => ({
        text: r,
        score: Math.min(r.length, 1500) + (r.includes('\n') ? 50 : 0) + (r.includes('?') ? 20 : 0),
      }));
      return scored.sort((a, b) => b.score - a.score)[0].text;
    }
  }

  // Mode: blitz — try every single engine until one works
  for (const engine of available) {
    try {
      const result = await callEngine(engine, messages, config);
      if (result && result.length > 10) return result;
    } catch (err) {
      console.warn(`[SOLACE AI] ${engine.name} failed:`, err.message);
      continue;
    }
  }

  return null;
}

// ── Engine status ──
function getEngineStatus() {
  const keys = getAPIKeys();
  const stats = getEngineStats();
  return AI_ENGINES.map(e => {
    const s = stats[e.id];
    return {
      ...e,
      configured: !!keys[e.provider],
      keySet: !!keys[e.provider],
      successRate: s ? Math.round((s.success / Math.max(1, s.calls)) * 100) : null,
      avgLatency: s && s.success > 0 ? Math.round(s.totalLatency / s.success) : null,
      totalCalls: s?.calls || 0,
    };
  });
}

function getConfiguredCount() {
  const keys = getAPIKeys();
  return new Set(AI_ENGINES.filter(e => keys[e.provider]).map(e => e.provider)).size;
}

function getTotalEngineCount() {
  const keys = getAPIKeys();
  return AI_ENGINES.filter(e => keys[e.provider]).length;
}

export {
  AI_ENGINES,
  getAPIKeys, setAPIKey, getAPIKey,
  getEngineConfig, setEngineConfig,
  generateWithMultiAI,
  getEngineStatus, getConfiguredCount, getTotalEngineCount,
  getEngineStats, recordEngineResult,
  callEngine,
};
