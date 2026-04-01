import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Users, DollarSign, TrendingUp, Settings, Shield, Database, Key, Zap } from 'lucide-react';
import { authSystem, OWNER_EMAIL } from '../lib/authorizationSystem';
import { motion } from 'framer-motion';

export default function OwnerDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Verify owner access
      if (currentUser.email !== OWNER_EMAIL) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      await authSystem.initialize(currentUser);

      // Load owner statistics
      const statistics = await loadStatistics();
      setStats(statistics);

    } catch (error) {
      console.error('Error loading owner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get all users from local storage
      const allUsers = await base44.entities.UserProfile.list();
      const totalUsers = allUsers.length;

      // Local stats - will be populated as app grows
      return {
        totalUsers,
        activeSubscriptions: 0,
        trialUsers: 0,
        freeUsers: totalUsers,
        monthlyRevenue: 0,
        totalAppsGenerated: 0,
        totalMoviesGenerated: 0,
        conversionRate: 0
      };
    } catch (error) {
      console.error('Error loading statistics:', error);
      return {
        totalUsers: 1,
        activeSubscriptions: 0,
        trialUsers: 0,
        freeUsers: 1,
        monthlyRevenue: 0,
        totalAppsGenerated: 0,
        totalMoviesGenerated: 0,
        conversionRate: 0
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Owner Dashboard...</div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black flex items-center justify-center p-6">
        <Card className="bg-gray-900/80 border-red-500 max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-red-300 mb-6">This dashboard is only accessible to the app owner.</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-red-600 hover:bg-red-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              Owner Dashboard
            </h1>
            <p className="text-purple-300">Full system control and analytics</p>
          </div>
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to App
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-purple-300" />
                  <span className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</span>
                </div>
                <p className="text-purple-200 text-sm">Total Users</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-green-300" />
                  <span className="text-3xl font-bold text-white">${stats?.monthlyRevenue || 0}</span>
                </div>
                <p className="text-green-200 text-sm">Monthly Revenue</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-blue-300" />
                  <span className="text-3xl font-bold text-white">{stats?.conversionRate || 0}%</span>
                </div>
                <p className="text-blue-200 text-sm">Conversion Rate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 border-pink-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-pink-300" />
                  <span className="text-3xl font-bold text-white">{stats?.activeSubscriptions || 0}</span>
                </div>
                <p className="text-pink-200 text-sm">Active Subscriptions</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* User Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gray-900/80 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-900/30 rounded">
                  <span className="text-purple-200">Trial Users</span>
                  <span className="text-white font-bold">{stats?.trialUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-900/30 rounded">
                  <span className="text-blue-200">Free Users</span>
                  <span className="text-white font-bold">{stats?.freeUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-900/30 rounded">
                  <span className="text-green-200">Paid Subscribers</span>
                  <span className="text-white font-bold">{stats?.activeSubscriptions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-900/30 rounded">
                  <span className="text-purple-200">Apps Generated</span>
                  <span className="text-white font-bold">{stats?.totalAppsGenerated || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-pink-900/30 rounded">
                  <span className="text-pink-200">Movies Generated</span>
                  <span className="text-white font-bold">{stats?.totalMoviesGenerated || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Owner Actions */}
        <Card className="bg-gray-900/80 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">Owner Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to={createPageUrl('Inventor', { appFace: 'inventor', from: 'OwnerDashboard' })}>
                <Button className="w-full h-auto py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <div className="text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-bold">Build App Maker</div>
                    <div className="text-xs opacity-80">Owner Only</div>
                  </div>
                </Button>
              </Link>

              <Button className="w-full h-auto py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-bold">User Management</div>
                  <div className="text-xs opacity-80">View & Control Users</div>
                </div>
              </Button>

              <Button className="w-full h-auto py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-bold">Revenue Analytics</div>
                  <div className="text-xs opacity-80">Detailed Financials</div>
                </div>
              </Button>

              <Button className="w-full h-auto py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                <div className="text-center">
                  <Settings className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-bold">System Settings</div>
                  <div className="text-xs opacity-80">Configure App</div>
                </div>
              </Button>

              <Button className="w-full h-auto py-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-bold">Security Controls</div>
                  <div className="text-xs opacity-80">Manage Access</div>
                </div>
              </Button>

              <Button className="w-full h-auto py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <div className="text-center">
                  <Database className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-bold">Database Access</div>
                  <div className="text-xs opacity-80">Direct DB Control</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-red-900/20 border-red-500 mt-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-300 font-bold mb-1">Owner Privileges Active</h3>
                <p className="text-red-200 text-sm">
                  You have full system access. Users cannot build app makers, clone SOLACE, or access this dashboard.
                  All security controls are enforced.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
