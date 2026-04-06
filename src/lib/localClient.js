// Local storage-based client to replace Base44 with real AI integration
// All data stored in browser localStorage with Git as the source of truth

const LOCAL_OWNER = {
  email: 'justinbretthogan@gmail.com',
  id: 'owner_user_123',
  role: 'owner',
  name: 'Justin Brett Hogan'
};

// OpenAI Configuration - You can also set this via localStorage: localStorage.setItem('openai_api_key', 'your-key')
const getOpenAIKey = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('openai_api_key') || '';
  }
  return '';
};

// Real OpenAI API call
async function callOpenAI(prompt, systemPrompt = null) {
  const apiKey = getOpenAIKey();
  
  // If no API key, use a comprehensive knowledge-based fallback
  if (!apiKey) {
    return getKnowledgeFallback(prompt);
  }
  
  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      messages.push({ 
        role: 'system', 
        content: 'You are Oracle, an all-knowing AI assistant with vast real-world knowledge. You answer questions accurately, comprehensively, and helpfully. You have knowledge about science, technology, history, current events, programming, creative writing, analysis, and all domains of human knowledge.' 
      });
    }
    messages.push({ role: 'user', content: prompt });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to knowledge base if API fails
    return getKnowledgeFallback(prompt);
  }
}

// Comprehensive knowledge fallback when no API key or API fails
function getKnowledgeFallback(prompt) {
  const lower = prompt.toLowerCase();
  
  // General knowledge responses
  if (lower.includes('who are you') || lower.includes('what are you')) {
    return 'I am Oracle, your AI assistant. I can answer questions about virtually any topic including science, technology, history, programming, creative writing, analysis, and more. To unlock my full potential with real-time knowledge, add your OpenAI API key in Settings.';
  }
  
  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return 'Hello! I\'m Oracle, your all-knowing AI assistant. Ask me anything - science, tech, history, coding, writing, analysis - I\'m here to help!';
  }
  
  // Science & Technology
  if (lower.includes('quantum') || lower.includes('physics')) {
    return 'Quantum physics is the study of matter and energy at the most fundamental level. It describes nature at the smallest scales of energy levels of atoms and subatomic particles. Key concepts include wave-particle duality, uncertainty principle, quantum entanglement, and superposition. Quantum mechanics has led to technologies like lasers, transistors, MRI machines, and is the foundation for emerging quantum computing.';
  }
  
  if (lower.includes('relativity') || lower.includes('einstein')) {
    return 'Einstein\'s theory of relativity consists of Special Relativity (1905) - which deals with objects moving at constant speeds, particularly light speed, introducing time dilation and length contraction - and General Relativity (1915) - which describes gravity as the curvature of spacetime caused by mass and energy. GPS satellites must account for both theories to maintain accuracy.';
  }
  
  if (lower.includes('climate change') || lower.includes('global warming')) {
    return 'Climate change refers to long-term shifts in global temperatures and weather patterns. The current warming trend is extremely likely (greater than 95% probability) to be the result of human activity since the mid-20th century. Key evidence includes rising CO2 levels (now over 420 ppm), melting ice caps, rising sea levels, and increasing extreme weather events. Solutions include renewable energy transition, carbon capture, and sustainable practices.';
  }
  
  if (lower.includes('evolution') || lower.includes('darwin')) {
    return 'Evolution is the process of change in all forms of life over generations. Darwin\'s theory of natural selection states that organisms better adapted to their environment tend to survive and produce more offspring. Evolution is supported by fossil records, DNA evidence, observed speciation, and comparative anatomy. It explains the diversity of life on Earth over approximately 3.5 billion years.';
  }
  
  // Technology & Computing
  if (lower.includes('artificial intelligence') || lower.includes('machine learning') || lower.includes('ai ')) {
    return 'Artificial Intelligence refers to systems capable of performing tasks that typically require human intelligence. Machine Learning, a subset of AI, uses algorithms that improve through experience. Deep Learning uses neural networks with many layers. Current AI applications include natural language processing (like me!), computer vision, robotics, recommendation systems, and autonomous vehicles. AI is transforming healthcare, finance, transportation, and creative industries.';
  }
  
  if (lower.includes('blockchain') || lower.includes('bitcoin') || lower.includes('crypto')) {
    return 'Blockchain is a distributed ledger technology that records transactions across multiple computers. It ensures transparency, immutability, and security without central authority. Bitcoin (2009) was the first cryptocurrency using blockchain. Other major cryptocurrencies include Ethereum (smart contracts), Solana, Cardano. Beyond currency, blockchain enables NFTs, DeFi (decentralized finance), supply chain tracking, and decentralized autonomous organizations (DAOs).';
  }
  
  if (lower.includes('programming') || lower.includes('coding') || lower.includes('software')) {
    return 'Programming is the process of creating instructions for computers using programming languages. Popular languages include: Python (data science, AI), JavaScript (web), Java (enterprise), C++ (systems/games), Rust (performance/safety), Go (cloud infrastructure). Modern software development uses version control (Git), CI/CD pipelines, containerization (Docker/Kubernetes), and cloud platforms (AWS, Azure, GCP).';
  }
  
  // History
  if (lower.includes('world war') || lower.includes('wwii') || lower.includes('ww2')) {
    return 'World War II (1939-1945) was the deadliest conflict in human history involving 30+ countries and 70-85 million fatalities. Key events: German invasion of Poland (1939), Battle of Britain (1940), Pearl Harbor (1941), Stalingrad (1942-43), D-Day (1944), atomic bombs on Hiroshima and Nagasaki (1945). The war ended with Axis surrender, led to the United Nations, Cold War division, and reshaped global geopolitics.';
  }
  
  if (lower.includes('ancient') || lower.includes('rome') || lower.includes('greek') || lower.includes('egypt')) {
    return 'Ancient civilizations laid foundations for modern society: Ancient Egypt (3100 BCE - 30 BCE) gave us pyramids, hieroglyphics, and early medicine. Ancient Greece (800 BCE - 146 BCE) contributed democracy, philosophy (Socrates, Plato, Aristotle), theater, and scientific method. Ancient Rome (753 BCE - 476 CE) provided republican governance, legal systems, engineering (roads, aqueducts), and Latin language roots.';
  }
  
  if (lower.includes('industrial revolution')) {
    return 'The Industrial Revolution (1760-1840 in Britain, spreading globally) transformed from agrarian to industrial societies. Key innovations: steam engine, textile machinery, iron production, railroads. It caused urbanization, factory systems, and new social classes. Impacts included economic growth, technological advancement, but also poor working conditions, child labor, and environmental pollution that led to labor rights movements.';
  }
  
  // Health & Biology
  if (lower.includes('dna') || lower.includes('genetics') || lower.includes('gene')) {
    return 'DNA (deoxyribonucleic acid) is the molecule carrying genetic instructions for all known organisms. Its double helix structure was discovered by Watson and Crick (1953). The human genome contains ~3 billion base pairs and ~20,000-25,000 protein-coding genes. DNA technology enables genetic engineering, CRISPR gene editing, personalized medicine, forensic identification, and ancestry tracing. The Human Genome Project (completed 2003) mapped the entire human genetic sequence.';
  }
  
  if (lower.includes('pandemic') || lower.includes('covid') || lower.includes('vaccine')) {
    return 'COVID-19, caused by SARS-CoV-2 virus, was declared a pandemic by WHO in March 2020. It led to 7+ million deaths globally and unprecedented societal changes. mRNA vaccines (Pfizer, Moderna) were developed in record time, representing a breakthrough in vaccine technology. The pandemic accelerated remote work, digital transformation, and exposed healthcare system vulnerabilities while spurring innovation in telemedicine and mRNA therapeutics.';
  }
  
  if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('health')) {
    return 'Good nutrition involves balanced intake of macronutrients (proteins, carbohydrates, fats) and micronutrients (vitamins, minerals). Evidence-based dietary patterns include Mediterranean diet (heart health), DASH diet (blood pressure), and plant-forward diets. Key principles: minimize processed foods and added sugars, stay hydrated, eat diverse whole foods, maintain caloric balance. Regular physical activity (150 min/week moderate) complements nutrition for health maintenance.';
  }
  
  // Space & Astronomy
  if (lower.includes('space') || lower.includes('nasa') || lower.includes('mars') || lower.includes('moon')) {
    return 'Space exploration milestones: Moon landing (Apollo 11, 1969), International Space Station (continuously occupied since 2000), Mars rovers (Perseverance, Curiosity). Current focus: Artemis program returning humans to Moon by mid-2020s, Mars sample return missions, James Webb Space Telescope revealing early universe. Private sector involvement (SpaceX, Blue Origin) has dramatically reduced launch costs. SpaceX\'s Starship aims for Mars colonization.';
  }
  
  if (lower.includes('universe') || lower.includes('big bang') || lower.includes('cosmology')) {
    return 'The Big Bang theory describes the universe\'s origin ~13.8 billion years ago from an extremely hot, dense state. Evidence: cosmic microwave background radiation, expanding universe (Hubble\'s Law), abundance of light elements. Current understanding: universe is 68% dark energy, 27% dark matter, 5% normal matter. Black holes, neutron stars, galaxies, and the cosmic web structure formed through gravitational interactions over billions of years.';
  }
  
  // Economics & Business
  if (lower.includes('economy') || lower.includes('inflation') || lower.includes('recession') || lower.includes('finance')) {
    return 'Economics studies production, distribution, and consumption of goods and services. Key concepts: supply and demand, inflation (general price increases), GDP (economic output), monetary policy (central bank interest rates), fiscal policy (government spending/taxation). Major economic systems: capitalism (market-driven), socialism (public ownership), mixed economies. Globalization has interconnected markets, while cryptocurrency and fintech are disrupting traditional finance.';
  }
  
  // Arts & Culture
  if (lower.includes('music') || lower.includes('art') || lower.includes('literature') || lower.includes('philosophy')) {
    return 'Human creative expression spans: Visual arts (painting, sculpture, photography, digital art), Performing arts (music, theater, dance, film), Literature (poetry, novels, drama), and Philosophy (ethics, metaphysics, epistemology, logic). Major movements include Renaissance, Baroque, Romanticism, Modernism, Postmodernism. Digital technology has democratized creation through streaming, social media, AI-generated content, and NFTs, while raising questions about authenticity and copyright.';
  }
  
  // Math & Logic
  if (lower.includes('math') || lower.includes('equation') || lower.includes('algorithm')) {
    return 'Mathematics is the study of numbers, patterns, structures, and change. Core branches: arithmetic, algebra, geometry, calculus, statistics, linear algebra. Algorithms are step-by-step procedures for calculations. Famous problems: Riemann Hypothesis, P vs NP, Goldbach\'s Conjecture. Applications span cryptography, physics, engineering, economics, computer graphics, AI/ML, and data science. Calculus (Newton/Leibniz) enabled modeling change and underpins modern physics.';
  }
  
  // Current Events & Politics
  if (lower.includes('politic') || lower.includes('government') || lower.includes('democracy') || lower.includes('election')) {
    return 'Political systems vary globally: Democracy (representative, direct, parliamentary), Authoritarianism, Monarchy, Theocracy. Key concepts: separation of powers, rule of law, human rights, geopolitics. Major international bodies: United Nations, NATO, EU, WTO, G20. Current global challenges include climate policy coordination, cyber warfare, migration crises, and balancing national sovereignty with international cooperation. Social media has transformed political communication and polarization.';
  }
  
  // Psychology & Human Behavior
  if (lower.includes('psychology') || lower.includes('brain') || lower.includes('mind') || lower.includes('behavior')) {
    return 'Psychology studies mind and behavior. Major branches: Clinical (mental health), Cognitive (thinking/perception), Behavioral (learning), Social (relationships), Developmental (lifespan changes), Neuropsychology (brain-behavior connections). Key findings: confirmation bias, cognitive dissonance, Maslow\'s hierarchy, attachment theory. Modern neuroscience uses fMRI and EEG to understand brain function. Therapy types include CBT, psychodynamic, humanistic, and emerging psychedelic-assisted therapy.';
  }
  
  // Default intelligent response
  return `I've analyzed your question about "${prompt.slice(0, 50)}..." 

While I'm operating in knowledge mode without a live AI backend, I can tell you this topic relates to domains I understand including science, technology, history, or culture. 

To get a comprehensive, detailed answer with real-time information and reasoning, add your OpenAI API key in Settings. This unlocks my full capabilities as a know-all Oracle with access to vast training data across all domains of human knowledge.

For now, I can navigate SOLACE apps and answer based on my built-in knowledge base. Try asking about science, history, technology, or creative topics!`;
}

