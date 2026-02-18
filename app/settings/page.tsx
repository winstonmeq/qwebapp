'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, ArrowLeft, Bell, Database, Globe, Lock, Palette, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'system-admin') {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'system-admin') {
    return null;
  }

  const settingsSections = [
    {
      title: 'General',
      icon: SettingsIcon,
      color: 'bg-blue-600',
      items: [
        { name: 'System Name', description: 'Emergency Management System' },
        { name: 'Language', description: 'English (US)' },
        { name: 'Timezone', description: 'Asia/Manila' },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      color: 'bg-yellow-600',
      items: [
        { name: 'Email Alerts', description: 'Enabled for critical emergencies' },
        { name: 'SMS Alerts', description: 'Disabled' },
        { name: 'Push Notifications', description: 'Enabled' },
      ]
    },
    {
      title: 'Database',
      icon: Database,
      color: 'bg-green-600',
      items: [
        { name: 'Connection', description: 'MongoDB Atlas' },
        { name: 'Auto-backup', description: 'Daily at 2:00 AM' },
        { name: 'Data Retention', description: '90 days' },
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      color: 'bg-red-600',
      items: [
        { name: 'Two-Factor Auth', description: 'Coming soon' },
        { name: 'Session Timeout', description: '30 days' },
        { name: 'Password Policy', description: 'Minimum 6 characters' },
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      color: 'bg-purple-600',
      items: [
        { name: 'Theme', description: 'Dark (Default)' },
        { name: 'Color Scheme', description: 'Blue/Purple gradient' },
        { name: 'Compact Mode', description: 'Disabled' },
      ]
    },
    {
      title: 'Performance',
      icon: Zap,
      color: 'bg-orange-600',
      items: [
        { name: 'Auto-refresh', description: 'Every 5 seconds' },
        { name: 'Map Caching', description: 'Enabled' },
        { name: 'Lazy Loading', description: 'Enabled' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="bg-gray-700 p-3 rounded-xl hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="text-white" size={24} />
              </Link>
              <div className="bg-blue-600 p-3 rounded-xl">
                <SettingsIcon className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  System Settings
                </h1>
                <p className="text-gray-400 text-sm">
                  Configure system preferences and options
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 bg-blue-600 bg-opacity-10 border border-blue-600 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <SettingsIcon className="text-blue-400 mt-0.5" size={20} />
            <div>
              <h3 className="text-blue-400 font-semibold mb-1">Settings Management</h3>
              <p className="text-sm text-gray-300">
                This is a placeholder page. Settings functionality will be implemented in future updates.
                Current values shown are defaults and cannot be modified yet.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className={`${section.color} px-6 py-4`}>
                  <div className="flex items-center gap-3">
                    <Icon className="text-white" size={24} />
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {section.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                      </div>
                      <button
                        disabled
                        className="px-3 py-1 bg-gray-700 text-gray-400 text-xs rounded cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* API Configuration Section */}
        <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">API Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <div>
                <p className="text-sm font-semibold text-white">API Endpoint</p>
                <p className="text-xs text-gray-400 mt-1">Base URL for API requests</p>
              </div>
              <code className="px-3 py-1 bg-gray-900 text-green-400 text-xs rounded font-mono">
                {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
              </code>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <div>
                <p className="text-sm font-semibold text-white">NextAuth URL</p>
                <p className="text-xs text-gray-400 mt-1">Authentication endpoint</p>
              </div>
              <code className="px-3 py-1 bg-gray-900 text-green-400 text-xs rounded font-mono">
                Configured
              </code>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-white">Database Connection</p>
                <p className="text-xs text-gray-400 mt-1">MongoDB Atlas status</p>
              </div>
              <span className="px-3 py-1 bg-green-600 text-white text-xs rounded font-semibold">
                Connected
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
