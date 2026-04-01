import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Newspaper, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

export default function NewsWeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('getWeatherSummary', {
        location: 'your location'
      });
      setWeather(data.weather_summary);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('getNewsSummary', {
        topics: ['technology', 'science', 'world']
      });
      setNews(data.news_summary);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          📰 Daily Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weather" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weather">
              <Cloud className="w-4 h-4 mr-2" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="w-4 h-4 mr-2" />
              News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="space-y-4">
            {weather ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg p-4 border border-blue-200 whitespace-pre-wrap text-blue-900"
              >
                {weather}
              </motion.div>
            ) : (
              <p className="text-gray-600 text-center py-4">No weather data loaded</p>
            )}
            <Button
              onClick={loadWeather}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Get Weather'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            {news ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg p-4 border border-purple-200 whitespace-pre-wrap text-purple-900"
              >
                {news}
              </motion.div>
            ) : (
              <p className="text-gray-600 text-center py-4">No news data loaded</p>
            )}
            <Button
              onClick={loadNews}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Get News'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}