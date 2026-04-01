import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Error trapping for blank screen debugging
window.addEventListener('error', (event) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.padding = '20px';
  errorDiv.style.background = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerText = `Global Error: ${event.message} at ${event.filename}:${event.lineno}`;
  document.body.appendChild(errorDiv);
});

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
} catch (error) {
  document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Render Error</h1><pre>${error.toString()}\n${error.stack}</pre></div>`;
}
