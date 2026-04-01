/**
 * SOLACE Website JavaScript
 * Handles app downloads and dynamic content
 */

// API Base URL
const API_BASE = 'http://localhost:3000';

// Track download
function trackDownload(appId) {
  fetch(`${API_BASE}/api/apps/${appId}/track-download`, {
    method: 'POST'
  }).catch(err => console.error('Failed to track download:', err));
}

// Store all apps globally for filtering
let allApps = [];

// Load published apps
async function loadPublishedApps() {
  try {
    const response = await fetch(`${API_BASE}/api/published-apps`);
    const apps = await response.json();
    allApps = apps;

    displayApps(apps);
  } catch (error) {
    console.error('Error loading apps:', error);
    const appsContainer = document.getElementById('apps-list');
    if (appsContainer) {
      appsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Loading apps...</p>';
    }
  }
}

// Display apps in the grid
function displayApps(apps) {
  const appsContainer = document.getElementById('apps-list');
  
  if (!apps || apps.length === 0) {
    appsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No apps available yet. Check back soon!</p>';
    return;
  }

  appsContainer.innerHTML = apps.map(app => {
    const downloadUrl = getAppDownloadUrl(app.id);
    const featuredClass = app.featured ? 'featured' : '';
    
    return `
      <div class="app-card ${featuredClass}">
        <div class="app-icon">${getAppIcon(app.id)}</div>
        <div class="app-category">${app.category || 'App'}</div>
        <h3>${app.name}</h3>
        <p>${app.description}</p>
        <div class="app-stats">
          <span>⬇️ ${app.downloads?.toLocaleString() || 0}</span>
          <span>⭐ ${app.rating || 'New'}</span>
          <span>📦 ${app.size || 'N/A'}</span>
        </div>
        <a href="${downloadUrl}" class="btn btn-primary" onclick="trackDownload('${app.id}')" ${app.id.includes('juzzy') ? 'target="_blank"' : ''}>Download Now</a>
      </div>
    `;
  }).join('');
}

// Get app-specific download URL
function getAppDownloadUrl(appId) {
  if (appId === 'juzzy-crypto') {
    // Link to Juzzy app in workspace
    return 'file:///c:/Users/User/.windsurf/worktrees/2048-2/2048-2-0dc9db83/index.html';
  } else if (appId === 'solace-main') {
    // Link to SOLACE app
    return '../index.html';
  } else {
    // Other apps use API download
    return `${API_BASE}/api/apps/${appId}/download`;
  }
}

// Get app icon emoji
function getAppIcon(appId) {
  const icons = {
    'solace-main': '🌟',
    'juzzy-crypto': '💎',
    'voice-simulator': '🎤',
    'movie-maker': '🎬'
  };
  return icons[appId] || '📱';
}

// Filter apps by category
function filterApps(category) {
  if (category === 'all') {
    displayApps(allApps);
  } else {
    const filtered = allApps.filter(app => app.category === category);
    displayApps(filtered);
  }
  
  // Scroll to apps section
  document.getElementById('apps').scrollIntoView({ behavior: 'smooth' });
}

// Track downloads
async function trackDownload(appId) {
  try {
    await fetch(`/api/apps/${appId}/track-download`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error tracking download:', error);
  }
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Load apps on page load
if (document.getElementById('apps-list')) {
  loadPublishedApps();
}

// Newsletter signup
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    try {
      await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      alert('Thank you for subscribing!');
      e.target.reset();
    } catch (error) {
      alert('Subscription failed. Please try again.');
    }
  });
}

// Contact form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      alert('Message sent! We\'ll get back to you soon.');
      e.target.reset();
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  });
}

// Investor Screening System
let screeningSession = null;
let currentQuestionIndex = 0;

const startScreeningBtn = document.getElementById('start-screening');
if (startScreeningBtn) {
  startScreeningBtn.addEventListener('click', async () => {
    // Initialize screening session
    screeningSession = {
      id: `session-${Date.now()}`,
      startedAt: new Date().toISOString(),
      answers: {}
    };

    // Show chat interface
    document.getElementById('investor-chat').style.display = 'block';
    document.querySelector('.screening-form').style.display = 'none';

    // Start with AI greeting
    addChatMessage('ai', 'Hello! Thank you for your interest in investing in SOLACE. I\'m an AI assistant here to learn more about you and your investment goals. Let me ask you a few questions to get started.');

    setTimeout(() => {
      askNextQuestion();
    }, 1000);
  });
}

const sendMessageBtn = document.getElementById('send-message');
const chatInput = document.getElementById('chat-input');

if (sendMessageBtn && chatInput) {
  sendMessageBtn.addEventListener('click', () => sendChatMessage());
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  addChatMessage('user', message);
  chatInput.value = '';

  // Process answer or general question
  if (currentQuestionIndex < investorQuestions.length) {
    // Store answer
    const question = investorQuestions[currentQuestionIndex];
    screeningSession.answers[question.id] = message;
    currentQuestionIndex++;

    setTimeout(() => {
      if (currentQuestionIndex < investorQuestions.length) {
        askNextQuestion();
      } else {
        completeScreening();
      }
    }, 500);
  } else {
    // General chat after screening
    handleGeneralInvestorQuestion(message);
  }
}

