/**
 * Super App Architecture
 * Build apps inside the app from dashboard bubble
 */

import { authSystem } from './authorizationSystem';
import { autonomousAppMaker } from './autonomousAppMaker';

export class SuperAppArchitecture {
  constructor() {
    this.internalApps = [];
    this.appBuilderActive = false;
  }

  async initialize() {
    await this.loadInternalApps();
  }

  async loadInternalApps() {
    // Load apps created inside SOLACE
    try {
      const apps = await base44.entities.InternalApp.list();
      this.internalApps = apps;
    } catch (error) {
      console.error('Error loading internal apps:', error);
      this.internalApps = [];
    }
  }

  async createAppFromDashboard(appBrief) {
    // Create new app from dashboard bubble
    
    // Check authorization
    const canGenerate = await authSystem.canGenerateApp();
    if (!canGenerate.allowed) {
      return {
        success: false,
        error: canGenerate.reason,
        upgradeRequired: canGenerate.upgradeRequired
      };
    }

    try {
      // Use autonomous app maker
      autonomousAppMaker.onProgressUpdate = ({ message, percentage }) => {
        this.notifyProgress(message, percentage);
      };

      const generatedApp = await autonomousAppMaker.generateCompleteApp(appBrief);

      // Save as internal app
      const internalApp = await this.saveInternalApp({
        name: generatedApp.appName,
        description: appBrief,
        sourceCode: generatedApp.sourceCode,
        assets: generatedApp.assets,
        manifest: generatedApp.manifest,
        createdAt: new Date().toISOString(),
        standalone: true
      });

      // Track usage
      await authSystem.trackUsage('app', 1);

      this.internalApps.push(internalApp);

      return {
        success: true,
        app: internalApp,
        downloadUrl: this.generateDownloadUrl(internalApp.id)
      };

    } catch (error) {
      console.error('App creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async saveInternalApp(appData) {
    // Save app to database
    try {
      const app = await base44.entities.InternalApp.create({
        ...appData,
        created_by: authSystem.currentUser?.email,
        status: 'ready',
        downloads: 0
      });

      return app;
    } catch (error) {
      console.error('Error saving internal app:', error);
      throw error;
    }
  }

  async getInternalApp(appId) {
    // Get specific internal app
    const app = this.internalApps.find(a => a.id === appId);
    
    if (!app) {
      try {
        const fetched = await base44.entities.InternalApp.get(appId);
        this.internalApps.push(fetched);
        return fetched;
      } catch (error) {
        return null;
      }
    }

    return app;
  }

  async launchInternalApp(appId) {
    // Launch app created inside SOLACE
    const app = await this.getInternalApp(appId);
    
    if (!app) {
      throw new Error('App not found');
    }

    // Create iframe or new window to run app
    const appWindow = window.open('', '_blank', 'width=400,height=800');
    
    if (appWindow) {
      appWindow.document.write(this.generateAppHTML(app));
      appWindow.document.close();
    }

    // Track launch
    await this.trackAppLaunch(appId);

    return { success: true, launched: true };
  }

  generateAppHTML(app) {
    // Generate HTML for standalone app
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.name}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div id="app-root"></div>
  <script>
    ${app.sourceCode}
  </script>
</body>
</html>
    `;
  }

  generateDownloadUrl(appId) {
    // Generate download URL for app
    return `/api/internal-apps/${appId}/download`;
  }

  async downloadInternalApp(appId) {
    // Download app as APK or web bundle
    const app = await this.getInternalApp(appId);
    
    if (!app) {
      throw new Error('App not found');
    }

    // Increment download counter
    await base44.entities.InternalApp.update(appId, {
      downloads: (app.downloads || 0) + 1
    });

    return {
      success: true,
      downloadUrl: this.generateDownloadUrl(appId),
      format: 'apk'
    };
  }

  async trackAppLaunch(appId) {
    // Track app launch analytics
    try {
      await base44.entities.AppLaunch.create({
        app_id: appId,
        user_id: authSystem.currentUser?.email,
        launched_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking app launch:', error);
    }
  }

  notifyProgress(message, percentage) {
    // Notify user of app creation progress
    const event = new CustomEvent('app-creation-progress', {
      detail: { message, percentage }
    });
    window.dispatchEvent(event);
  }

  async deleteInternalApp(appId) {
    // Delete internal app
    try {
      await base44.entities.InternalApp.delete(appId);
      this.internalApps = this.internalApps.filter(a => a.id !== appId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting app:', error);
      return { success: false, error: error.message };
    }
  }

  getUserApps() {
    // Get all apps created by current user
    return this.internalApps.filter(app => 
      app.created_by === authSystem.currentUser?.email
    );
  }

  async publishToWebsite(appId) {
    // Publish app to sales website
    const app = await this.getInternalApp(appId);
    
    if (!app) {
      throw new Error('App not found');
    }

    try {
      await base44.entities.PublishedApp.create({
        app_id: appId,
        name: app.name,
        description: app.description,
        published_at: new Date().toISOString(),
        status: 'published',
        price: 0, // Free by default
        downloads: 0
      });

      return { success: true, published: true };
    } catch (error) {
      console.error('Error publishing app:', error);
      return { success: false, error: error.message };
    }
  }
}

export const superAppArchitecture = new SuperAppArchitecture();
