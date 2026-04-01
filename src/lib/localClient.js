// Local storage-based client to replace Base44
// All data stored in browser localStorage with Git as the source of truth

const LOCAL_OWNER = {
  email: 'justinbretthogan@gmail.com',
  id: 'owner_user_123',
  role: 'owner',
  name: 'Justin Brett Hogan'
};

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
  
  // Integrations stubs — pages call these via base44.integrations.Core.*
  integrations: {
    Core: {
      async InvokeLLM({ prompt, response_json_schema, file_urls, add_context_from_internet } = {}) {
        console.warn('[SOLACE] InvokeLLM called — no backend connected yet. Returning mock.');
        // Return a plausible mock so the UI can render
        const mock = { title: 'AI Response Placeholder', summary: 'Connect an AI backend to get real responses.' };
        return { data: response_json_schema ? mock : prompt };
      },
      async UploadFile({ file } = {}) {
        // Convert file to local blob URL for preview
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
