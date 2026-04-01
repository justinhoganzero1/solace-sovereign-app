import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OracleBackground from '../components/OracleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Badge } from '@/components/ui/badge';

export default function Safety() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const safetyFeatures = [
    {
      icon: Shield,
      title: 'Content Filtering',
      description: 'Advanced AI-powered content filtering ensures age-appropriate interactions',
      status: profile?.safety_mode ? 'active' : 'inactive'
    },
    {
      icon: Lock,
      title: 'Privacy Protection',
      description: 'Your conversations are private and encrypted',
      status: 'active'
    },
    {
      icon: AlertTriangle,
      title: 'Risk Monitoring',
      description: 'Real-time monitoring for potentially harmful content',
      status: profile?.safety_mode ? 'active' : 'inactive'
    },
    {
      icon: CheckCircle,
      title: 'Age Verification',
      description: 'Age-appropriate content based on your profile settings',
      status: profile?.age_verified ? 'verified' : 'pending'
    }
  ];

  if (loading) {
    return (
      <OracleBackground gender={profile?.oracle_gender || 'female'}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </OracleBackground>
    );
  }

  return (
    <OracleBackground gender={profile?.oracle_gender || 'female'}>
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-white mb-6 hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-green-300/50 mb-6">
            <CardHeader>
              <CardTitle className="text-3xl text-green-900 flex items-center">
                <Shield className="w-8 h-8 mr-3" />
                Safety Guardian System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 mb-6">
                The Oracle Lunar Safety Guardian ensures a secure and appropriate experience for all users through advanced AI monitoring and protection systems.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {safetyFeatures.map((feature, idx) => (
                  <Card key={idx} className="border-2 border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <feature.icon className="w-10 h-10 text-green-600" />
                        <Badge
                          variant={feature.status === 'active' || feature.status === 'verified' ? 'default' : 'secondary'}
                          className={feature.status === 'active' || feature.status === 'verified' ? 'bg-green-600' : ''}
                        >
                          {feature.status}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">Oracle Monitoring Modes</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <span><strong>Observe:</strong> Passive monitoring of interactions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <span><strong>Advise:</strong> Proactive suggestions for better interactions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <span><strong>Warn:</strong> Alerts for potentially risky content</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <span><strong>Protect:</strong> Active intervention when necessary</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <Link to={createPageUrl('Settings')}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                    Configure Safety Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </OracleBackground>
  );
}