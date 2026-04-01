/**
 * Simple API Server for SOLACE Website
 * Handles app downloads, investor applications, and published apps
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

const PORT = 3000;

// Mock published apps data
const publishedApps = [
  {
    id: 'solace-main',
    name: 'SOLACE Super App',
    description: 'AI-powered super app platform. Build apps, generate movies, create voices, and more.',
    icon: '/icons/solace-icon.png',
    downloads: 15420,
    rating: '4.9',
    version: '1.0.0',
    size: '45 MB',
    downloadUrl: '/downloads/solace-app.zip'
  },
  {
    id: 'voice-simulator',
    name: 'SOLACE Voice Simulator',
    description: 'Standalone voice synthesis app with 200 multilingual voices.',
    icon: '/icons/voice-icon.png',
    downloads: 8234,
    rating: '4.8',
    version: '1.0.0',
    size: '12 MB',
    downloadUrl: '/downloads/voice-simulator.zip'
  },
  {
    id: 'movie-maker',
    name: 'SOLACE Movie Maker',
    description: 'AI movie generation with 8K photorealistic avatars.',
    icon: '/icons/movie-icon.png',
    downloads: 6891,
    rating: '4.7',
    version: '1.0.0',
    size: '38 MB',
    downloadUrl: '/downloads/movie-maker.zip'
  }
];

async function createAppZip(appId, res) {
  // Create a zip file with app contents
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    res.writeHead(500);
    res.end('Error creating zip file');
  });

  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${appId}.zip"`
  });

  archive.pipe(res);

  // Add app files to zip
  const appPath = path.join(__dirname, '..');
  
  try {
    // Add main app files
    archive.directory(path.join(appPath, 'src'), 'src');
    archive.directory(path.join(appPath, 'public'), 'public');
    archive.file(path.join(appPath, 'package.json'), { name: 'package.json' });
    archive.file(path.join(appPath, 'index.html'), { name: 'index.html' });
    archive.file(path.join(appPath, 'vite.config.js'), { name: 'vite.config.js' });
    
    // Add README
    archive.append(`# ${appId}\n\nSOLACE App Package\n\nInstallation:\n1. npm install\n2. npm run dev\n\nFor production:\nnpm run build`, { name: 'README.md' });
    
    await archive.finalize();
  } catch (error) {
    console.error('Error adding files to archive:', error);
  }
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route: Get published apps
  if (req.url === '/api/published-apps' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(publishedApps));
    return;
  }

  // Route: Download app
  if (req.url.startsWith('/api/apps/') && req.url.endsWith('/download')) {
    const appId = req.url.split('/')[3];
    const app = publishedApps.find(a => a.id === appId);
    
    if (!app) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'App not found' }));
      return;
    }

    await createAppZip(appId, res);
    return;
  }

  // Route: Track download
  if (req.url.startsWith('/api/apps/') && req.url.endsWith('/track-download') && req.method === 'POST') {
    const appId = req.url.split('/')[3];
    const app = publishedApps.find(a => a.id === appId);
    
    if (app) {
      app.downloads++;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Route: Submit investor application
  if (req.url === '/api/investor-applications' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Save to file (in production, save to database)
        const applicationsPath = path.join(__dirname, '..', 'data', 'investor_applications');
        await fs.mkdir(applicationsPath, { recursive: true });
        
        const filename = `${data.session.id}.json`;
        await fs.writeFile(
          path.join(applicationsPath, filename),
          JSON.stringify(data, null, 2)
        );

        // Send email to owner (in production, use email service)
        console.log('New investor application:', data.session.answers.full_name);
        console.log('Email:', data.session.answers.email);
        console.log('Score:', data.evaluation.score);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Application received' }));
      } catch (error) {
        console.error('Error processing application:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process application' }));
      }
    });
    return;
  }

  // Route: Newsletter subscription
  if (req.url === '/api/newsletter/subscribe' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const data = JSON.parse(body);
      console.log('Newsletter subscription:', data.email);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // Route: Contact form
  if (req.url === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const data = JSON.parse(body);
      console.log('Contact form submission:', data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // Default: 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /api/published-apps');
  console.log('  GET  /api/apps/:id/download');
  console.log('  POST /api/apps/:id/track-download');
  console.log('  POST /api/investor-applications');
  console.log('  POST /api/newsletter/subscribe');
  console.log('  POST /api/contact');
});
