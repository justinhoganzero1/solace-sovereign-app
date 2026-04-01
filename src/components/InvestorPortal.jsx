/**
 * Investor Portal Component for Owner Dashboard
 * Share free trial access with investors
 * View investor applications and screening results
 */

import React, { useState, useEffect } from 'react';
import { investorScreeningAI } from '../lib/investorScreeningAI';
import { authSystem } from '../lib/authorizationSystem';
import gitStorage from '../lib/gitStorage';

export default function InvestorPortal() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [shareableLink, setShareableLink] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestorApplications();
    generateShareableLink();
  }, []);

  async function loadInvestorApplications() {
    try {
      const apps = await gitStorage.list('investor_applications');
      setApplications(apps.sort((a, b) => 
        new Date(b.sent_at) - new Date(a.sent_at)
      ));
      setLoading(false);
    } catch (error) {
      console.error('Error loading applications:', error);
      setLoading(false);
    }
  }

  function generateShareableLink() {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?investor_trial=true&ref=owner`;
    setShareableLink(link);
  }

  function copyShareableLink() {
    navigator.clipboard.writeText(shareableLink);
    alert('Shareable link copied! Investors who use this link will get free trial access.');
  }

  function getTierColor(tier) {
    switch (tier) {
      case 'Premium': return '#8b5cf6';
      case 'High Quality': return '#ec4899';
      case 'Qualified': return '#10b981';
      default: return '#6b7280';
    }
  }

  async function approveInvestor(app) {
    try {
      await gitStorage.update('investor_applications', app.id, {
        status: 'approved_by_owner',
        approved_at: new Date().toISOString()
      });
      
      alert(`Investor ${app.investor_name} approved!`);
      loadInvestorApplications();
    } catch (error) {
      console.error('Error approving investor:', error);
    }
  }

  async function rejectInvestor(app) {
    try {
      await gitStorage.update('investor_applications', app.id, {
        status: 'rejected',
        rejected_at: new Date().toISOString()
      });
      
      alert(`Investor ${app.investor_name} rejected.`);
      loadInvestorApplications();
    } catch (error) {
      console.error('Error rejecting investor:', error);
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading investor applications...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Investor Portal</h2>
        <p style={styles.subtitle}>Manage investor applications and share trial access</p>
      </div>

      {/* Shareable Link Section */}
      <div style={styles.shareSection}>
        <h3 style={styles.sectionTitle}>Share Free Trial Access</h3>
        <p style={styles.description}>
          Share this link with potential investors. They'll automatically receive free trial access when they sign up.
        </p>
        <div style={styles.linkContainer}>
          <input 
            type="text" 
            value={shareableLink} 
            readOnly 
            style={styles.linkInput}
          />
          <button onClick={copyShareableLink} style={styles.copyButton}>
            Copy Link
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div style={styles.applicationsSection}>
        <h3 style={styles.sectionTitle}>
          Investor Applications ({applications.length})
        </h3>

        {applications.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No investor applications yet.</p>
            <p style={styles.emptyHint}>
              Share your investor link or direct investors to the website's Investor section.
            </p>
          </div>
        ) : (
          <div style={styles.applicationsList}>
            {applications.map(app => (
              <div 
                key={app.id} 
                style={styles.applicationCard}
                onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.investorName}>{app.investor_name}</h4>
                    <p style={styles.companyName}>{app.company}</p>
                  </div>
                  <div style={styles.tierBadge(getTierColor(app.evaluation?.tier))}>
                    {app.evaluation?.tier || 'Pending'}
                  </div>
                </div>

                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>
                    💰 {app.investment_amount}
                  </span>
                  <span style={styles.metaItem}>
                    📊 Score: {app.score || 0}/{app.evaluation?.maxScore || 0}
                  </span>
                  <span style={styles.metaItem}>
                    📅 {new Date(app.sent_at).toLocaleDateString()}
                  </span>
                </div>

                {selectedApp?.id === app.id && (
                  <div style={styles.expandedDetails}>
                    <div style={styles.detailSection}>
                      <h5 style={styles.detailTitle}>Contact Information</h5>
                      <p><strong>Email:</strong> {app.investor_email}</p>
                      <p><strong>Phone:</strong> {app.answers?.phone || 'Not provided'}</p>
                      <p><strong>LinkedIn:</strong> {app.answers?.linkedin || 'Not provided'}</p>
                    </div>

                    <div style={styles.detailSection}>
                      <h5 style={styles.detailTitle}>Investment Profile</h5>
                      <p><strong>Type:</strong> {app.answers?.investor_type}</p>
                      <p><strong>Experience:</strong> {app.answers?.experience}</p>
                      <p><strong>Timeline:</strong> {app.answers?.investment_timeline}</p>
                      <p><strong>Interest Areas:</strong> {app.answers?.interest_area?.join(', ') || 'Not specified'}</p>
                    </div>

                    <div style={styles.detailSection}>
                      <h5 style={styles.detailTitle}>Investment Thesis</h5>
                      <p style={styles.thesis}>{app.answers?.additional_info}</p>
                    </div>

                    <div style={styles.detailSection}>
                      <h5 style={styles.detailTitle}>AI Evaluation</h5>
                      <p><strong>Recommendation:</strong> {app.evaluation?.recommendation}</p>
                      <p><strong>Insights:</strong> {app.evaluation?.aiInsights}</p>
                      <p><strong>Score:</strong> {app.evaluation?.percentage}%</p>
                    </div>

                    <div style={styles.actions}>
                      {app.status !== 'approved_by_owner' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); approveInvestor(app); }}
                          style={styles.approveButton}
                        >
                          ✓ Approve & Contact
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); rejectInvestor(app); }}
                          style={styles.rejectButton}
                        >
                          ✗ Reject
                        </button>
                      )}
                      <a 
                        href={`mailto:${app.investor_email}?subject=SOLACE Investment Opportunity`}
                        style={styles.emailButton}
                        onClick={(e) => e.stopPropagation()}
                      >
                        📧 Email Investor
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '16px',
    color: '#9ca3af'
  },
  shareSection: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px'
  },
  description: {
    color: '#9ca3af',
    marginBottom: '16px'
  },
  linkContainer: {
    display: 'flex',
    gap: '12px'
  },
  linkInput: {
    flex: 1,
    padding: '12px 16px',
    background: '#0f0f23',
    border: '1px solid #2a2a3e',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px'
  },
  copyButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  applicationsSection: {
    marginTop: '32px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '16px',
    color: '#9ca3af'
  },
  emptyHint: {
    marginTop: '8px',
    fontSize: '14px'
  },
  applicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  applicationCard: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  investorName: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  companyName: {
    color: '#9ca3af',
    fontSize: '14px'
  },
  tierBadge: (color) => ({
    padding: '6px 16px',
    background: color,
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff'
  }),
  cardMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#9ca3af'
  },
  metaItem: {
    display: 'inline-block'
  },
  expandedDetails: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #2a2a3e'
  },
  detailSection: {
    marginBottom: '20px'
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#8b5cf6'
  },
  thesis: {
    lineHeight: '1.6',
    color: '#d1d5db'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  approveButton: {
    padding: '10px 20px',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer'
  },
  rejectButton: {
    padding: '10px 20px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer'
  },
  emailButton: {
    padding: '10px 20px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    color: '#9ca3af'
  }
};
