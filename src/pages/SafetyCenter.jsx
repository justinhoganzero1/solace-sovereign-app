import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import AnimatedOracle from '../components/oracle/AnimatedOracle';
import EmergencyWidget from '../components/safety/EmergencyWidget';
import EmergencyServicesWidget from '../components/safety/EmergencyServicesWidget';
import GhostFollowWidget from '../components/safety/GhostFollowWidget';
import SafeZoneManager from '../components/safety/SafeZoneManager';

export default function SafetyCenter() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(239,68,68,0.12)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#ef4444,#f97316,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Safety Center</div>
              <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>EMERGENCY • PROTECTION • GUARDIAN</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
            <span style={{ color: '#4ade80', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 600 }}>ACTIVE</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 120px' }}>
        <div className="grid md:grid-cols-2 gap-6">
          <EmergencyServicesWidget />
          <EmergencyWidget />
          <GhostFollowWidget />
          <SafeZoneManager />
        </div>
      </div>
    </div>
  );
}