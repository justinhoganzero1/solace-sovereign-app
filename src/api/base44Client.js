import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

// Fallback ID if not provided in env
const FALLBACK_APP_ID = '69659706b6fcdcdebe2d7e2f';
const FALLBACK_APP_BASE_URL = 'https://oracle-lunar-be2d7e2f.base44.app';

let { appId, token, functionsVersion, appBaseUrl } = appParams;

if (!appId) {
  console.warn('App ID not found in params or env, using fallback:', FALLBACK_APP_ID);
  appId = FALLBACK_APP_ID;
}

if (!appBaseUrl) {
  console.warn('App Base URL not found in params or env, using fallback:', FALLBACK_APP_BASE_URL);
  appBaseUrl = FALLBACK_APP_BASE_URL;
}

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