const investorQuestions = [
  { id: 'investment_amount', question: 'What is your potential investment range? (e.g., $50,000 - $100,000)' },
  { id: 'investment_timeline', question: 'What is your investment timeline? (Immediate, Short-term, Medium-term, or Long-term)' },
  { id: 'investor_type', question: 'What type of investor are you? (Angel Investor, VC, Private Equity, etc.)' },
  { id: 'experience', question: 'How many tech startups have you invested in?' },
  { id: 'company_name', question: 'What is your company or fund name?' },
  { id: 'full_name', question: 'What is your full name?' },
  { id: 'email', question: 'What is your email address?' },
  { id: 'phone', question: 'What is your phone number? (optional, press Enter to skip)' },
  { id: 'additional_info', question: 'Please tell us more about your investment thesis and why you\'re interested in SOLACE.' }
];

function askNextQuestion() {
  const question = investorQuestions[currentQuestionIndex];
  addChatMessage('ai', question.question);
}

function addChatMessage(role, content) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;
  messageDiv.textContent = content;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function completeScreening() {
  addChatMessage('ai', 'Thank you for completing the questionnaire! Our AI is now evaluating your application...');

  // Simulate AI evaluation
  setTimeout(async () => {
    const evaluation = evaluateInvestor(screeningSession);

    if (evaluation.approved) {
      addChatMessage('ai', `Excellent! Based on your responses, you qualify as a ${evaluation.tier} investor. We\'re granting you free trial access to SOLACE, and our founder will receive your application directly.`);
      
      setTimeout(() => {
        addChatMessage('ai', 'You should receive an email shortly with your trial access credentials and next steps. Is there anything else you\'d like to know about SOLACE?');
      }, 2000);

      // Send to backend
      await submitInvestorApplication(screeningSession, evaluation);
    } else {
      addChatMessage('ai', `Thank you for your interest. While we appreciate your application, we\'re currently focusing on investors who meet our minimum criteria. We\'ll keep your information on file for future opportunities.`);
    }
  }, 2000);
}

function evaluateInvestor(session) {
  let score = 0;

  // Simple scoring logic
  const amount = session.answers.investment_amount?.toLowerCase() || '';
  if (amount.includes('100') || amount.includes('500') || amount.includes('million')) score += 30;
  else if (amount.includes('50')) score += 20;
  else score += 10;

  const timeline = session.answers.investment_timeline?.toLowerCase() || '';
  if (timeline.includes('immediate') || timeline.includes('short')) score += 20;
  else score += 10;

  const type = session.answers.investor_type?.toLowerCase() || '';
  if (type.includes('vc') || type.includes('venture') || type.includes('angel')) score += 25;
  else score += 15;

  const info = session.answers.additional_info || '';
  if (info.length > 100) score += 25;
  else if (info.length > 50) score += 15;
  else score += 5;

  const percentage = score;
  const approved = score >= 60;
  const tier = score >= 90 ? 'Premium' : score >= 75 ? 'High Quality' : score >= 60 ? 'Qualified' : 'Potential';

  return { score, percentage, approved, tier };
}

async function submitInvestorApplication(session, evaluation) {
  try {
    await fetch(`${API_BASE}/api/investor-applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session,
        evaluation,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to submit application:', error);
  }
}

function handleGeneralInvestorQuestion(message) {
  const lowerMessage = message.toLowerCase();
  let response = '';

  if (lowerMessage.includes('revenue') || lowerMessage.includes('monetization')) {
    response = 'SOLACE has multiple revenue streams: subscriptions ($15-$200/month), voice simulator ($5-$20 one-time), movie generation ($3/minute), and 5% transaction fees on bolt-on apps. Our model is designed for scalability with both recurring and one-time revenue.';
  } else if (lowerMessage.includes('market') || lowerMessage.includes('users')) {
    response = 'We target individual creators, small businesses, content creators, and enterprise customers. Our super app architecture allows exponential market reach as users can create apps inside the app.';
  } else if (lowerMessage.includes('technology') || lowerMessage.includes('ai')) {
    response = 'SOLACE leverages cutting-edge AI: autonomous app maker, AI movie maker with 8K avatars, 200 multilingual voices, self-diagnosing AI, customer service AI, and voice interaction via earbuds.';
  } else if (lowerMessage.includes('competition')) {
    response = 'We differentiate through our super app architecture, comprehensive monetization, offline capabilities, voice interaction, self-healing technology, and no-code app generation. We\'re a complete AI-powered ecosystem.';
  } else {
    response = 'That\'s a great question! For detailed information, our founder Justin Brett Hogan will be happy to discuss this with you directly. You\'ll receive contact information via email shortly.';
  }

  setTimeout(() => {
    addChatMessage('ai', response);
  }, 500);
}

// Animate elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.feature-card, .pricing-card, .app-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
