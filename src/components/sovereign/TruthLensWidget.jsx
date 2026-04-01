import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FuturisticCloud } from '../ui/futuristic-cloud';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Eye, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TruthLensWidget() {
  const [analyzing, setAnalyzing] = useState(false);
  const [contentText, setContentText] = useState('');
  const [result, setResult] = useState(null);

  const scanContent = async () => {
    if (!contentText.trim()) {
      toast.error('Enter content to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const { data } = await base44.functions.invoke('truthLens', {
        content_type: 'text',
        content_text: contentText
      });

      setResult(data);
      toast.success(`Truth Lens scan complete: ${data.shield_status}`);
    } catch (error) {
      toast.error('Truth Lens analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getOverlayColor = () => {
    if (!result) return 'cyan';
    return result.overlay_color || 'green';
  };

  return (
    <FuturisticCloud size="xl" glowColor={getOverlayColor()} className="mx-auto">
      <div className="text-center space-y-4 p-6">
        <motion.div
          animate={{ scale: result ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 1, repeat: result ? Infinity : 0 }}
        >
          <Eye className={`w-16 h-16 mx-auto ${result ? `text-${result.overlay_color}-400` : 'text-cyan-400'}`} />
        </motion.div>

        <h3 className="text-2xl font-bold text-white">Truth Lens</h3>
        <p className="text-sm text-gray-300">Anti-Deepfake Shield</p>

        {result ? (
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-300">Authenticity</span>
              <div className="flex items-center gap-2">
                {result.authenticity_score > 75 ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-lg font-bold text-white">{result.authenticity_score}%</span>
              </div>
            </div>

            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs font-bold text-gray-300 mb-2">Shield Status:</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                result.shield_status === 'VERIFIED' ? 'bg-green-900/50 text-green-300' :
                result.shield_status === 'CAUTION' ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-red-900/50 text-red-300'
              }`}>
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold">{result.shield_status}</span>
              </div>
            </div>

            {result.warnings?.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
                <p className="text-xs font-bold text-red-300 mb-2">⚠️ Warnings Detected:</p>
                <ul className="space-y-1">
                  {result.warnings.slice(0, 3).map((warning, i) => (
                    <li key={i} className="text-xs text-red-200">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm text-white">{result.oracle_recommendation}</p>

            <Button
              onClick={() => setResult(null)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Scan
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Paste message or content to scan..."
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              className="bg-gray-900/50 text-white border-cyan-500/30"
            />
            <Button
              onClick={scanContent}
              disabled={analyzing}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {analyzing ? 'Scanning...' : 'Activate Truth Lens'}
            </Button>
          </div>
        )}
      </div>
    </FuturisticCloud>
  );
}