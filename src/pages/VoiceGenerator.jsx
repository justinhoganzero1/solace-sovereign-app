import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Square, Loader2, Mic, Volume2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceSynthesis } from '../lib/voiceSynthesis';

const PARTY_ICONS = { robot: '🤖', chipmunk: '🐿️', monster: '👹', alien: '👽', echo: '🔊', whisper: '👻' };
const HUMAN_ICONS = { professional_male: '🎙️', professional_female: '🎙️', casual_male: '😎', casual_female: '💬', narrator_male: '📖', narrator_female: '📖' };

export default function VoiceGenerator() {
  const [text, setText] = useState('');
  const [voiceType, setVoiceType] = useState('professional_female');
  const [voiceCategory, setVoiceCategory] = useState('human');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState({ human: [], party: [] });
  const [oracleVoice, setOracleVoice] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const voices = voiceSynthesis.getAvailableVoices();
    setAvailableVoices(voices);
    // Load saved oracle voice
    try {
      const saved = localStorage.getItem('solace_oracle_voice');
      if (saved) setOracleVoice(JSON.parse(saved));
    } catch {}
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setIsPlaying(true);

    try {
      await voiceSynthesis.speak(text, voiceType, {
        volume: 1.0,
        onStart: () => {
          console.log('Voice playback started');
        }
      });
    } catch (error) {
      console.error('Voice generation error:', error);
    } finally {
      setIsGenerating(false);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    voiceSynthesis.stop();
    setIsPlaying(false);
    setIsGenerating(false);
  };

  const setAsOracleVoice = () => {
    const voiceConfig = {
      voiceType,
      voiceCategory,
      label: voiceSynthesis.getVoiceLabel(voiceType),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('solace_oracle_voice', JSON.stringify(voiceConfig));
    setOracleVoice(voiceConfig);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const sty = {
    page: { minHeight: '100vh', background: '#000', color: '#e2e8f0' },
    hdr: { padding: '16px 24px', borderBottom: '1px solid rgba(236,72,153,0.12)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 },
    panel: { background: 'rgba(6,6,16,0.85)', border: '1px solid rgba(236,72,153,0.08)', borderRadius: '18px', padding: '24px', marginBottom: '16px' },
    catBtn: (active, col) => ({ flex: 1, padding: '20px 16px', borderRadius: '16px', border: `2px solid ${active ? col + '80' : 'rgba(255,255,255,0.06)'}`, background: active ? col + '15' : 'rgba(6,6,16,0.6)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s', boxShadow: active ? `0 0 24px ${col}20` : 'none' }),
    voiceCard: (active) => ({ padding: '12px 14px', borderRadius: '12px', border: `1px solid ${active ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.05)'}`, background: active ? 'rgba(236,72,153,0.1)' : 'rgba(10,10,25,0.5)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }),
  };

  return (
    <div style={sty.page}>
      <div style={sty.hdr}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#ec4899,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Voice Studio</div>
              <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>SYNTHESIS ENGINE • 12 VOICES • WEB SPEECH API</div>
            </div>
          </div>
          {oracleVoice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', animation: 'neonPulse 2s infinite' }} />
              <span style={{ color: '#c4b5fd', fontSize: '0.7rem', fontFamily: 'monospace' }}>Oracle: {oracleVoice.label}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px 120px' }}>
        {/* Category selector */}
        <div style={sty.panel}>
          <div style={{ fontSize: '0.7rem', color: '#ec4899', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '14px' }}>VOICE ENGINE</div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={sty.catBtn(voiceCategory === 'human', '#ec4899')} onClick={() => { setVoiceCategory('human'); setVoiceType('professional_female'); }}>
              <Mic style={{ width: '28px', height: '28px', color: '#f472b6', margin: '0 auto 8px' }} />
              <div style={{ color: '#f9a8d4', fontWeight: 700, fontSize: '0.95rem' }}>Human Voices</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>Natural, professional</div>
            </div>
            <div style={sty.catBtn(voiceCategory === 'party', '#f59e0b')} onClick={() => { setVoiceCategory('party'); setVoiceType('robot'); }}>
              <Volume2 style={{ width: '28px', height: '28px', color: '#fbbf24', margin: '0 auto 8px' }} />
              <div style={{ color: '#fde68a', fontWeight: 700, fontSize: '0.95rem' }}>Party Voices</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>Robot, Alien, Monster</div>
            </div>
          </div>

          {/* Voice grid */}
          <div style={{ fontSize: '0.7rem', color: voiceCategory === 'party' ? '#f59e0b' : '#ec4899', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '10px' }}>
            {voiceCategory === 'human' ? 'SELECT HUMAN VOICE' : 'SELECT PARTY EFFECT'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginBottom: '20px' }}>
            {availableVoices[voiceCategory]?.map((voice) => {
              const icon = voiceCategory === 'party' ? PARTY_ICONS[voice] : HUMAN_ICONS[voice];
              const label = voiceSynthesis.getVoiceLabel(voice);
              const isOV = oracleVoice?.voiceType === voice;
              return (
                <div key={voice} style={sty.voiceCard(voiceType === voice)} onClick={() => setVoiceType(voice)}>
                  <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                  <div>
                    <div style={{ color: voiceType === voice ? '#f9a8d4' : '#e2e8f0', fontWeight: 600, fontSize: '0.82rem' }}>{label}</div>
                    {isOV && <div style={{ color: '#a855f7', fontSize: '0.6rem', fontFamily: 'monospace' }}>ORACLE VOICE</div>}
                  </div>
                  {voiceType === voice && <Check style={{ width: '14px', height: '14px', color: '#ec4899', marginLeft: 'auto' }} />}
                </div>
              );
            })}
          </div>

          {/* Text input */}
          <div style={{ fontSize: '0.7rem', color: '#ec4899', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '8px' }}>TEXT INPUT</div>
          <Textarea placeholder="Enter the text you want to convert to speech..." value={text} onChange={(e) => setText(e.target.value)}
            style={{ minHeight: '120px', background: 'rgba(6,6,15,0.9)', border: '1px solid rgba(236,72,153,0.12)', borderRadius: '14px', color: '#e2e8f0', padding: '14px', fontSize: '0.9rem', width: '100%', resize: 'vertical' }} />

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {!isPlaying ? (
              <button onClick={handleGenerate} disabled={!text.trim() || isGenerating}
                style={{ flex: 1, height: '52px', borderRadius: '14px', border: 'none', background: !text.trim() ? 'rgba(236,72,153,0.15)' : 'linear-gradient(135deg,#ec4899,#f59e0b)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: text.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: !text.trim() ? 0.4 : 1 }}>
                {isGenerating ? <><Loader2 style={{ width: '18px', height: '18px', animation: 'spinLoader 1s linear infinite' }} /> Generating...</> : <><Play style={{ width: '18px', height: '18px' }} /> Generate & Play</>}
              </button>
            ) : (
              <button onClick={handleStop}
                style={{ flex: 1, height: '52px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Square style={{ width: '18px', height: '18px' }} /> Stop
              </button>
            )}
          </div>

          {/* Oracle voice button */}
          <button onClick={setAsOracleVoice}
            style={{ width: '100%', height: '52px', borderRadius: '14px', marginTop: '10px', border: oracleVoice?.voiceType === voiceType ? '2px solid rgba(34,197,94,0.4)' : '1px solid rgba(245,158,11,0.2)', background: oracleVoice?.voiceType === voiceType ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.08)', color: oracleVoice?.voiceType === voiceType ? '#4ade80' : '#fbbf24', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {savedNotice ? <><Check size={18} /> Saved as Oracle Voice!</> : oracleVoice?.voiceType === voiceType ? <><Check size={18} /> Current Oracle Voice</> : <><Sparkles size={18} /> Set "{voiceSynthesis.getVoiceLabel(voiceType)}" as Oracle Voice</>}
          </button>
        </div>

        {/* Features */}
        <div style={{ ...sty.panel, borderColor: 'rgba(139,92,246,0.1)' }}>
          <div style={{ fontSize: '0.7rem', color: '#a855f7', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '12px' }}>CAPABILITIES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[['🎙️','12 unique voices','Human & party effects'],['⚡','Instant synthesis','Web Speech API native'],['🔮','Oracle integration','Set any voice for Oracle'],['🎭','Dramatic effects','Pitch, rate, character']].map(([i,t,d]) => (
              <div key={t} style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(10,10,25,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{i}</div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.8rem' }}>{t}</div>
                <div style={{ color: '#64748b', fontSize: '0.68rem' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
