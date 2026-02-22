'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-red-600" size={48} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>

          {/* <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link> */}
            <button
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                       <ArrowLeft size={20} />Back to Sign In
                    </button>
        </div>
      </div>
    </div>
  );
}
