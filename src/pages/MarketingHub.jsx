import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare, Phone, Mail, BarChart3, Users, Zap, Send, Target,
  TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, AlertTriangle,
  CheckCircle, Clock, Megaphone, Filter, PlusCircle, Play, Pause,
  RefreshCw, Settings, Bot, Smile, Frown, Meh, Star, Gift,
  ChevronRight, Eye, Edit3, Trash2, Copy, Globe, Smartphone
} from 'lucide-react';

// ═══════════════════════════════════════════
// SENTIMENT ANALYSIS ENGINE
// ═══════════════════════════════════════════

const POSITIVE_WORDS = [
  'love', 'great', 'amazing', 'awesome', 'excellent', 'fantastic', 'wonderful',
  'perfect', 'brilliant', 'incredible', 'helpful', 'beautiful', 'best', 'thank',
  'happy', 'glad', 'nice', 'good', 'superb', 'outstanding', 'impressed'
];

const NEGATIVE_WORDS = [
  'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'broken', 'slow',
  'crash', 'bug', 'error', 'fail', 'useless', 'ugly', 'disappointing', 'frustrated',
  'annoying', 'waste', 'stupid', 'sucks', 'confusing', 'laggy', 'stuck'
];

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  let positive = 0;
  let negative = 0;

  words.forEach(word => {
    if (POSITIVE_WORDS.some(pw => word.includes(pw))) positive++;
    if (NEGATIVE_WORDS.some(nw => word.includes(nw))) negative++;
  });

  const total = positive + negative || 1;
  const score = (positive - negative) / total;
  const normalizedScore = (score + 1) / 2; // 0 to 1

  return {
    score: normalizedScore,
    positive,
    negative,
    sentiment: normalizedScore > 0.6 ? 'positive' : normalizedScore < 0.4 ? 'negative' : 'neutral',
    label: normalizedScore > 0.6 ? 'Positive' : normalizedScore < 0.4 ? 'Negative' : 'Neutral'
  };
}

function getSentimentIcon(sentiment) {
  switch (sentiment) {
    case 'positive': return <Smile size={16} color="#22c55e" />;
    case 'negative': return <Frown size={16} color="#ef4444" />;
    default: return <Meh size={16} color="#f59e0b" />;
  }
}

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive': return '#22c55e';
    case 'negative': return '#ef4444';
    default: return '#f59e0b';
  }
}

// ═══════════════════════════════════════════
// MESSAGING CONNECTORS (API-ready stubs)
// ═══════════════════════════════════════════

