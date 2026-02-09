'use client';

import EmergencyForm from '@/components/EmergencyForm';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const router = useRouter();

  const handleSubmit = (data: any) => {
    // Redirect to dashboard after successful submission
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
      <EmergencyForm onSubmit={handleSubmit} />
      
      <div className="max-w-2xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Important Information</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">•</span>
            <span>This is for real emergencies only. Misuse may result in legal consequences.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">•</span>
            <span>Your location will be shared with emergency responders.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">•</span>
            <span>Keep your phone accessible for responder communication.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">•</span>
            <span>If life-threatening, also call your local emergency number (911, 112, etc.).</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
