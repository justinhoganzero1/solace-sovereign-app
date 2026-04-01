/**
 * Simple API Server for SOLACE Website (No dependencies)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

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
    size: '45 MB'
  },
  {
    id: 'voice-simulator',
    name: 'SOLACE Voice Simulator',
    description: 'Standalone voice synthesis app with 200 multilingual voices.',
    icon: '/icons/voice-icon.png',
    downloads: 8234,
    rating: '4.8',
    version: '1.0.0',
    size: '12 MB'
  },
  {
    id: 'movie-maker',
    name: 'SOLACE Movie Maker',
    description: 'AI movie generation with 8K photorealistic avatars.',
    icon: '/icons/movie-icon.png',
    downloads: 6891,
    rating: '4.7',
    version: '1.0.0',
    size: '38 MB'
  }
];

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // Route: Get published apps
  if (req.url === '/api/published-apps' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(publishedApps));
    return;
  }

  // Route: Download app (redirect to main app)
  if (req.url.includes('/api/apps/') && req.url.endsWith('/download')) {
    const appPath = path.join(__dirname, '..', 'index.html');
    res.writeHead(302, { 'Location': '../index.html' });
    res.end();
    return;
  }

  // Route: Track download
  if (req.url.includes('/api/apps/') && req.url.endsWith('/track-download') && req.method === 'POST') {
    const urlParts = req.url.split('/');
    const appId = urlParts[3];
    const app = publishedApps.find(a => a.id === appId);
    
    if (app) {
      app.downloads++;
      console.log(`Download tracked for ${appId}. New count: ${app.downloads}`);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Route: Submit investor application
  if (req.url === '/api/investor-applications' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('\n=== NEW INVESTOR APPLICATION ===');
        console.log('Name:', data.session.answers.full_name);
        console.log('Email:', data.session.answers.email);
        console.log('Company:', data.session.answers.company_name);
        console.log('Investment:', data.session.answers.investment_amount);
        console.log('Score:', data.evaluation.score);
        console.log('Tier:', data.evaluation.tier);
        console.log('================================\n');

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
      console.log('\n=== CONTACT FORM ===');
      console.log('Name:', data.name);
      console.log('Email:', data.email);
      console.log('Message:', data.message);
      console.log('===================\n');
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
  console.log(`\n🚀 SOLACE API Server running at http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  GET  /api/published-apps');
  console.log('  GET  /api/apps/:id/download');
  console.log('  POST /api/apps/:id/track-download');
  console.log('  POST /api/investor-applications');
  console.log('  POST /api/newsletter/subscribe');
  console.log('  POST /api/contact\n');
});
