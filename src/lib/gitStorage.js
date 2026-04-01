/**
 * Git-Based Storage System
 * Replaces Base44 - No paid platform required
 * Uses Git repository as database with JSON files
 */

export class GitStorage {
  constructor() {
    this.storageRoot = './data';
    this.collections = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Create data directory structure
    await this.ensureDirectoryStructure();
    
    // Load existing data from Git
    await this.loadAllCollections();
    
    this.initialized = true;
  }

  async ensureDirectoryStructure() {
    const collections = [
      'users',
      'profiles',
      'apps',
      'movies',
      'payments',
      'subscriptions',
      'usage',
      'bolt_on_apps',
      'internal_apps',
      'published_apps',
      'free_for_life_grants',
      'investor_applications',
      'voice_purchases',
      'payment_transactions'
    ];

    // In browser, use IndexedDB for storage
    if (typeof window !== 'undefined') {
      return this.initializeIndexedDB(collections);
    }

    // In Node.js, use file system
    const fs = require('fs').promises;
    const path = require('path');

    for (const collection of collections) {
      const dir = path.join(this.storageRoot, collection);
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Error creating directory ${dir}:`, error);
      }
    }
  }

  async initializeIndexedDB(collections) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SolaceDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        collections.forEach(collection => {
          if (!db.objectStoreNames.contains(collection)) {
            db.createObjectStore(collection, { keyPath: 'id', autoIncrement: true });
          }
        });
      };
    });
  }

  async loadAllCollections() {
    // Load data from IndexedDB or file system
    if (typeof window !== 'undefined') {
      // Browser: Load from IndexedDB
      const collections = await this.getCollectionNames();
      for (const collection of collections) {
        const data = await this.loadFromIndexedDB(collection);
        this.collections.set(collection, data);
      }
    } else {
      // Node.js: Load from file system
      await this.loadFromFileSystem();
    }
  }

  async getCollectionNames() {
    if (!this.db) return [];
    return Array.from(this.db.objectStoreNames);
  }

  async loadFromIndexedDB(collection) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readonly');
      const store = transaction.objectStore(collection);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async loadFromFileSystem() {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const dirs = await fs.readdir(this.storageRoot);
      
      for (const dir of dirs) {
        const dirPath = path.join(this.storageRoot, dir);
        const stat = await fs.stat(dirPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(dirPath);
          const data = [];
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              const filePath = path.join(dirPath, file);
              const content = await fs.readFile(filePath, 'utf-8');
              data.push(JSON.parse(content));
            }
          }
          
          this.collections.set(dir, data);
        }
      }
    } catch (error) {
      console.error('Error loading from file system:', error);
    }
  }

  // CRUD Operations

  async create(collection, data) {
    if (!this.initialized) await this.initialize();

    const id = this.generateId();
    const record = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to storage
    if (typeof window !== 'undefined') {
      await this.saveToIndexedDB(collection, record);
    } else {
      await this.saveToFileSystem(collection, record);
    }

    // Update in-memory cache
    if (!this.collections.has(collection)) {
      this.collections.set(collection, []);
    }
    this.collections.get(collection).push(record);

    // Auto-commit to Git (if in Node.js)
    if (typeof window === 'undefined') {
      await this.commitToGit(collection, 'create', id);
    }

    return record;
  }

  async get(collection, id) {
    if (!this.initialized) await this.initialize();

    const items = this.collections.get(collection) || [];
    return items.find(item => item.id === id);
  }

  async list(collection) {
    if (!this.initialized) await this.initialize();

    return this.collections.get(collection) || [];
  }

  async filter(collection, criteria) {
    if (!this.initialized) await this.initialize();

    const items = this.collections.get(collection) || [];
    
    return items.filter(item => {
      return Object.entries(criteria).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }

  async update(collection, id, updates) {
    if (!this.initialized) await this.initialize();

    const items = this.collections.get(collection) || [];
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(`Record ${id} not found in ${collection}`);
    }

    const updated = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    items[index] = updated;

    // Save to storage
    if (typeof window !== 'undefined') {
      await this.saveToIndexedDB(collection, updated);
    } else {
      await this.saveToFileSystem(collection, updated);
    }

    // Auto-commit to Git
    if (typeof window === 'undefined') {
      await this.commitToGit(collection, 'update', id);
    }

    return updated;
  }

  async delete(collection, id) {
    if (!this.initialized) await this.initialize();

    const items = this.collections.get(collection) || [];
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(`Record ${id} not found in ${collection}`);
    }

    items.splice(index, 1);

    // Delete from storage
    if (typeof window !== 'undefined') {
      await this.deleteFromIndexedDB(collection, id);
    } else {
      await this.deleteFromFileSystem(collection, id);
    }

    // Auto-commit to Git
    if (typeof window === 'undefined') {
      await this.commitToGit(collection, 'delete', id);
    }

    return true;
  }

  // Storage Operations

  async saveToIndexedDB(collection, record) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFromIndexedDB(collection, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveToFileSystem(collection, record) {
    const fs = require('fs').promises;
    const path = require('path');

    const dir = path.join(this.storageRoot, collection);
    const filePath = path.join(dir, `${record.id}.json`);

    await fs.writeFile(filePath, JSON.stringify(record, null, 2));
  }

  async deleteFromFileSystem(collection, id) {
    const fs = require('fs').promises;
    const path = require('path');

    const filePath = path.join(this.storageRoot, collection, `${id}.json`);
    await fs.unlink(filePath);
  }

  async commitToGit(collection, action, id) {
    // Auto-commit changes to Git
    try {
      const { execSync } = require('child_process');
      
      execSync('git add .', { cwd: this.storageRoot });
      execSync(`git commit -m "${action} ${collection}/${id}"`, { cwd: this.storageRoot });
      
      console.log(`Git commit: ${action} ${collection}/${id}`);
    } catch (error) {
      console.error('Git commit failed:', error.message);
    }
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Auth Methods (compatible with Base44 API)

  auth = {
    me: async () => {
      const userEmail = localStorage.getItem('solace_user_email');
      if (!userEmail) return null;

      const users = await this.list('users');
      return users.find(u => u.email === userEmail);
    },

    signIn: async (email, password) => {
      const users = await this.list('users');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem('solace_user_email', email);
        return user;
      }
      
      throw new Error('Invalid credentials');
    },

    signUp: async (email, password) => {
      const user = await this.create('users', {
        email,
        password,
        role: email === OWNER_EMAIL ? 'owner' : 'free'
      });

      localStorage.setItem('solace_user_email', email);
      return user;
    },

    signOut: async () => {
      localStorage.removeItem('solace_user_email');
    }
  };

  // Entities proxy (compatible with Base44 API)
  entities = new Proxy({}, {
    get: (target, collection) => {
      return {
        create: (data) => this.create(collection, data),
        get: (id) => this.get(collection, id),
        list: () => this.list(collection),
        filter: (criteria) => this.filter(collection, criteria),
        update: (id, updates) => this.update(collection, id, updates),
        delete: (id) => this.delete(collection, id)
      };
    }
  });
}

// Create global instance (replaces base44)
export const gitStorage = new GitStorage();

// Make it available globally as 'base44' for compatibility
if (typeof window !== 'undefined') {
  window.base44 = gitStorage;
} else {
  global.base44 = gitStorage;
}

export default gitStorage;
