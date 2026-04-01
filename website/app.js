/**
 * SOLACE Website JavaScript
 * Handles app downloads and dynamic content
 */

// Load published apps
async function loadPublishedApps() {
  try {
    const response = await fetch('/api/published-apps');
    const apps = await response.json();

    const appsContainer = document.getElementById('apps-list');
    
    if (!apps || apps.length === 0) {
      appsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No apps available yet. Check back soon!</p>';
      return;
    }

    appsContainer.innerHTML = apps.map(app => `
      <div class="app-card">
        <img src="${app.icon || '/default-app-icon.png'}" alt="${app.name}" class="app-icon">
        <h3>${app.name}</h3>
        <p>${app.description}</p>
        <div class="app-stats">
          <span>⬇️ ${app.downloads || 0} downloads</span>
          <span>⭐ ${app.rating || 'New'}</span>
        </div>
        <a href="/api/apps/${app.id}/download" class="btn btn-primary" download>Download</a>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading apps:', error);
  }
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
      await fetch('/api/newsletter/subscribe', {
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
      await fetch('/api/contact', {
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
