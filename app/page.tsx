'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import EmergencyMap from '@/components/EmergencyMap';
import EmergencyList from '@/components/EmergencyList';
import StatsDashboard from '@/components/StatsDashboard';
import { Emergency, User } from '@/types';
import { Bell, RefreshCw, MapIcon, List, LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'map' | 'list'>('map');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchEmergencies = useCallback(async () => {
    try {
      const response = await fetch('/api/emergencies');
      const result = await response.json();
      if (result.success) {
        setEmergencies(result.data);
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/location?active=true');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchEmergencies(), fetchUsers()]);
    setLoading(false);
  }, [fetchEmergencies, fetchUsers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchEmergencies();
      fetchUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchEmergencies, fetchUsers]);

  const handleUpdateStatus = async (emergencyId: string, status: Emergency['status']) => {
    try {
      const response = await fetch(`/api/emergencies/${emergencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchEmergencies();
      }
    } catch (error) {
      console.error('Error updating emergency:', error);
    }
  };

  const pendingCount = emergencies.filter(e => e.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-xl">
                <Bell className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Emergency Management System
                </h1>
                <p className="text-gray-400 text-sm">Real-time emergency response and tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {session?.user?.role === 'admin' ? (
                    <Shield className="text-yellow-400" size={20} />
                  ) : (
                    <UserIcon className="text-white" size={20} />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{session?.user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{session?.user?.role}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{session?.user?.name}</p>
                      <p className="text-xs text-gray-600">{session?.user?.email}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  autoRefresh
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <RefreshCw className={`inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} size={16} />
                Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>

              {pendingCount > 0 && (
                <div className="relative">
                  <Bell className="text-yellow-500 animate-pulse-fast" size={32} />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {pendingCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-white text-xl">Loading dashboard...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics Dashboard */}
            <StatsDashboard emergencies={emergencies} users={users} />

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-gray-800 p-2 rounded-xl w-fit">
              <button
                onClick={() => setSelectedTab('map')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedTab === 'map'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <MapIcon size={20} />
                Map View
              </button>
              <button
                onClick={() => setSelectedTab('list')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedTab === 'list'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <List size={20} />
                List View
              </button>
            </div>

            {/* Content Area */}
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {selectedTab === 'map' ? (
                <div className="h-[600px]">
                  <EmergencyMap emergencies={emergencies} users={users} />
                </div>
              ) : (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Active Emergencies</h2>
                  <EmergencyList
                    emergencies={emergencies}
                    onUpdateStatus={handleUpdateStatus}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
