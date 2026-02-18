'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserManagement from '@/components/UserManagement';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Helper to check if the role is allowed
  const isAuthorized = 
    session?.user?.role === 'system-admin' || 
    session?.user?.role === 'responder';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !isAuthorized) {
      // If logged in but NOT an admin or responder, kick them to dashboard
      router.push('/');
    }
  }, [session, status, router, isAuthorized]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <div className="text-white text-xl ml-4">Loading...</div>
      </div>
    );
  }

  // Final safety check before rendering the UI
  if (!session || !isAuthorized) {
    return null;
  }

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
              
              {/* Icon color changes based on role for visual feedback */}
              <div className={`p-3 rounded-xl ${
                session.user.role === 'system-admin' ? 'bg-orange-600' : 'bg-emerald-600'
              }`}>
                <Users className="text-white" size={32} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  User Management
                </h1>
                <p className="text-gray-400 text-sm">
                  Logged in as <span className="capitalize">{session.user.role.replace('-', ' ')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserManagement />
      </main>
    </div>
  );
}