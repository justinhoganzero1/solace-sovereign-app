import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { Brain, Clock } from 'lucide-react';

export default function ConversationMemoryWidget({ conversationId }) {
  const [context, setContext] = useState([]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (conversationId) {
      loadContext();
    }
  }, [conversationId]);

  const loadContext = async () => {
    try {
      const { data } = await base44.functions.invoke('contextMemory', {
        action: 'retrieve',
        conversationId
      });
      setContext(data.context || []);
      setSummary(data.summary || '');
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  };

  if (!conversationId || context.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 backdrop-blur-md border-2 border-blue-400/40">
      <CardHeader>
        <CardTitle className="text-blue-200 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Conversation Memory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary && (
          <div className="bg-blue-950/40 rounded-lg p-3 border border-blue-400/20">
            <p className="text-sm text-blue-200 font-semibold mb-1">Summary</p>
            <p className="text-white/80 text-sm">{summary}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs text-blue-300 font-semibold">Recent Context</p>
          {context.slice(-5).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <Clock className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" />
              <p className="text-white/70">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}