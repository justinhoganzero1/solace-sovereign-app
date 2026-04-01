import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RemindersWidget() {
  const [reminders, setReminders] = useState({ upcoming: [], overdue: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const { data } = await base44.functions.invoke('getReminders');
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reminders...</div>;

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Clock className="w-5 h-5" />
          Reminders ({reminders.total})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminders.overdue.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Overdue</h4>
            {reminders.overdue.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-100 rounded-lg border border-red-300 mb-2"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">{r.title}</p>
                    {r.description && <p className="text-sm text-red-700">{r.description}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {reminders.upcoming.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Upcoming</h4>
            {reminders.upcoming.slice(0, 3).map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-green-100 rounded-lg border border-green-300 mb-2"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">{r.title}</p>
                    <p className="text-sm text-green-700">
                      {new Date(r.scheduled_time).toLocaleString()}
                    </p>
                    {r.description && <p className="text-sm text-green-700">{r.description}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {reminders.total === 0 && (
          <p className="text-center text-gray-600 py-4">No reminders set</p>
        )}

        <Button
          onClick={loadReminders}
          variant="outline"
          className="w-full"
        >
          Refresh Reminders
        </Button>
      </CardContent>
    </Card>
  );
}