'use client';

import { Emergency } from '@/types';
import { MapPin, Clock, Phone, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EmergencyListProps {
  emergencies: Emergency[];
  onSelectEmergency?: (emergency: Emergency) => void;
  onUpdateStatus?: (emergencyId: string, status: Emergency['status']) => void;
}

export default function EmergencyList({ 
  emergencies, 
  onSelectEmergency, 
  onUpdateStatus 
}: EmergencyListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-600 bg-red-50';
      case 'high': return 'border-orange-600 bg-orange-50';
      case 'medium': return 'border-yellow-600 bg-yellow-50';
      case 'low': return 'border-green-600 bg-green-50';
      default: return 'border-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'acknowledged': return 'bg-blue-500 text-white';
      case 'responding': return 'bg-purple-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEmergencyIcon = (type: string) => {
    return <AlertTriangle className="text-red-600" size={20} />;
  };

  return (
    <div className="space-y-3">
      {emergencies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
          <p className="text-lg">No active emergencies</p>
        </div>
      ) : (
        emergencies.map((emergency) => (
          <div
            key={emergency._id}
            className={`border-l-4 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${getSeverityColor(emergency.severity)}`}
            onClick={() => onSelectEmergency?.(emergency)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getEmergencyIcon(emergency.emergencyType)}
                  <h3 className="font-bold text-lg capitalize">
                    {emergency.emergencyType.replace('-', ' ')}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(emergency.status)}`}>
                    {emergency.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-600" />
                    <span className="font-semibold">{emergency.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-600" />
                    <span>{emergency.userPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-600" />
                    <span>{formatDistanceToNow(new Date(emergency.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">
                      Severity: <span className="uppercase">{emergency.severity}</span>
                    </span>
                  </div>
                </div>

                {emergency.description && (
                  <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                    {emergency.description}
                  </p>
                )}

                {emergency.responderId && (
                  <div className="mt-2 text-sm text-blue-700">
                    <strong>Responder:</strong> {emergency.responderName}
                  </div>
                )}
              </div>

              {onUpdateStatus && emergency.status === 'pending' && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(emergency._id!, 'acknowledged');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(emergency._id!, 'responding');
                    }}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                  >
                    Respond
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
