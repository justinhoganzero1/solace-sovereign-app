import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

// Fallback ID if not provided in env
const FALLBACK_APP_ID = '69659706b6fcdcdebe2d7e2f';
const FALLBACK_APP_BASE_URL = 'https://oracle-lunar-be2d7e2f.base44.app';
const LOCAL_OWNER = {
  email: 'justinbretthogan@gmail.com',
  id: 'owner_user_123',
  role: 'owner',
  name: 'Justin Brett Hogan'
};

let localProfiles = [
  {
    id: 'profile_owner_123',
    created_by: 'justinbretthogan@gmail.com',
    email: 'justinbretthogan@gmail.com',
    full_name: 'Justin Brett Hogan',
    tier: 'owner',
    subscription_tier: 'owner'
  }
];

let { appId, token, functionsVersion, appBaseUrl } = appParams;

if (!appId) {
  console.warn('App ID not found in params or env, using fallback:', FALLBACK_APP_ID);
  appId = FALLBACK_APP_ID;
}

if (!appBaseUrl) {
  console.warn('App Base URL not found in params or env, using fallback:', FALLBACK_APP_BASE_URL);
  appBaseUrl = FALLBACK_APP_BASE_URL;
}

const sdkClient = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

const localUserProfileEntity = {
  async list() {
    return [...localProfiles];
  },
  async filter(query = {}) {
    return localProfiles.filter((profile) =>
      Object.entries(query).every(([key, value]) => profile[key] === value)
    );
  },
  async create(payload = {}) {
    const record = {
      id: `profile_${Date.now()}`,
      created_by: LOCAL_OWNER.email,
      email: LOCAL_OWNER.email,
      full_name: LOCAL_OWNER.name,
      tier: 'owner',
      subscription_tier: 'owner',
      ...payload
    };
    localProfiles.push(record);
    return record;
  },
  async update(id, updates = {}) {
    localProfiles = localProfiles.map((profile) =>
      profile.id === id ? { ...profile, ...updates } : profile
    );
    return localProfiles.find((profile) => profile.id === id) || null;
  }
};

export const base44 = {
  ...sdkClient,
  auth: {
    ...sdkClient.auth,
    async me() {
      return LOCAL_OWNER;
    },
    logout(redirectUrl) {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin(redirectUrl) {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  },
  entities: {
    ...(sdkClient.entities || {}),
    UserProfile: localUserProfileEntity
  },
  appLogs: {
    async logUserInApp() {
      return { success: true };
    }
  }
};
