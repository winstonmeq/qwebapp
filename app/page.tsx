'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Emergency, User } from '@/types';
import { Bell, RefreshCw, LogOut, User as UserIcon, Shield } from 'lucide-react';
import NavigationMenu from '@/components/NavigationMenu';
import EmergencyManagement from '@/components/EmergencyManagement';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Firebase alert state
  const [newIncidentAlert, setNewIncidentAlert] = useState(false);
  const [lastIncidentType, setLastIncidentType] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isFirstLoad = useRef(true);
  const lastIncidentIdRef = useRef<string | null>(null);

  // Audio state
  const alertSoundRef = useRef<HTMLAudioElement | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // ─── Initialize Audio ───────────────────────────────────────────────────────
  useEffect(() => {
    // Create audio object immediately
    const audio = new Audio('/sounds/alert.wav');
    audio.volume = 1.0;
    audio.preload = 'auto';
    alertSoundRef.current = audio;
  }, []);

  // Function to "Prime" audio on first click
  const handleInteraction = () => {
    if (alertSoundRef.current && !userInteracted) {
      alertSoundRef.current.play()
        .then(() => {
          alertSoundRef.current?.pause();
          alertSoundRef.current!.currentTime = 0;
          setUserInteracted(true);
          console.log("🔊 Audio Unlocked");
        })
        .catch(e => console.log("Interaction required to unlock audio"));
    }
  };

  // ─── Fetch Functions ────────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchEmergencies().then(() => setLoading(false));
  }, [fetchEmergencies]);

  // ─── Firebase Real-time Listener ────────────────────────────────────────────
  useEffect(() => {
    const userLguCode = session?.user?.lguCode;
    if (!userLguCode && session?.user?.role !== 'system-admin') return;

    const targetLgu = userLguCode || 'all';
    const notifRef = doc(db, 'notifications', targetLgu);

    const unsubscribe = onSnapshot(notifRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const currentId = data.id || data.incidentId || JSON.stringify(data);

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        lastIncidentIdRef.current = currentId;
        return;
      }

      if (currentId !== lastIncidentIdRef.current) {
        lastIncidentIdRef.current = currentId;
        setLastIncidentType(data?.type || 'Emergency');
        setNewIncidentAlert(true);
        setRefreshTrigger((prev) => prev + 1);
        fetchEmergencies();

        // Play sound if user has clicked at least once
        if (alertSoundRef.current && userInteracted) {
          alertSoundRef.current.currentTime = 0;
          alertSoundRef.current.play().catch(err => console.error("Audio Play Error:", err));
        }
      }

      setTimeout(() => setNewIncidentAlert(false), 6000);
    });

    return () => unsubscribe();
  }, [session, fetchEmergencies, userInteracted]);

  const pendingCount = emergencies.filter((e) => e.status === 'pending').length;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      {/* ── Invisible Interaction Shield ── */}
      {/* This disappears after the first click, unlocking audio automatically */}
      {!userInteracted && (
        <div 
          onClick={handleInteraction}
          className="fixed inset-0 z-[9999] cursor-pointer"
          title="Click anywhere to enable audio alerts"
        />
      )}

      {/* ── Firebase Alert Banner ── */}
      {newIncidentAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Bell size={24} className="animate-pulse" />
          <div>
            <p className="font-bold text-lg">New Incident Report!</p>
            <p className="text-sm text-red-200 capitalize">{lastIncidentType} emergency received</p>
          </div>
          <button
            onClick={() => {
              setNewIncidentAlert(false);
              alertSoundRef.current?.pause();
            }}
            className="ml-4 text-red-200 hover:text-white text-xl font-bold"
          >✕</button>
        </div>
      )}

      {/* ── Header ── */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-xl">
                <Bell className="text-white" size={32} />
              </div>
              <div>
                <h1 className="font-bold text-white tracking-tight">{session?.user?.lguCode} Emergency Management System</h1>
                <p className="text-gray-400 text-sm">Real-time emergency response & monitoring</p>
              </div>
            </div>

            <NavigationMenu userRole={session?.user?.role || 'user'} />

            <div className="flex items-center gap-4">
              {/* Audio Status Indicator */}
              <span className={`text-[10px] px-2 py-1 rounded border ${userInteracted ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                {userInteracted ? 'AUDIO READY' : 'CLICK TO ENABLE AUDIO'}
              </span>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {session?.user?.role === 'system-admin' ? <Shield className="text-yellow-400" size={20} /> : <UserIcon className="text-white" size={20} />}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{session?.user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{session?.user?.role}</p>
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <button onClick={() => signOut({ callbackUrl: '/auth/signin' })} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${autoRefresh ? 'bg-green-600' : 'bg-gray-600'} text-white`}
              >
                <RefreshCw className={`inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} size={16} />
                Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
              </button> */}

              {pendingCount > 0 && (
                <div className="relative">
                  <Bell className="text-yellow-500 animate-pulse" size={32} />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{pendingCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-96 text-white text-xl">Loading dashboard...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 bg-gray-700 p-2 px-4 rounded-xl w-fit">
              <Link href="/map" target="_blank" className="text-gray-200 font-bold hover:text-white">Map</Link>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Active Emergencies</h2>
              <EmergencyManagement refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}