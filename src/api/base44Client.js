// SOLACE Local Client - No Base44 dependency
// All data stored locally in browser localStorage with Git as source of truth
import { localClient } from '@/lib/localClient';

// Export as base44 for backward compatibility with existing code
export const base44 = localClient;

// Also export as default
export default localClient;
