/**
 * Offline Failsafe System
 * Keeps app operational when internet fails
 * Provides alternative internet access methods
 */

export class OfflineFailsafe {
  constructor() {
    this.isOnline = navigator.onLine;
    this.alternativeConnections = [];
    this.offlineQueue = [];
    this.localCache = null;
    this.serviceWorkerRegistered = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  async initialize() {
    // Monitor online/offline status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Register service worker for offline caching
    await this.registerServiceWorker();

    // Initialize IndexedDB for local storage
    await this.initializeLocalCache();

    // Set up alternative connection methods
    this.setupAlternativeConnections();

    // Start connection monitoring
    this.startConnectionMonitoring();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        this.serviceWorkerRegistered = true;
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async initializeLocalCache() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SolaceOfflineCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.localCache = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('apps')) {
          db.createObjectStore('apps', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('movies')) {
          db.createObjectStore('movies', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('voices')) {
          db.createObjectStore('voices', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  setupAlternativeConnections() {
    // Alternative connection methods when primary internet fails
    this.alternativeConnections = [
      {
        name: 'WebRTC P2P',
        type: 'peer',
        check: () => this.checkWebRTCConnection(),
        connect: () => this.connectViaWebRTC()
      },
      {
        name: 'Bluetooth Tethering',
        type: 'bluetooth',
        check: () => this.checkBluetoothConnection(),
        connect: () => this.connectViaBluetooth()
      },
      {
        name: 'USB Tethering',
        type: 'usb',
        check: () => this.checkUSBConnection(),
        connect: () => this.connectViaUSB()
      },
      {
        name: 'Fallback DNS',
        type: 'dns',
        check: () => this.checkFallbackDNS(),
        connect: () => this.connectViaFallbackDNS()
      },
      {
        name: 'Proxy Server',
        type: 'proxy',
        check: () => this.checkProxyConnection(),
        connect: () => this.connectViaProxy()
      }
    ];
  }

  startConnectionMonitoring() {
    setInterval(() => {
      this.checkConnectionStatus();
    }, 5000); // Check every 5 seconds
  }

  async checkConnectionStatus() {
    // Try to fetch a small resource to verify connection
    try {
      const response = await fetch('/ping', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok && !this.isOnline) {
        this.handleOnline();
      }
    } catch (error) {
      if (this.isOnline) {
        this.handleOffline();
      }
    }
  }

  handleOnline() {
    console.log('Connection restored');
    this.isOnline = true;
    this.reconnectAttempts = 0;
    
    // Process offline queue
    this.processOfflineQueue();
    
    // Notify user
    this.showNotification('Connection restored', 'success');
  }

  handleOffline() {
    console.log('Connection lost - activating failsafe');
    this.isOnline = false;
    
    // Try alternative connections
    this.tryAlternativeConnections();
    
    // Notify user
    this.showNotification('Offline mode activated - basic features available', 'warning');
  }

  async tryAlternativeConnections() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached - staying in offline mode');
      return;
    }

    this.reconnectAttempts++;

    for (const connection of this.alternativeConnections) {
      console.log(`Trying ${connection.name}...`);
      
      const available = await connection.check();
      if (available) {
        const connected = await connection.connect();
        if (connected) {
          console.log(`Connected via ${connection.name}`);
          this.handleOnline();
          return;
        }
      }
    }

    // Retry after delay
    setTimeout(() => this.tryAlternativeConnections(), 10000);
  }

  async checkWebRTCConnection() {
    return 'RTCPeerConnection' in window;
  }

  async connectViaWebRTC() {
    // Implement WebRTC peer-to-peer connection
    // This would connect to other nearby devices
    return false; // Placeholder
  }

  async checkBluetoothConnection() {
    return 'bluetooth' in navigator;
  }

  async connectViaBluetooth() {
    // Implement Bluetooth tethering
    try {
      if ('bluetooth' in navigator) {
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true
        });
        return !!device;
      }
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
    }
    return false;
  }

  async checkUSBConnection() {
    return 'usb' in navigator;
  }

  async connectViaUSB() {
    // Implement USB tethering
    try {
      if ('usb' in navigator) {
        const device = await navigator.usb.requestDevice({ filters: [] });
        return !!device;
      }
    } catch (error) {
      console.error('USB connection failed:', error);
    }
    return false;
  }

  async checkFallbackDNS() {
    // Try alternative DNS servers
    const fallbackDNS = ['8.8.8.8', '1.1.1.1', '208.67.222.222'];
    return true; // Always available as fallback
  }

  async connectViaFallbackDNS() {
    // Configure fallback DNS
    // This would be handled at system level
    return false; // Placeholder
  }

  async checkProxyConnection() {
    return true; // Proxy always available
  }

  async connectViaProxy() {
    // Try connecting through proxy servers
    const proxyServers = [
      'https://proxy1.solace.app',
      'https://proxy2.solace.app',
      'https://proxy3.solace.app'
    ];

    for (const proxy of proxyServers) {
      try {
        const response = await fetch(`${proxy}/health`);
        if (response.ok) {
          // Configure app to use this proxy
          this.activeProxy = proxy;
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    return false;
  }

  async saveToOfflineQueue(operation) {
    if (!this.localCache) return;

    const transaction = this.localCache.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');
    
    await store.add({
      operation,
      timestamp: Date.now(),
      status: 'pending'
    });

    this.offlineQueue.push(operation);
  }

  async processOfflineQueue() {
    if (!this.localCache || this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} queued operations`);

    const transaction = this.localCache.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');

    for (const operation of this.offlineQueue) {
      try {
        await this.executeOperation(operation);
        // Remove from queue on success
        await store.delete(operation.id);
      } catch (error) {
        console.error('Failed to process queued operation:', error);
      }
    }

    this.offlineQueue = [];
  }

  async executeOperation(operation) {
    // Execute the queued operation
    switch (operation.type) {
      case 'app_generation':
        return await this.generateAppOnline(operation.data);
      case 'movie_generation':
        return await this.generateMovieOnline(operation.data);
      case 'sync_data':
        return await this.syncDataOnline(operation.data);
      default:
        console.warn('Unknown operation type:', operation.type);
    }
  }

  // Offline-capable features
  async generateAppOffline(appData) {
    // Generate app using local resources only
    console.log('Generating app in offline mode');
    
    // Save to local cache
    const transaction = this.localCache.transaction(['apps'], 'readwrite');
    const store = transaction.objectStore('apps');
    
    const offlineApp = {
      ...appData,
      generatedOffline: true,
      timestamp: Date.now(),
      status: 'pending_sync'
    };

    await store.add(offlineApp);

    // Queue for online processing
    await this.saveToOfflineQueue({
      type: 'app_generation',
      data: appData
    });

    return offlineApp;
  }

  async getOfflineVoices() {
    // Return cached voices for offline use
    const transaction = this.localCache.transaction(['voices'], 'readonly');
    const store = transaction.objectStore('voices');
    const voices = await store.getAll();
    
    return voices.length > 0 ? voices : this.getBasicOfflineVoices();
  }

  getBasicOfflineVoices() {
    // Return basic Web Speech API voices that work offline
    return window.speechSynthesis.getVoices().filter(voice => voice.localService);
  }

  async cacheEssentialData() {
    // Cache essential data for offline use
    const essentialData = {
      voices: await this.getOfflineVoices(),
      templates: await this.getAppTemplates(),
      assets: await this.getEssentialAssets()
    };

    // Store in IndexedDB
    for (const [key, data] of Object.entries(essentialData)) {
      const transaction = this.localCache.transaction([key], 'readwrite');
      const store = transaction.objectStore(key);
      await store.put(data);
    }
  }

  showNotification(message, type = 'info') {
    // Show user notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SOLACE', {
        body: message,
        icon: '/icon.png'
      });
    }

    // Also show in-app notification
    const event = new CustomEvent('solace-notification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  getOfflineCapabilities() {
    return {
      appGeneration: true, // Limited offline generation
      movieGeneration: false, // Requires online
      voiceGeneration: true, // Basic voices work offline
      dataSync: false, // Requires online
      sharing: false, // Requires online
      payment: false // Requires online
    };
  }

  isFeatureAvailableOffline(feature) {
    const capabilities = this.getOfflineCapabilities();
    return capabilities[feature] || false;
  }
}

export const offlineFailsafe = new OfflineFailsafe();
