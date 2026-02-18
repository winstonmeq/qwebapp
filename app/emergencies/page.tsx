'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EmergencyManagement from '@/components/EmergencyManagement';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EmergenciesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Only admins and responders can access full emergency management
  const canManage = session.user.role === 'system-admin' || session.user.role === 'responder';

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
              <div className="bg-red-600 p-3 rounded-xl">
                <AlertTriangle className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Emergency Management
                </h1>
                <p className="text-gray-400 text-sm">
                  {canManage 
                    ? 'Monitor and respond to emergencies' 
                    : 'View emergency reports'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!canManage && (
          <div className="mb-6 bg-yellow-600 bg-opacity-10 border border-yellow-600 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-400 mt-0.5" size={20} />
              <div>
                <h3 className="text-yellow-400 font-semibold mb-1">Limited Access</h3>
                <p className="text-sm text-gray-300">
                  You can view emergencies but cannot manage them. Contact an administrator for elevated permissions.
                </p>
              </div>
            </div>
          </div>
        )}

        <EmergencyManagement />
      </main>
    </div>
  );
}
