'use client';

import { Emergency, User } from '@/types';
import { Activity, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

interface StatsDashboardProps {
  emergencies: Emergency[];
  users: User[];
}

export default function StatsDashboard({ emergencies, users }: StatsDashboardProps) {
  const stats = {
    total: emergencies.length,
    pending: emergencies.filter(e => e.status === 'pending').length,
    active: emergencies.filter(e => ['acknowledged', 'responding'].includes(e.status)).length,
    resolved: emergencies.filter(e => e.status === 'resolved').length,
    critical: emergencies.filter(e => e.severity === 'critical' && e.status !== 'resolved').length,
    activeUsers: users.filter(u => u.isActive).length,
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
    bgColor: string;
  }) => (
    <div className={`${bgColor} rounded-xl p-6 border-2 ${color} shadow-lg transform transition-all hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className={`text-4xl font-bold mt-2 ${color.replace('border-', 'text-')}`}>
            {value}
          </p>
        </div>
        <div className={`p-4 rounded-full ${color.replace('border-', 'bg-').replace('600', '100')}`}>
          <Icon className={color.replace('border-', 'text-')} size={32} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Emergencies"
        value={stats.total}
        icon={AlertTriangle}
        color="border-blue-600"
        bgColor="bg-blue-50"
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        icon={Clock}
        color="border-yellow-600"
        bgColor="bg-yellow-50"
      />
      <StatCard
        title="Active Response"
        value={stats.active}
        icon={Activity}
        color="border-purple-600"
        bgColor="bg-purple-50"
      />
      <StatCard
        title="Resolved"
        value={stats.resolved}
        icon={CheckCircle}
        color="border-green-600"
        bgColor="bg-green-50"
      />
      <StatCard
        title="Critical"
        value={stats.critical}
        icon={AlertTriangle}
        color="border-red-600"
        bgColor="bg-red-50"
      />
      <StatCard
        title="Active Users"
        value={stats.activeUsers}
        icon={Users}
        color="border-indigo-600"
        bgColor="bg-indigo-50"
      />
    </div>
  );
}
