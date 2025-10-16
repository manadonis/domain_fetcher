import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  GlobeAltIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DomainSearchBox from '../components/DomainSearchBox';
import UsageChart from '../components/UsageChart';
import RecentAnalyses from '../components/RecentAnalyses';
import QuickActions from '../components/QuickActions';

const Dashboard = () => {
  const { user, getUsageStats } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Get dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard'],
    async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const usageStats = getUsageStats();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const quickStats = [
    {
      name: 'Domains Analyzed',
      value: user?.usage?.totalAnalyses || 0,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Searches This Month',
      value: user?.usage?.monthlySearches || 0,
      icon: MagnifyingGlassIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Portfolio Value',
      value: '$0', // Would calculate from user's portfolio
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive',
    },
    {
      name: 'Top Domain Score',
      value: dashboardData?.topDomainScore || 0,
      icon: TrophyIcon,
      color: 'bg-yellow-500',
      change: '+3%',
      changeType: 'positive',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Domain Intelligence Platform</title>
        <meta name="description" content="Your domain analysis dashboard with insights and analytics" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Here's what's happening with your domains today.
            </p>
          </div>

          {/* Quick Search */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Domain Search
              </h2>
              <DomainSearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for domains, get instant analysis..."
                size="large"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm text-green-600 dark:text-green-400">
                    {stat.change}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Usage & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Usage Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monthly Usage
                  </h2>
                  <Link
                    to="/profile"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
                  >
                    View limits
                  </Link>
                </div>
                <UsageChart stats={usageStats} />
              </div>
            </div>

            {/* Plan Info */}
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Current Plan
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 capitalize">
                    {user?.plan || 'Free'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {user?.subscription?.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                  {user?.plan === 'free' && (
                    <Link
                      to="/pricing"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                      Upgrade Plan
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <QuickActions />
            </div>
          </div>

          {/* Recent Analyses & Trending */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Analyses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Analyses
                </h2>
                <Link
                  to="/portfolio"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
                >
                  View all
                </Link>
              </div>
              <RecentAnalyses />
            </div>

            {/* Trending Domains */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Trending This Week
                </h2>
                <Link
                  to="/marketplace"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
                >
                  Explore market
                </Link>
              </div>

              <div className="space-y-4">
                {[
                  { domain: 'aihealth.com', score: 9.2, trend: '+15%' },
                  { domain: 'cryptopay.io', score: 8.8, trend: '+12%' },
                  { domain: 'smartfin.co', score: 8.5, trend: '+8%' },
                  { domain: 'greentech.ai', score: 8.2, trend: '+6%' },
                ].map((item, index) => (
                  <div
                    key={item.domain}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-mono text-sm text-gray-900 dark:text-white">
                          {item.domain}
                        </div>
                        <div className="text-xs text-gray-500">Score: {item.score}/10</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-soft p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">AI-Powered Recommendations</h2>
                  <p className="text-blue-100">
                    Based on your search history and market trends, here are some domains you might be interested in.
                  </p>
                </div>
                <div className="hidden md:block">
                  <GlobeAltIcon className="h-16 w-16 text-blue-200" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { domain: 'aifin.com', reason: 'AI + Finance trending' },
                  { domain: 'smarthealth.io', reason: 'Health tech growing' },
                  { domain: 'greenai.co', reason: 'Sustainability focus' },
                ].map((rec) => (
                  <div
                    key={rec.domain}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <div className="font-mono text-lg font-semibold">{rec.domain}</div>
                    <div className="text-sm text-blue-100 mt-1">{rec.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;