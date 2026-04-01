import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FuturisticCloud } from '../ui/futuristic-cloud';
import { Button } from '../ui/button';
import { Clock, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ChronosWidget() {
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const getPrediction = async (type) => {
    setPredicting(true);
    try {
      const { data } = await base44.functions.invoke('chronosPredict', {
        prediction_type: type,
        user_location: 'Current Location'
      });

      setPrediction(data);
      toast.success(`Chronos prediction generated: ${data.confidence} confidence`);
    } catch (error) {
      toast.error('Chronos analysis failed');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <FuturisticCloud size="xl" glowColor="purple" className="mx-auto">
      <div className="text-center space-y-4 p-6">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="w-16 h-16 text-purple-400 mx-auto" />
        </motion.div>

        <h3 className="text-2xl font-bold text-white">Chronos Defense</h3>
        <p className="text-sm text-gray-300">Predictive Life Analysis</p>

        {prediction ? (
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300">
                {prediction.confidence} Confidence
              </span>
            </div>
            <p className="text-sm text-white leading-relaxed">
              {prediction.chronos_says}
            </p>
            <div className="bg-purple-900/50 p-3 rounded-lg">
              <p className="text-xs text-purple-200 font-semibold mb-1">Recommended Action:</p>
              <p className="text-sm text-white">{prediction.recommended_action}</p>
            </div>
            <p className="text-xs text-gray-400">
              Sources: {prediction.sources_analyzed?.join(', ')}
            </p>
            <Button
              onClick={() => setPrediction(null)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Prediction
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => getPrediction('transit')}
              disabled={predicting}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Transit
            </Button>
            <Button
              onClick={() => getPrediction('route')}
              disabled={predicting}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Route
            </Button>
            <Button
              onClick={() => getPrediction('weather')}
              disabled={predicting}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Weather
            </Button>
            <Button
              onClick={() => getPrediction('crime')}
              disabled={predicting}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Safety
            </Button>
          </div>
        )}
      </div>
    </FuturisticCloud>
  );
}