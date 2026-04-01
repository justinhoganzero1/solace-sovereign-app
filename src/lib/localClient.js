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

// Initialize on load
initializeStorage();

// User Profile Entity
const UserProfileEntity = {
  async list() {
    return getStorage(STORAGE_KEYS.PROFILES, []);
  },
  
  async filter(query = {}) {
    const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
    return profiles.filter((profile) =>
      Object.entries(query).every(([key, value]) => profile[key] === value)
    );
  },
  
  async create(payload = {}) {
    const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
    const record = {
      id: `profile_${Date.now()}`,
      created_by: LOCAL_OWNER.email,
      email: payload.email || LOCAL_OWNER.email,
      full_name: payload.full_name || LOCAL_OWNER.name,
      tier: payload.tier || 'user',
      subscription_tier: payload.subscription_tier || 'free',
      created_at: new Date().toISOString(),
      ...payload
    };
    profiles.push(record);
    setStorage(STORAGE_KEYS.PROFILES, profiles);
    return record;
  },
  
  async update(id, updates = {}) {
    const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
    const updatedProfiles = profiles.map((profile) =>
      profile.id === id ? { ...profile, ...updates, updated_at: new Date().toISOString() } : profile
    );
    setStorage(STORAGE_KEYS.PROFILES, updatedProfiles);
    return updatedProfiles.find((profile) => profile.id === id) || null;
  },
  
  async delete(id) {
    const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
    const filtered = profiles.filter((profile) => profile.id !== id);
    setStorage(STORAGE_KEYS.PROFILES, filtered);
    return { success: true };
  }
};

// Local client that mimics Base44 API
export const localClient = {
  auth: {
    async me() {
      return getStorage(STORAGE_KEYS.USER, LOCAL_OWNER);
    },
    
    logout(redirectUrl) {
      // Clear user session but keep profiles
      setStorage(STORAGE_KEYS.USER, null);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    
    redirectToLogin(redirectUrl) {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    
    async login(email, password) {
      // Simple mock login - always succeeds with owner
      setStorage(STORAGE_KEYS.USER, LOCAL_OWNER);
      return LOCAL_OWNER;
    }
  },
  
  entities: {
    UserProfile: UserProfileEntity
  },
  
  appLogs: {
    async logUserInApp(pageName) {
      console.debug('Navigation:', pageName);
      return { success: true };
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