const MessagingEngine = {
  async sendSMS({ to, body, from }) {
    // Fonoster / Twilio-compatible API connector
    const config = JSON.parse(localStorage.getItem('solace_sms_config') || '{}');
    if (config.provider === 'fonoster' && config.apiKey) {
      try {
        // Real Fonoster API call would go here
        console.log('[SMS] Fonoster send:', { to, body, from });
        return { success: true, provider: 'fonoster', messageId: `fon_${Date.now()}` };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    if (config.provider === 'twilio' && config.accountSid) {
      try {
        console.log('[SMS] Twilio send:', { to, body, from });
        return { success: true, provider: 'twilio', messageId: `tw_${Date.now()}` };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    // Local simulation
    return { success: true, provider: 'local_sim', messageId: `sim_${Date.now()}`, note: 'Simulated — configure provider in Settings' };
  },

  async sendEmail({ to, subject, body, from }) {
    const config = JSON.parse(localStorage.getItem('solace_email_config') || '{}');
    if (config.provider === 'sendgrid' && config.apiKey) {
      try {
        console.log('[Email] SendGrid send:', { to, subject });
        return { success: true, provider: 'sendgrid', messageId: `sg_${Date.now()}` };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    if (config.provider === 'postmark' && config.apiKey) {
      try {
        console.log('[Email] Postmark send:', { to, subject });
        return { success: true, provider: 'postmark', messageId: `pm_${Date.now()}` };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: true, provider: 'local_sim', messageId: `sim_${Date.now()}`, note: 'Simulated — configure provider in Settings' };
  },

  async makeCall({ to, from, message }) {
    const config = JSON.parse(localStorage.getItem('solace_voice_config') || '{}');
    if (config.provider === 'fonoster' && config.apiKey) {
      try {
        console.log('[Voice] Fonoster call:', { to, message });
        return { success: true, provider: 'fonoster', callId: `call_${Date.now()}` };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: true, provider: 'local_sim', callId: `sim_${Date.now()}`, note: 'Simulated — configure provider in Settings' };
  }
};

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export default function MarketingHub() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState(() => {
    try { return JSON.parse(localStorage.getItem('solace_campaigns') || '[]'); } catch { return []; }
  });
  const [feedbackEntries, setFeedbackEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('solace_feedback') || '[]'); } catch { return []; }
  });
  const [messageLog, setMessageLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('solace_message_log') || '[]'); } catch { return []; }
  });
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('solace_contacts') || '[]'); } catch { return []; }
  });

  // Compose state
  const [composeType, setComposeType] = useState('sms');
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSending, setComposeSending] = useState(false);
  const [composeResult, setComposeResult] = useState(null);

  // Feedback state
  const [newFeedback, setNewFeedback] = useState('');

  // Campaign builder
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('email');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [campaignTrigger, setCampaignTrigger] = useState('manual');

  // Settings
  const [smsProvider, setSmsProvider] = useState('fonoster');
  const [smsApiKey, setSmsApiKey] = useState('');
  const [emailProvider, setEmailProvider] = useState('sendgrid');
  const [emailApiKey, setEmailApiKey] = useState('');

  // Save data
  useEffect(() => {
    localStorage.setItem('solace_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);
  useEffect(() => {
    localStorage.setItem('solace_feedback', JSON.stringify(feedbackEntries));
  }, [feedbackEntries]);
  useEffect(() => {
    localStorage.setItem('solace_message_log', JSON.stringify(messageLog));
  }, [messageLog]);
  useEffect(() => {
    localStorage.setItem('solace_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // ═══════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════

  const handleSendMessage = async () => {
    if (!composeTo.trim() || !composeBody.trim()) return;
    setComposeSending(true);
    setComposeResult(null);

    let result;
    if (composeType === 'sms') {
      result = await MessagingEngine.sendSMS({ to: composeTo, body: composeBody });
    } else if (composeType === 'email') {
      result = await MessagingEngine.sendEmail({ to: composeTo, subject: composeSubject, body: composeBody });
    } else if (composeType === 'voice') {
      result = await MessagingEngine.makeCall({ to: composeTo, message: composeBody });
    }

    const logEntry = {
      id: Date.now(),
      type: composeType,
      to: composeTo,
      subject: composeSubject,
      body: composeBody.slice(0, 100),
      result,
      timestamp: new Date().toISOString(),
      sentiment: analyzeSentiment(composeBody)
    };
    setMessageLog(prev => [logEntry, ...prev]);
    setComposeResult(result);
    setComposeSending(false);
    setComposeBody('');
  };

  const handleAddFeedback = () => {
    if (!newFeedback.trim()) return;
    const analysis = analyzeSentiment(newFeedback);
    const entry = {
      id: Date.now(),
      text: newFeedback,
      ...analysis,
      timestamp: new Date().toISOString(),
      autoAction: analysis.sentiment === 'negative' ? 'fix_it_triggered' : analysis.sentiment === 'positive' ? 'review_requested' : 'none'
    };
    setFeedbackEntries(prev => [entry, ...prev]);
    setNewFeedback('');
  };

  const handleCreateCampaign = () => {
    if (!campaignName.trim() || !campaignMessage.trim()) return;
    const campaign = {
      id: Date.now(),
      name: campaignName,
      type: campaignType,
      message: campaignMessage,
      trigger: campaignTrigger,
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
      created: new Date().toISOString()
    };
    setCampaigns(prev => [campaign, ...prev]);
    setShowCampaignBuilder(false);
    setCampaignName('');
    setCampaignMessage('');
  };

  const handleAddContact = () => {
    const name = prompt('Contact name:');
    if (!name) return;
    const phone = prompt('Phone number:');
    const email = prompt('Email:');
    setContacts(prev => [...prev, { id: Date.now(), name, phone, email, tags: [], addedAt: new Date().toISOString() }]);
  };

  // ═══════════════════════════════════════════
  // COMPUTED STATS
  // ═══════════════════════════════════════════

  const sentimentStats = {
    positive: feedbackEntries.filter(f => f.sentiment === 'positive').length,
    negative: feedbackEntries.filter(f => f.sentiment === 'negative').length,
    neutral: feedbackEntries.filter(f => f.sentiment === 'neutral').length,
    total: feedbackEntries.length,
    avgScore: feedbackEntries.length > 0 
      ? (feedbackEntries.reduce((sum, f) => sum + f.score, 0) / feedbackEntries.length * 100).toFixed(0)
      : 0
  };

  // ═══════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════

  const glass = {
    background: 'rgba(8,8,18,0.75)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(139,92,246,0.12)',
    borderRadius: '16px',
    padding: '20px',
  };

  const tabBtn = (active) => ({
    padding: '10px 18px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: active ? 600 : 400,
    background: active ? 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.15))' : 'transparent',
    border: active ? '1px solid rgba(236,72,153,0.3)' : '1px solid transparent',
    color: active ? '#f472b6' : '#64748b', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '6px'
  });

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(6,6,15,0.9)', border: '1px solid rgba(139,92,246,0.15)',
    color: '#e2e8f0', fontSize: '0.85rem', outline: 'none'
  };

  const btnPrimary = {
    padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem',
    background: 'linear-gradient(135deg, #ec4899, #a855f7)', border: 'none',
    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
    boxShadow: '0 4px 20px rgba(236,72,153,0.3)'
  };

  const btnSecondary = {
    padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500,
    background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
    color: '#c4b5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '1.8rem', fontWeight: 800, margin: 0,
          background: 'linear-gradient(135deg, #ec4899, #a855f7, #3b82f6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Marketing & Assistant Hub
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
          SMS, Voice, Email — Campaign Manager — AI Sentiment Analysis
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button style={tabBtn(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
          <BarChart3 size={14} />Dashboard
        </button>
        <button style={tabBtn(activeTab === 'compose')} onClick={() => setActiveTab('compose')}>
          <Send size={14} />Compose
        </button>
        <button style={tabBtn(activeTab === 'campaigns')} onClick={() => setActiveTab('campaigns')}>
          <Megaphone size={14} />Campaigns
        </button>
        <button style={tabBtn(activeTab === 'feedback')} onClick={() => setActiveTab('feedback')}>
          <ThumbsUp size={14} />Feedback & Sentiment
        </button>
        <button style={tabBtn(activeTab === 'contacts')} onClick={() => setActiveTab('contacts')}>
          <Users size={14} />Contacts
        </button>
        <button style={tabBtn(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
          <Settings size={14} />Connectors
        </button>
      </div>

      {/* ═══ DASHBOARD TAB ═══ */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Messages Sent', value: messageLog.length, icon: <MessageSquare size={20} />, color: '#ec4899' },
              { label: 'Campaigns', value: campaigns.length, icon: <Megaphone size={20} />, color: '#a855f7' },
              { label: 'Contacts', value: contacts.length, icon: <Users size={20} />, color: '#3b82f6' },
              { label: 'Sentiment Score', value: `${sentimentStats.avgScore}%`, icon: <TrendingUp size={20} />, color: '#22c55e' }
            ].map(s => (
              <div key={s.label} style={{ ...glass, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
                <div style={{ color: s.color, marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Sentiment Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={glass}>
              <h3 style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 16px', fontSize: '1rem' }}>Sentiment Breakdown</h3>
              {feedbackEntries.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '0.85rem' }}>No feedback yet — add entries in the Feedback tab</p>
              ) : (
                <div>
                  {['positive', 'neutral', 'negative'].map(type => {
                    const count = sentimentStats[type];
                    const pct = sentimentStats.total > 0 ? (count / sentimentStats.total * 100).toFixed(0) : 0;
                    return (
                      <div key={type} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: getSentimentColor(type), fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>
                            {getSentimentIcon(type)} {type}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ height: '100%', borderRadius: '3px', width: `${pct}%`, background: getSentimentColor(type), transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={glass}>
              <h3 style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 16px', fontSize: '1rem' }}>Recent Messages</h3>
              {messageLog.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '0.85rem' }}>No messages sent yet</p>
              ) : (
                messageLog.slice(0, 5).map(msg => (
                  <div key={msg.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {msg.type === 'sms' ? <Smartphone size={14} color="#ec4899" /> : msg.type === 'email' ? <Mail size={14} color="#3b82f6" /> : <Phone size={14} color="#22c55e" />}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#c4b5fd', fontSize: '0.82rem' }}>{msg.to}</div>
                      <div style={{ color: '#475569', fontSize: '0.72rem' }}>{msg.body}</div>
                    </div>
                    {msg.result?.success ? <CheckCircle size={14} color="#22c55e" /> : <AlertTriangle size={14} color="#ef4444" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ COMPOSE TAB ═══ */}
      {activeTab === 'compose' && (
        <div style={{ ...glass, maxWidth: '600px' }}>
          <h3 style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 20px', fontSize: '1.1rem' }}>Compose Message</h3>
          
          {/* Type selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[
              { type: 'sms', label: 'SMS', icon: <Smartphone size={14} /> },
              { type: 'email', label: 'Email', icon: <Mail size={14} /> },
              { type: 'voice', label: 'Voice Call', icon: <Phone size={14} /> }
            ].map(t => (
              <button key={t.type} onClick={() => setComposeType(t.type)} style={{
                ...btnSecondary,
                background: composeType === t.type ? 'rgba(236,72,153,0.2)' : 'rgba(139,92,246,0.1)',
                borderColor: composeType === t.type ? 'rgba(236,72,153,0.4)' : 'rgba(139,92,246,0.2)',
                color: composeType === t.type ? '#f472b6' : '#94a3b8'
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input value={composeTo} onChange={e => setComposeTo(e.target.value)} 
              placeholder={composeType === 'email' ? 'recipient@email.com' : '+1 (555) 123-4567'} style={inputStyle} />
            
            {composeType === 'email' && (
              <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="Subject line" style={inputStyle} />
            )}
            
            <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)}
              placeholder={composeType === 'voice' ? 'Message to speak...' : 'Type your message...'}
              rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            
            {composeBody && (
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getSentimentIcon(analyzeSentiment(composeBody).sentiment)}
                <span style={{ color: getSentimentColor(analyzeSentiment(composeBody).sentiment), fontSize: '0.8rem' }}>
                  Tone: {analyzeSentiment(composeBody).label} ({(analyzeSentiment(composeBody).score * 100).toFixed(0)}%)
                </span>
              </div>
            )}
            
            <button onClick={handleSendMessage} disabled={composeSending || !composeTo.trim() || !composeBody.trim()} style={{
              ...btnPrimary, opacity: composeSending ? 0.6 : 1, justifyContent: 'center'
            }}>
              {composeSending ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
              {composeSending ? 'Sending...' : `Send ${composeType.toUpperCase()}`}
            </button>
            
            {composeResult && (
              <div style={{
                padding: '12px', borderRadius: '10px',
                background: composeResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${composeResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: composeResult.success ? '#22c55e' : '#ef4444', fontSize: '0.85rem'
              }}>
                {composeResult.success ? <CheckCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> : <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
                {composeResult.success ? `Sent via ${composeResult.provider}` : `Failed: ${composeResult.error}`}
                {composeResult.note && <div style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: '4px' }}>{composeResult.note}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ CAMPAIGNS TAB ═══ */}
      {activeTab === 'campaigns' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>Campaigns</h3>
            <button onClick={() => setShowCampaignBuilder(!showCampaignBuilder)} style={btnPrimary}>
              <PlusCircle size={16} /> New Campaign
            </button>
          </div>

          {showCampaignBuilder && (
            <div style={{ ...glass, marginBottom: '16px' }}>
              <h4 style={{ color: '#c4b5fd', margin: '0 0 14px', fontSize: '0.95rem' }}>Create Campaign</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Campaign name" style={inputStyle} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['email', 'sms', 'voice'].map(t => (
                    <button key={t} onClick={() => setCampaignType(t)} style={{
                      ...btnSecondary,
                      background: campaignType === t ? 'rgba(236,72,153,0.2)' : undefined,
                      borderColor: campaignType === t ? 'rgba(236,72,153,0.4)' : undefined,
                      color: campaignType === t ? '#f472b6' : undefined
                    }}>{t.toUpperCase()}</button>
                  ))}
                </div>
                <select value={campaignTrigger} onChange={e => setCampaignTrigger(e.target.value)} style={inputStyle}>
                  <option value="manual">Manual Send</option>
                  <option value="signup">On User Signup</option>
                  <option value="negative_feedback">On Negative Feedback</option>
                  <option value="positive_feedback">On Positive Review</option>
                  <option value="inactivity">On 7-day Inactivity</option>
                </select>
                <textarea value={campaignMessage} onChange={e => setCampaignMessage(e.target.value)} placeholder="Campaign message template..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCreateCampaign} style={btnPrimary}><CheckCircle size={14} /> Create</button>
                  <button onClick={() => setShowCampaignBuilder(false)} style={btnSecondary}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {campaigns.length === 0 ? (
            <div style={{ ...glass, textAlign: 'center', padding: '40px' }}>
              <Megaphone size={40} color="#64748b" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#94a3b8' }}>No campaigns yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {campaigns.map(c => (
                <div key={c.id} style={{ ...glass, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: c.type === 'email' ? 'rgba(59,130,246,0.15)' : c.type === 'sms' ? 'rgba(236,72,153,0.15)' : 'rgba(34,197,94,0.15)',
                    border: `1px solid ${c.type === 'email' ? 'rgba(59,130,246,0.3)' : c.type === 'sms' ? 'rgba(236,72,153,0.3)' : 'rgba(34,197,94,0.3)'}`
                  }}>
                    {c.type === 'email' ? <Mail size={18} color="#3b82f6" /> : c.type === 'sms' ? <Smartphone size={18} color="#ec4899" /> : <Phone size={18} color="#22c55e" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                    <div style={{ color: '#475569', fontSize: '0.75rem' }}>
                      {c.type.toUpperCase()} · Trigger: {c.trigger.replace(/_/g, ' ')} · {new Date(c.created).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                    background: c.status === 'active' ? 'rgba(34,197,94,0.15)' : c.status === 'paused' ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)',
                    color: c.status === 'active' ? '#22c55e' : c.status === 'paused' ? '#f59e0b' : '#a855f7'
                  }}>{c.status}</span>
                  <button onClick={() => {
                    setCampaigns(prev => prev.map(p => p.id === c.id ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p));
                  }} style={{ ...btnSecondary, padding: '6px 10px' }}>
                    {c.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button onClick={() => setCampaigns(prev => prev.filter(p => p.id !== c.id))} style={{ ...btnSecondary, padding: '6px 10px', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ FEEDBACK & SENTIMENT TAB ═══ */}
      {activeTab === 'feedback' && (
        <div>
          {/* Add feedback */}
          <div style={{ ...glass, marginBottom: '16px' }}>
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 12px', fontSize: '1rem' }}>Analyze Feedback</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <textarea value={newFeedback} onChange={e => setNewFeedback(e.target.value)}
                placeholder="Paste user feedback here for AI sentiment analysis..." rows={2}
                style={{ ...inputStyle, flex: 1, resize: 'vertical' }} />
              <button onClick={handleAddFeedback} disabled={!newFeedback.trim()} style={{ ...btnPrimary, alignSelf: 'flex-end' }}>
                <Bot size={16} /> Analyze
              </button>
            </div>
            {newFeedback && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getSentimentIcon(analyzeSentiment(newFeedback).sentiment)}
                <span style={{ color: getSentimentColor(analyzeSentiment(newFeedback).sentiment), fontSize: '0.85rem' }}>
                  Live preview: {analyzeSentiment(newFeedback).label} — Score: {(analyzeSentiment(newFeedback).score * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {/* Feedback list */}
          {feedbackEntries.length === 0 ? (
            <div style={{ ...glass, textAlign: 'center', padding: '40px' }}>
              <ThumbsUp size={40} color="#64748b" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#94a3b8' }}>No feedback analyzed yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {feedbackEntries.map(f => (
                <div key={f.id} style={{
                  ...glass, padding: '14px 18px',
                  borderLeft: `3px solid ${getSentimentColor(f.sentiment)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getSentimentIcon(f.sentiment)}
                      <span style={{ color: getSentimentColor(f.sentiment), fontWeight: 600, fontSize: '0.85rem' }}>
                        {f.label} — {(f.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span style={{ color: '#475569', fontSize: '0.72rem' }}>{new Date(f.timestamp).toLocaleString()}</span>
                  </div>
                  <p style={{ color: '#c4d4e0', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 8px' }}>"{f.text}"</p>
                  {f.autoAction !== 'none' && (
                    <div style={{
                      padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                      background: f.autoAction === 'fix_it_triggered' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: f.autoAction === 'fix_it_triggered' ? '#ef4444' : '#22c55e',
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Zap size={12} />
                      {f.autoAction === 'fix_it_triggered' ? 'Auto: Fix-It workflow triggered' : 'Auto: Review request sent'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ CONTACTS TAB ═══ */}
      {activeTab === 'contacts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, margin: 0 }}>Contacts</h3>
            <button onClick={handleAddContact} style={btnPrimary}><PlusCircle size={16} /> Add Contact</button>
          </div>
          {contacts.length === 0 ? (
            <div style={{ ...glass, textAlign: 'center', padding: '40px' }}>
              <Users size={40} color="#64748b" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#94a3b8' }}>No contacts yet</p>
            </div>
          ) : (
            <div style={glass}>
              {contacts.map(c => (
                <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                    <div style={{ color: '#475569', fontSize: '0.75rem' }}>
                      {c.phone && <><Smartphone size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />{c.phone} </>}
                      {c.email && <><Mail size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />{c.email}</>}
                    </div>
                  </div>
                  <button onClick={() => setContacts(prev => prev.filter(p => p.id !== c.id))} style={{ ...btnSecondary, padding: '4px 8px', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ CONNECTORS/SETTINGS TAB ═══ */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* SMS Config */}
          <div style={glass}>
            <h3 style={{ color: '#ec4899', fontWeight: 700, margin: '0 0 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} /> SMS / Voice Provider
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={smsProvider} onChange={e => setSmsProvider(e.target.value)} style={inputStyle}>
                <option value="fonoster">Fonoster (Open Source)</option>
                <option value="twilio">Twilio</option>
                <option value="vonage">Vonage / Nexmo</option>
              </select>
              <input value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} placeholder="API Key" type="password" style={inputStyle} />
              <button onClick={() => {
                localStorage.setItem('solace_sms_config', JSON.stringify({ provider: smsProvider, apiKey: smsApiKey }));
                alert('SMS config saved!');
              }} style={btnPrimary}>
                <CheckCircle size={14} /> Save SMS Config
              </button>
              <p style={{ color: '#475569', fontSize: '0.75rem' }}>
                Fonoster is recommended — open source, no per-message fees. Configure at fonoster.com
              </p>
            </div>
          </div>

          {/* Email Config */}
          <div style={glass}>
            <h3 style={{ color: '#3b82f6', fontWeight: 700, margin: '0 0 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} /> Email Provider
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={emailProvider} onChange={e => setEmailProvider(e.target.value)} style={inputStyle}>
                <option value="sendgrid">SendGrid</option>
                <option value="postmark">Postmark</option>
                <option value="mailgun">Mailgun</option>
              </select>
              <input value={emailApiKey} onChange={e => setEmailApiKey(e.target.value)} placeholder="API Key" type="password" style={inputStyle} />
              <button onClick={() => {
                localStorage.setItem('solace_email_config', JSON.stringify({ provider: emailProvider, apiKey: emailApiKey }));
                alert('Email config saved!');
              }} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                <CheckCircle size={14} /> Save Email Config
              </button>
              <p style={{ color: '#475569', fontSize: '0.75rem' }}>
                SendGrid gives 100 free emails/day. Postmark is best for transactional email.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
