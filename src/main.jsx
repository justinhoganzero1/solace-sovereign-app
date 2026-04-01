import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'

class PageErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Page error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⚠️</div>
          <p style={{ marginBottom: '12px' }}>This page encountered an error.</p>
          <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'left', maxWidth: '600px', margin: '0 auto', whiteSpace: 'pre-wrap', color: '#fca5a5' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => { this.setState({ hasError: false, error: null }); if (this.props.onBack) this.props.onBack(); }}
            style={{ marginTop: '16px', padding: '10px 24px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '8px', color: '#c4b5fd', cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Inline styles - no external CSS dependency
const styles = {
  app: { minHeight: '100vh', background: 'linear-gradient(135deg, #000 0%, #1a0a2e 50%, #000 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' },
  header: { padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(168,85,247,0.3)' },
  logo: { fontSize: '1.8rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  userBadge: { background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '20px', padding: '6px 16px', fontSize: '0.85rem', color: '#c084fc' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '32px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginTop: '24px' },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s' },
  statCard: { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statNum: { fontSize: '2.5rem', fontWeight: 'bold', color: '#a855f7' },
  statLabel: { fontSize: '0.85rem', color: '#a3a3a3', marginTop: '4px' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#e9d5ff', marginBottom: '4px' },
  subtitle: { color: '#a3a3a3', fontSize: '0.9rem', marginBottom: '20px' },
  navGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' },
  navBtn: { background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', color: '#e9d5ff', fontSize: '0.9rem', fontWeight: '500' },
}

const specialists = [
  { name: 'Wellness Center', icon: '🧘', desc: 'Health & wellness guidance' },
  { name: 'Video Editor', icon: '🎬', desc: 'AI video editing tools' },
  { name: 'Oracle Council', icon: '🔮', desc: 'Strategic AI advisors' },
  { name: 'Titan Heart', icon: '💪', desc: 'Fitness & strength coach' },
  { name: 'Builder', icon: '🏗️', desc: 'Construction & project planning' },
  { name: 'Mechanic', icon: '🔧', desc: 'Vehicle & machinery repair' },
  { name: 'Interpreter', icon: '🌐', desc: '200+ language translation' },
  { name: 'Inventor', icon: '💡', desc: 'App & product creation' },
  { name: 'Handyman', icon: '🛠️', desc: 'Home repair guidance' },
  { name: 'Mind Hub', icon: '🧠', desc: 'Mental health support' },
  { name: 'Safety Center', icon: '🛡️', desc: 'Personal safety tools' },
  { name: 'Movie Maker', icon: '🎥', desc: 'AI movie generation' },
  { name: 'Voice Generator', icon: '🎙️', desc: '200 multilingual voices' },
  { name: 'Digital Mall', icon: '🛒', desc: 'Digital marketplace' },
  { name: 'Family Hub', icon: '👨‍👩‍👧‍👦', desc: 'Family management tools' },
  { name: 'Professional Hub', icon: '💼', desc: 'Career & business tools' },
  { name: 'Training Center', icon: '📚', desc: 'Oracle training system' },
  { name: 'Community Hub', icon: '🤝', desc: 'Social & community features' },
  { name: 'Crisis Hub', icon: '🆘', desc: 'Emergency support system' },
  { name: 'Live Vision', icon: '👁️', desc: 'Camera & AR features' },
]

const ownerPages = [
  'AllSpecialists', 'Builder', 'Chat', 'CommunityHub', 'CrisisHub',
  'Dashboard', 'DigitalMall', 'FamilyHub', 'Handyman', 'Home',
  'Interpreter', 'Inventor', 'LiveVision', 'Mechanic', 'MediaLibrary',
  'MindHub', 'MovieMaker', 'OracleCouncil', 'OracleTrainingCenter',
  'OwnerDashboard', 'PhygitalHub', 'ProfessionalHub', 'Profile',
  'SafetyCenter', 'Settings', 'SovereignEmpire', 'SpecialistChat',
  'TierSystem', 'TitanHeart', 'VideoEditor', 'VoiceGenerator', 'WellnessCenter'
]

function OwnerDashboard() {
  const [activePage, setActivePage] = React.useState(null)
  const [PageComponent, setPageComponent] = React.useState(null)
  const [pageError, setPageError] = React.useState(null)
  const [loadingPage, setLoadingPage] = React.useState(false)

  const navigateTo = (pageName) => {
    setLoadingPage(true)
    setPageError(null)
    setActivePage(pageName)
    
    import(`./pages/${pageName}.jsx`)
      .then((mod) => {
        setPageComponent(() => mod.default)
        setLoadingPage(false)
      })
      .catch((err) => {
        console.error(`Failed to load ${pageName}:`, err)
        setPageError(`Failed to load ${pageName}: ${err.message || JSON.stringify(err)}`)
        setLoadingPage(false)
      })
  }

  const goHome = () => {
    setActivePage(null)
    setPageComponent(null)
    setPageError(null)
  }

  // Render loaded page
  if (activePage && PageComponent && !loadingPage) {
    return (
      <BrowserRouter>
        <div style={styles.app}>
          <div style={styles.header}>
            <div style={{ ...styles.logo, cursor: 'pointer' }} onClick={goHome}>SOLACE</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: '#a3a3a3', fontSize: '0.85rem' }}>{activePage}</span>
              <button onClick={goHome} style={{ ...styles.navBtn, padding: '8px 16px', fontSize: '0.8rem' }}>← Dashboard</button>
            </div>
          </div>
          <PageErrorBoundary onBack={goHome}>
            <React.Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#a855f7' }}>Loading...</div>}>
              <PageComponent />
            </React.Suspense>
          </PageErrorBoundary>
        </div>
      </BrowserRouter>
    )
  }

  // Loading state
  if (loadingPage) {
    return (
      <div style={{ ...styles.app, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#a855f7' }}>Loading {activePage}...</p>
        </div>
      </div>
    )
  }

  // Page load error
  if (pageError) {
    return (
      <div style={{ ...styles.app, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{pageError}</p>
          <button onClick={goHome} style={{ ...styles.navBtn, display: 'inline-block' }}>← Back to Dashboard</button>
        </div>
      </div>
    )
  }

  // Main dashboard
  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.logo}>SOLACE</div>
        <div style={styles.userBadge}>👑 Owner: Justin Brett Hogan</div>
      </div>

      <div style={styles.main}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={styles.statCard}><div style={styles.statNum}>20</div><div style={styles.statLabel}>Specialists</div></div>
          <div style={styles.statCard}><div style={styles.statNum}>45</div><div style={styles.statLabel}>Total Pages</div></div>
          <div style={styles.statCard}><div style={{ ...styles.statNum, color: '#22c55e' }}>$0</div><div style={styles.statLabel}>Monthly Revenue</div></div>
          <div style={styles.statCard}><div style={{ ...styles.statNum, color: '#f59e0b' }}>1</div><div style={styles.statLabel}>Total Users</div></div>
        </div>

        {/* Specialists */}
        <h2 style={styles.sectionTitle}>AI Specialists</h2>
        <p style={styles.subtitle}>Your sovereign AI team - click any specialist to launch</p>
        <div style={styles.grid}>
          {specialists.map((s) => (
            <div key={s.name} style={styles.card}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
              onClick={() => navigateTo(s.name.replace(/\s+/g, ''))}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: '#e9d5ff' }}>{s.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* All Pages Navigation */}
        <h2 style={{ ...styles.sectionTitle, marginTop: '40px' }}>All Pages</h2>
        <p style={styles.subtitle}>Navigate to any page in the app</p>
        <div style={styles.navGrid}>
          {ownerPages.map((page) => (
            <div key={page} style={styles.navBtn}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.15)' }}
              onClick={() => navigateTo(page)}
            >
              {page.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<OwnerDashboard />)
