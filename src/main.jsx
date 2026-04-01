import React from 'react'
import ReactDOM from 'react-dom/client'

function MinimalApp() {
  const [status, setStatus] = React.useState('React is working!')
  const [appError, setAppError] = React.useState(null)
  const [appLoaded, setAppLoaded] = React.useState(false)
  const [FullApp, setFullApp] = React.useState(null)

  // Try to load the full app dynamically so we can catch import errors
  React.useEffect(() => {
    import('./App.jsx')
      .then((mod) => {
        setFullApp(() => mod.default)
        setAppLoaded(true)
        setStatus('Full app loaded!')
      })
      .catch((err) => {
        console.error('Failed to load App.jsx:', err)
        setAppError(err.message || String(err))
        setStatus('App failed to load - see error below')
      })
  }, [])

  // If full app loaded, render it
  if (appLoaded && FullApp) {
    return <FullApp />
  }

  // Otherwise show diagnostic
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff', 
      fontFamily: 'system-ui',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: '#fbbf24', fontSize: '3rem', marginBottom: '16px' }}>SOLACE</h1>
        <p style={{ color: '#a3a3a3', marginBottom: '24px' }}>{status}</p>
        {appError && (
          <pre style={{ 
            background: '#1a0000', 
            border: '1px solid #dc2626',
            color: '#f87171', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '13px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {appError}
          </pre>
        )}
        {!appError && !appLoaded && (
          <div style={{ color: '#fbbf24' }}>
            <div style={{ 
              width: '40px', height: '40px', 
              border: '3px solid #333', borderTopColor: '#fbbf24',
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            Loading app modules...
          </div>
        )}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<MinimalApp />)
