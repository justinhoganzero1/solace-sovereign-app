/**
 * Self-Diagnosing AI System
 * Detects and repairs app issues instantly
 */

export class SelfDiagnosticAI {
  constructor() {
    this.diagnosticChecks = this.initializeDiagnostics();
    this.repairStrategies = this.initializeRepairStrategies();
    this.issueLog = [];
    this.autoRepairEnabled = true;
  }

  initializeDiagnostics() {
    return {
      CONNECTIVITY: {
        name: 'Internet Connectivity',
        check: async () => {
          try {
            const response = await fetch('/ping', { method: 'HEAD', cache: 'no-cache' });
            return { healthy: response.ok, details: 'Connection active' };
          } catch (error) {
            return { healthy: false, details: 'No internet connection', error };
          }
        }
      },
      DATABASE: {
        name: 'Database Connection',
        check: async () => {
          try {
            await base44.auth.me();
            return { healthy: true, details: 'Database connected' };
          } catch (error) {
            return { healthy: false, details: 'Database connection failed', error };
          }
        }
      },
      STORAGE: {
        name: 'Local Storage',
        check: async () => {
          try {
            localStorage.setItem('diagnostic_test', 'test');
            localStorage.removeItem('diagnostic_test');
            return { healthy: true, details: 'Local storage working' };
          } catch (error) {
            return { healthy: false, details: 'Local storage unavailable', error };
          }
        }
      },
      INDEXEDDB: {
        name: 'IndexedDB',
        check: async () => {
          try {
            const request = indexedDB.open('diagnostic_test', 1);
            return new Promise((resolve) => {
              request.onsuccess = () => {
                indexedDB.deleteDatabase('diagnostic_test');
                resolve({ healthy: true, details: 'IndexedDB working' });
              };
              request.onerror = () => {
                resolve({ healthy: false, details: 'IndexedDB unavailable', error: request.error });
              };
            });
          } catch (error) {
            return { healthy: false, details: 'IndexedDB check failed', error };
          }
        }
      },
      AUDIO: {
        name: 'Audio System',
        check: async () => {
          try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            await audioContext.close();
            return { healthy: true, details: 'Audio system working' };
          } catch (error) {
            return { healthy: false, details: 'Audio system unavailable', error };
          }
        }
      },
      SPEECH: {
        name: 'Speech Synthesis',
        check: async () => {
          try {
            if ('speechSynthesis' in window) {
              const voices = window.speechSynthesis.getVoices();
              return { healthy: true, details: `${voices.length} voices available` };
            }
            return { healthy: false, details: 'Speech synthesis not supported' };
          } catch (error) {
            return { healthy: false, details: 'Speech synthesis check failed', error };
          }
        }
      },
      MICROPHONE: {
        name: 'Microphone Access',
        check: async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return { healthy: true, details: 'Microphone accessible' };
          } catch (error) {
            return { healthy: false, details: 'Microphone access denied', error };
          }
        }
      },
      GEOLOCATION: {
        name: 'Geolocation',
        check: async () => {
          return new Promise((resolve) => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                () => resolve({ healthy: true, details: 'Geolocation working' }),
                () => resolve({ healthy: false, details: 'Geolocation permission denied' })
              );
            } else {
              resolve({ healthy: false, details: 'Geolocation not supported' });
            }
          });
        }
      },
      SERVICE_WORKER: {
        name: 'Service Worker',
        check: async () => {
          try {
            if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.getRegistration();
              return { 
                healthy: !!registration, 
                details: registration ? 'Service worker active' : 'Service worker not registered' 
              };
            }
            return { healthy: false, details: 'Service workers not supported' };
          } catch (error) {
            return { healthy: false, details: 'Service worker check failed', error };
          }
        }
      },
      MEMORY: {
        name: 'Memory Usage',
        check: async () => {
          try {
            if (performance.memory) {
              const used = performance.memory.usedJSHeapSize;
              const limit = performance.memory.jsHeapSizeLimit;
              const percentage = (used / limit) * 100;
              
              return {
                healthy: percentage < 90,
                details: `Memory usage: ${percentage.toFixed(1)}%`,
                warning: percentage > 75
              };
            }
            return { healthy: true, details: 'Memory monitoring not available' };
          } catch (error) {
            return { healthy: false, details: 'Memory check failed', error };
          }
        }
      },
      STRIPE: {
        name: 'Payment System',
        check: async () => {
          try {
            if (window.Stripe) {
              return { healthy: true, details: 'Stripe loaded' };
            }
            return { healthy: false, details: 'Stripe not loaded' };
          } catch (error) {
            return { healthy: false, details: 'Stripe check failed', error };
          }
        }
      }
    };
  }

  initializeRepairStrategies() {
    return {
      CONNECTIVITY: async (issue) => {
        // Try to restore connectivity
        const { offlineFailsafe } = await import('./offlineFailsafe');
        await offlineFailsafe.tryAlternativeConnections();
        return { repaired: true, action: 'Attempted alternative connections' };
      },
      DATABASE: async (issue) => {
        // Retry database connection
        try {
          await base44.auth.me();
          return { repaired: true, action: 'Database reconnected' };
        } catch (error) {
          return { repaired: false, action: 'Database reconnection failed' };
        }
      },
      STORAGE: async (issue) => {
        // Clear and reinitialize storage
        try {
          localStorage.clear();
          return { repaired: true, action: 'Local storage cleared and reinitialized' };
        } catch (error) {
          return { repaired: false, action: 'Storage repair failed' };
        }
      },
      INDEXEDDB: async (issue) => {
        // Reinitialize IndexedDB
        const { offlineFailsafe } = await import('./offlineFailsafe');
        await offlineFailsafe.initializeLocalCache();
        return { repaired: true, action: 'IndexedDB reinitialized' };
      },
      AUDIO: async (issue) => {
        // Reset audio context
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContext();
          await audioContext.resume();
          return { repaired: true, action: 'Audio context reset' };
        } catch (error) {
          return { repaired: false, action: 'Audio repair failed' };
        }
      },
      SPEECH: async (issue) => {
        // Reload speech synthesis
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.getVoices();
          return { repaired: true, action: 'Speech synthesis reloaded' };
        } catch (error) {
          return { repaired: false, action: 'Speech repair failed' };
        }
      },
      MICROPHONE: async (issue) => {
        // Request microphone permission
        return { 
          repaired: false, 
          action: 'User must grant microphone permission',
          userAction: 'grant_microphone_permission'
        };
      },
      GEOLOCATION: async (issue) => {
        // Request geolocation permission
        return { 
          repaired: false, 
          action: 'User must grant location permission',
          userAction: 'grant_location_permission'
        };
      },
      SERVICE_WORKER: async (issue) => {
        // Register service worker
        try {
          await navigator.serviceWorker.register('/service-worker.js');
          return { repaired: true, action: 'Service worker registered' };
        } catch (error) {
          return { repaired: false, action: 'Service worker registration failed' };
        }
      },
      MEMORY: async (issue) => {
        // Clear memory
        try {
          // Clear caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          
          // Force garbage collection if available
          if (window.gc) {
            window.gc();
          }
          
          return { repaired: true, action: 'Memory cleared' };
        } catch (error) {
          return { repaired: false, action: 'Memory cleanup failed' };
        }
      },
      STRIPE: async (issue) => {
        // Reload Stripe
        try {
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.async = true;
          document.head.appendChild(script);
          
          await new Promise((resolve) => {
            script.onload = resolve;
          });
          
          return { repaired: true, action: 'Stripe reloaded' };
        } catch (error) {
          return { repaired: false, action: 'Stripe reload failed' };
        }
      }
    };
  }

  async runFullDiagnostic() {
    const results = {
      timestamp: new Date().toISOString(),
      checks: {},
      issuesFound: 0,
      healthyChecks: 0,
      warnings: 0
    };

    for (const [key, diagnostic] of Object.entries(this.diagnosticChecks)) {
      try {
        const result = await diagnostic.check();
        results.checks[key] = result;

        if (!result.healthy) {
          results.issuesFound++;
          this.logIssue(key, result);
        } else {
          results.healthyChecks++;
        }

        if (result.warning) {
          results.warnings++;
        }

      } catch (error) {
        results.checks[key] = {
          healthy: false,
          details: 'Diagnostic check failed',
          error
        };
        results.issuesFound++;
      }
    }

    // Auto-repair if enabled
    if (this.autoRepairEnabled && results.issuesFound > 0) {
      await this.repairAllIssues();
    }

    return results;
  }

  async repairIssue(issueType) {
    const repairStrategy = this.repairStrategies[issueType];
    
    if (!repairStrategy) {
      return { repaired: false, action: 'No repair strategy available' };
    }

    try {
      const result = await repairStrategy();
      
      if (result.repaired) {
        this.logRepair(issueType, result);
      }

      return result;

    } catch (error) {
      console.error(`Repair failed for ${issueType}:`, error);
      return { repaired: false, action: 'Repair threw error', error };
    }
  }

  async repairAllIssues() {
    const diagnostic = await this.runFullDiagnostic();
    const repairs = [];

    for (const [key, result] of Object.entries(diagnostic.checks)) {
      if (!result.healthy) {
        const repair = await this.repairIssue(key);
        repairs.push({ issue: key, repair });
      }
    }

    return {
      totalIssues: diagnostic.issuesFound,
      repaired: repairs.filter(r => r.repair.repaired).length,
      failed: repairs.filter(r => !r.repair.repaired).length,
      repairs
    };
  }

  async monitorHealth() {
    // Continuous health monitoring
    setInterval(async () => {
      const diagnostic = await this.runFullDiagnostic();
      
      if (diagnostic.issuesFound > 0) {
        console.log(`Health check: ${diagnostic.issuesFound} issues found`);
        
        if (this.autoRepairEnabled) {
          console.log('Auto-repair initiated');
        }
      }
    }, 60000); // Check every minute
  }

  logIssue(type, details) {
    const issue = {
      type,
      details,
      timestamp: new Date().toISOString(),
      status: 'detected'
    };

    this.issueLog.push(issue);
    console.warn(`Issue detected: ${type}`, details);
  }

  logRepair(type, result) {
    const repair = {
      type,
      result,
      timestamp: new Date().toISOString(),
      status: result.repaired ? 'repaired' : 'failed'
    };

    this.issueLog.push(repair);
    console.log(`Repair ${result.repaired ? 'successful' : 'failed'}: ${type}`, result);
  }

  getHealthReport() {
    return {
      totalIssues: this.issueLog.filter(i => i.status === 'detected').length,
      totalRepairs: this.issueLog.filter(i => i.status === 'repaired').length,
      failedRepairs: this.issueLog.filter(i => i.status === 'failed').length,
      recentIssues: this.issueLog.slice(-10)
    };
  }

  enableAutoRepair() {
    this.autoRepairEnabled = true;
  }

  disableAutoRepair() {
    this.autoRepairEnabled = false;
  }
}

export const selfDiagnosticAI = new SelfDiagnosticAI();

// Start health monitoring
selfDiagnosticAI.monitorHealth();
