import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          padding: '20px',
          fontFamily: 'system-ui'
        }}>
          <div style={{ maxWidth: '600px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>SOLACE - Loading Error</h1>
            <p style={{ marginBottom: '16px' }}>The app encountered an error while loading.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#8b5cf6',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Reload App
            </button>
            <details style={{ marginTop: '24px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Error Details</summary>
              <pre style={{ 
                background: '#1a1a1a', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: #dc2626;
    color: white;
    z-index: 99999;
    font-family: system-ui;
    font-size: 14px;
  `;
  errorDiv.innerHTML = `
    <strong>Error:</strong> ${event.message}
    <button onclick="this.parentElement.remove()" style="float: right; background: transparent; border: 1px solid white; color: white; padding: 4px 12px; cursor: pointer; border-radius: 4px;">
      Dismiss
    </button>
  `;
  document.body.appendChild(errorDiv);
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Render app with error boundary
const root = document.getElementById('root');

if (!root) {
  document.body.innerHTML = '<div style="color: white; padding: 20px; background: black; min-height: 100vh; display: flex; align-items: center; justify-content: center;"><h1>Error: Root element not found</h1></div>';
} else {
  try {
    ReactDOM.createRoot(root).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log('SOLACE app initialized successfully');
  } catch (error) {
    console.error('Fatal render error:', error);
    document.body.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; padding: 20px; font-family: system-ui;">
        <div style="max-width: 600px; text-align: center;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">SOLACE - Fatal Error</h1>
          <p style="margin-bottom: 16px;">The app failed to initialize.</p>
          <button onclick="window.location.reload()" style="background: #8b5cf6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            Reload App
          </button>
          <pre style="margin-top: 24px; background: #1a1a1a; padding: 12px; border-radius: 4px; text-align: left; overflow: auto; font-size: 12px;">
${error.toString()}
${error.stack}
          </pre>
        </div>
      </div>
    `;
  }
}