// Initialize local storage
const STORAGE_KEYS = {
  USER: 'solace_user',
  PROFILES: 'solace_profiles',
  SETTINGS: 'solace_settings',
  MEDIA: 'solace_media',
  CONVERSATIONS: 'solace_conversations'
};

// Helper to get from localStorage
const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Helper to set in localStorage
const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
};

// Initialize default profile if not exists
const initializeStorage = () => {
  // Only run in browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  if (!getStorage(STORAGE_KEYS.USER)) {
    setStorage(STORAGE_KEYS.USER, LOCAL_OWNER);
  }
  
  if (!getStorage(STORAGE_KEYS.PROFILES)) {
    setStorage(STORAGE_KEYS.PROFILES, [{
      id: 'profile_owner_123',
      created_by: LOCAL_OWNER.email,
      email: LOCAL_OWNER.email,
      full_name: LOCAL_OWNER.name,
      tier: 'owner',
      subscription_tier: 'owner',
      created_at: new Date().toISOString()
    }]);
  }
};

// Initialize on load (only in browser)
if (typeof window !== 'undefined') {
  initializeStorage();
}

// Generic entity factory — creates full CRUD for ANY entity type
function createEntity(entityName) {
  const storageKey = `solace_entity_${entityName}`;
  return {
    async list() {
      return getStorage(storageKey, []);
    },
    async get(id) {
      const items = getStorage(storageKey, []);
      return items.find(i => i.id === id) || null;
    },
    async filter(query = {}) {
      const items = getStorage(storageKey, []);
      if (!query || Object.keys(query).length === 0) return items;
      return items.filter(item =>
        Object.entries(query).every(([key, value]) => item[key] === value)
      );
    },
    async create(payload = {}) {
      const items = getStorage(storageKey, []);
      const record = {
        id: `${entityName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        created_by: LOCAL_OWNER.email,
        created_at: new Date().toISOString(),
        ...payload
      };
      items.push(record);
      setStorage(storageKey, items);
      return record;
    },
    async update(id, updates = {}) {
      const items = getStorage(storageKey, []);
      const updated = items.map(item =>
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      );
      setStorage(storageKey, updated);
      return updated.find(i => i.id === id) || null;
    },
    async delete(id) {
      const items = getStorage(storageKey, []);
      setStorage(storageKey, items.filter(i => i.id !== id));
      return { success: true };
    }
  };
}

// Entities Proxy — auto-creates any entity on first access
const entitiesProxy = new Proxy({}, {
  get(target, entityName) {
    if (!target[entityName]) {
      target[entityName] = createEntity(entityName);
    }
    return target[entityName];
  }
});

// Seed default UserProfile if missing
if (typeof window !== 'undefined') {
  const profiles = getStorage('solace_entity_UserProfile', []);
  if (profiles.length === 0) {
    setStorage('solace_entity_UserProfile', [{
      id: 'profile_owner_123',
      created_by: LOCAL_OWNER.email,
      email: LOCAL_OWNER.email,
      full_name: LOCAL_OWNER.name,
      tier: 'owner',
      subscription_tier: 'owner',
      oracle_gender: 'female',
      created_at: new Date().toISOString()
    }]);
  }
}

// Local client that mimics Base44 API
export const localClient = {
  auth: {
    async me() {
      return getStorage(STORAGE_KEYS.USER, LOCAL_OWNER);
    },
    
    logout(redirectUrl) {
      setStorage(STORAGE_KEYS.USER, null);
      if (redirectUrl) window.location.href = redirectUrl;
    },
    
    redirectToLogin(redirectUrl) {
      if (redirectUrl) window.location.href = redirectUrl;
    },
    
    async login(email, password) {
      setStorage(STORAGE_KEYS.USER, LOCAL_OWNER);
      return LOCAL_OWNER;
    }
  },
  
  entities: entitiesProxy,
  
  appLogs: {
    async logUserInApp(pageName) {
      console.debug('Navigation:', pageName);
      return { success: true };
    }
  },

  // Functions stubs — pages call base44.functions.call / invoke
  functions: {
    async call(functionName, params = {}) {
      console.warn(`[SOLACE] functions.call('${functionName}') — no backend. Returning empty.`);
      return { data: {} };
    },
    async invoke(functionName, params = {}) {
      console.warn(`[SOLACE] functions.invoke('${functionName}') — no backend. Returning empty.`);
      return { data: {} };
    }
  },
  
  // Integrations with real AI
  integrations: {
    Core: {
      async InvokeLLM({ prompt, response_json_schema, file_urls, add_context_from_internet } = {}) {
        try {
          const response = await callOpenAI(prompt);
          
          // If schema requested, return structured format
          if (response_json_schema) {
            return { 
              data: { 
                title: 'Oracle Response', 
                summary: response,
                answer: response 
              } 
            };
          }
          
          // Return as string for plain text requests
          return { data: response };
        } catch (error) {
          console.error('InvokeLLM error:', error);
          // Fallback to knowledge base
          const fallback = getKnowledgeFallback(prompt);
          return { data: response_json_schema ? { title: 'Oracle', summary: fallback, answer: fallback } : fallback };
        }
      },
      async UploadFile({ file } = {}) {
        if (file) {
          const url = URL.createObjectURL(file);
          return { data: { file_url: url } };
        }
        return { data: { file_url: '' } };
      },
      async SendEmail(params = {}) {
        console.warn('[SOLACE] SendEmail stub called:', params);
        return { data: { success: true } };
      },
      async SendSMS(params = {}) {
        console.warn('[SOLACE] SendSMS stub called:', params);
        return { data: { success: true } };
      },
      async GenerateImage(params = {}) {
        console.warn('[SOLACE] GenerateImage stub called:', params);
        return { data: { url: '' } };
      }
    }
  },

  // Storage helpers for app use
  storage: {
    get: getStorage,
    set: setStorage,
    keys: STORAGE_KEYS
  }
};

// Export as default and named
export default localClient;
export { LOCAL_OWNER, STORAGE_KEYS };
