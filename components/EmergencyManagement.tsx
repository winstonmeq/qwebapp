'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  PlayCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Phone,
  User,
  Clock,
  Activity,
  MessageSquare,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ChatModal from './ChatModal';
import { Emergency } from '@/types'; 

export default function EmergencyManagement() {
  const { data: session } = useSession();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'respond' | 'acknowledge'>('view');
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [formData, setFormData] = useState({
    estimatedArrival: '',
    team: '',
    vehicle: '',
    equipment: '',
    notes: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });


const [activeChat, setActiveChat] = useState<Emergency | null>(null);






  useEffect(() => {
    fetchEmergencies();
    // const interval = setInterval(fetchEmergencies, 10000); // Refresh every 10 seconds
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterEmergencies();
  }, [emergencies, searchTerm, statusFilter, severityFilter, typeFilter]);

  
  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emergencies');
      const result = await response.json();
      if (result.success) {
        setEmergencies(result.data);
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmergencies = () => {
    let filtered = [...emergencies];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emergency =>
        emergency.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emergency.userPhone.includes(searchTerm) ||
        // emergency.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emergency.emergencyType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(e => e.severity === severityFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(e => e.emergencyType === typeFilter);
    }

    setFilteredEmergencies(filtered);
  };

  const handleAcknowledge = async (emergencyId: string, formData?: any) => {
    try {
      const response = await fetch(`/api/emergencies/${emergencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'acknowledged',
          responder: {
            id: session?.user?.id,
            name: session?.user?.name,
            respondedAt: new Date()
          },
          acknowledgeDetails: formData ? {
            priority: formData.priority,
            notes: formData.notes,
            acknowledgedBy: session?.user?.name,
            acknowledgedAt: new Date()
          } : undefined
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchEmergencies();
        closeModal();
        alert('Emergency acknowledged successfully!');
      }
    } catch (error) {
      console.error('Error acknowledging emergency:', error);
      alert('Failed to acknowledge emergency');
    }
  };

  const handleRespond = async (emergencyId: string, formData?: any) => {
    try {
      const response = await fetch(`/api/emergencies/${emergencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'responding',
          responder: {
            id: session?.user?.id,
            name: session?.user?.name,
            respondedAt: new Date()
          },
          responseDetails: formData ? {
            estimatedArrival: formData.estimatedArrival,
            team: formData.team,
            vehicle: formData.vehicle,
            equipment: formData.equipment,
            notes: formData.notes,
            dispatchedAt: new Date()
          } : undefined
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchEmergencies();
        closeModal();
        alert('Emergency response initiated!');
      }
    } catch (error) {
      console.error('Error responding to emergency:', error);
      alert('Failed to respond to emergency');
    }
  };

  const handleResolve = async (emergencyId: string) => {
    if (!confirm('Mark this emergency as resolved?')) return;

    try {
      const response = await fetch(`/api/emergencies/${emergencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'resolved',
          resolvedAt: new Date()
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchEmergencies();
        alert('Emergency resolved successfully!');
      }
    } catch (error) {
      console.error('Error resolving emergency:', error);
      alert('Failed to resolve emergency');
    }
  };

  const handleCancel = async (emergencyId: string) => {
    if (!confirm('Cancel this emergency?')) return;

    try {
      const response = await fetch(`/api/emergencies/${emergencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchEmergencies();
        alert('Emergency cancelled!');
      }
    } catch (error) {
      console.error('Error cancelling emergency:', error);
      alert('Failed to cancel emergency');
    }
  };

  const handleDelete = async (emergencyId: string) => {
    if (!confirm('Permanently delete this emergency record?')) return;

    try {
      const response = await fetch(`/api/emergencies/${emergencyId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        await fetchEmergencies();
        alert('Emergency deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting emergency:', error);
      alert('Failed to delete emergency');
    }
  };

  const openViewModal = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setModalMode('view');
    setShowModal(true);
  };

  const openAcknowledgeModal = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setModalMode('acknowledge');
    setFormData({
      estimatedArrival: '',
      team: '',
      vehicle: '',
      equipment: '',
      notes: '',
      priority: 'normal',
    });
    setShowModal(true);
  };

  const openRespondModal = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setModalMode('respond');
    setFormData({
      estimatedArrival: '',
      team: '',
      vehicle: '',
      equipment: '',
      notes: '',
      priority: 'normal',
    });
    setResponseNote('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmergency(null);
    setResponseNote('');
    setFormData({
      estimatedArrival: '',
      team: '',
      vehicle: '',
      equipment: '',
      notes: '',
      priority: 'normal',
    });
  };

  const exportEmergencies = () => {
    const csv = [
      ['Date', 'Name', 'Phone', 'Type', 'Severity', 'Status', 'Description', 'Location'],

      ...filteredEmergencies.map(e => [
        new Date(e.createdAt).toLocaleString(),
        e.userName,
        e.userPhone,
        e.emergencyType,
        e.severity,
        e.status,
        e.description,
        `${e.location?.coordinates?.[1] ?? ''}, ${e.location?.coordinates?.[0] ?? ''}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergencies-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-500',
      acknowledged: 'bg-blue-500',
      responding: 'bg-purple-500',
      resolved: 'bg-green-500',
      cancelled: 'bg-gray-500',
    };
    return badges[status] || 'bg-gray-500';
  };

  const stats = {
    total: emergencies.length,
    pending: emergencies.filter(e => e.status === 'pending').length,
    acknowledged: emergencies.filter(e => e.status === 'acknowledged').length,
    responding: emergencies.filter(e => e.status === 'responding').length,
    resolved: emergencies.filter(e => e.status === 'resolved').length,
    critical: emergencies.filter(e => e.severity === 'critical').length,
  };

  const emergencyTypes = ['all', 'medical', 'fire', 'crime', 'accident', 'natural-disaster', 'other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading emergencies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total" value={stats.total} icon={AlertTriangle} color="bg-blue-500" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-yellow-500" />
        <StatCard title="Acknowledged" value={stats.acknowledged} icon={CheckCircle} color="bg-blue-500" />
        <StatCard title="Responding" value={stats.responding} icon={Activity} color="bg-purple-500" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Critical" value={stats.critical} icon={AlertTriangle} color="bg-red-500" />
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search emergencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="responding">Responding</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {emergencyTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmergencies}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={exportEmergencies}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Showing {filteredEmergencies.length} of {emergencies.length} emergencies
        </div>
      </div>

      {/* Emergencies Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Emergency
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEmergencies.map((emergency) => (
                <tr key={emergency._id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(emergency.severity)}`}>
                        <AlertTriangle className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white capitalize">
                          {emergency.emergencyType.replace('-', ' ')}
                        </p>
                        {/* <p className="text-xs text-gray-400 line-clamp-2 max-w-xs">
                          {emergency.description}
                        </p> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-white">{emergency.userName}</p>
                                    
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-gray-800 rounded-lg border border-gray-700">
                                  <div>
                                    {/* <p className="text-xs text-gray-500 uppercase font-semibold">Contact Number</p> */}
                                    <p className="text-sm text-white px-2">{emergency.userPhone}</p>
                                  </div>
                                  <a 
                                    href={`tel:${emergency.userPhone}`} 
                                    className="bg-green-500 hover:bg-green-400 p-2 rounded-full text-white shadow-lg transition-transform active:scale-90"
                                  >
                                    {/* Phone Icon SVG */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                  </a>
                                </div>  
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-gray-700 rounded-full capitalize">
                      {emergency.emergencyType.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getSeverityColor(emergency.severity)}`}>
                      {emergency.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusBadge(emergency.status)}`}>
                      {emergency.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      {formatDistanceToNow(new Date(emergency.createdAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(emergency)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>

                      {emergency.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openAcknowledgeModal(emergency)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Acknowledge"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => openRespondModal(emergency)}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                            title="Respond"
                          >
                            <PlayCircle size={18} />
                          </button>

         
                            <button
                            onClick={() => setActiveChat(emergency)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Chat with Reporter"
                          >
                            <MessageSquare size={18} />
                          </button>




                        </>
                      )}

                      {emergency.status === 'acknowledged' && (
                        <>
                            <button
                            onClick={() => openRespondModal(emergency)}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                            title="Start Response"
                          >
                            <PlayCircle size={18} />
                          </button>
                          
                          <button
                            onClick={() => setActiveChat(emergency)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Chat with Reporter"
                          >
                              <MessageSquare size={18} />
                            </button>
                          
                          </>

                        
                      )}

                      {(emergency.status === 'responding' || emergency.status === 'acknowledged') && (
                        <>
                            <button
                            onClick={() => handleResolve(emergency._id)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Mark as Resolved"
                          >
                            <CheckCircle size={18} />
                          </button><button
                            onClick={() => setActiveChat(emergency)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Chat with Reporter"
                          >
                              <MessageSquare size={18} />
                            </button>
                        </>

                      )}

                      {emergency.status !== 'resolved' && emergency.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(emergency._id)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Cancel"
                        >
                          <XCircle size={18} />
                        </button>
                      )}

                      {(session?.user?.role === 'system-admin') && (
                        <button
                          onClick={() => handleDelete(emergency._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmergencies.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No emergencies found
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedEmergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {modalMode === 'view' && 'Emergency Details'}
                  {modalMode === 'acknowledge' && 'Acknowledge Emergency'}
                  {modalMode === 'respond' && 'Respond to Emergency'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Acknowledge Form */}
              {modalMode === 'acknowledge' && (
                <div className="space-y-4">
                  {/* Emergency Summary */}
                  <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                    <div className="flex gap-3 mb-3">
                      <span className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${getSeverityColor(selectedEmergency.severity)}`}>
                        {selectedEmergency.severity.toUpperCase()}
                      </span>
                      <span className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gray-700 capitalize">
                        {selectedEmergency.emergencyType.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{selectedEmergency.description}</p>
                    <p className="text-xs text-gray-400">Reporter: {selectedEmergency.userName} ({selectedEmergency.userPhone})</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Priority Assessment *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Assess the priority level based on the situation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Acknowledgment Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any initial observations or notes..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Document initial assessment or concerns</p>
                  </div>

                  <div className="bg-blue-600 bg-opacity-10 border border-blue-600 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={20} />
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold text-blue-400 mb-1">Acknowledging this emergency will:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Mark the emergency as "Acknowledged"</li>
                          <li>• Record you as the responding officer</li>
                          <li>• Notify the reporter that help is being arranged</li>
                          <li>• Add this to your active cases</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAcknowledge(selectedEmergency._id, formData)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Acknowledge Emergency
                    </button>
                  </div>
                </div>
              )}

              {/* Respond Form */}
              {modalMode === 'respond' && (
                <div className="space-y-4">
                  {/* Emergency Summary */}
                  <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                    <div className="flex gap-3 mb-3">
                      <span className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${getSeverityColor(selectedEmergency.severity)}`}>
                        {selectedEmergency.severity.toUpperCase()}
                      </span>
                      <span className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${getStatusBadge(selectedEmergency.status)}`}>
                        {selectedEmergency.status.toUpperCase()}
                      </span>
                      <span className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gray-700 capitalize">
                        {selectedEmergency.emergencyType.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{selectedEmergency.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                      <span>📍 {selectedEmergency.location?.coordinates?.[1] ?? ''}, {selectedEmergency.location?.coordinates?.[0] ?? ''}</span>
                      <span>📞 {selectedEmergency.userPhone}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Estimated Time of Arrival (ETA) *
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedArrival}
                      onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })}
                      placeholder="e.g., 10 minutes, 15:30, ASAP"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Provide estimated arrival time</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Response Team
                    </label>
                    <input
                      type="text"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      placeholder="e.g., Unit 5, Team Alpha, Medical Team 3"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Specify which unit or team is responding</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Vehicle/Unit ID
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle}
                      onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                      placeholder="e.g., Ambulance 12, Patrol Car 5, Fire Truck 3"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Vehicle or unit identification</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Equipment/Resources Deployed
                    </label>
                    <input
                      type="text"
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      placeholder="e.g., First aid kit, Fire extinguisher, Rescue equipment"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">List equipment or resources being deployed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Response Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add dispatch notes, instructions, or special considerations..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Document response plan or special instructions</p>
                  </div>

                  <div className="bg-purple-600 bg-opacity-10 border border-purple-600 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <PlayCircle className="text-purple-400 mt-0.5 flex-shrink-0" size={20} />
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold text-purple-400 mb-1">Initiating response will:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Mark status as "Responding"</li>
                          <li>• Dispatch notification to reporter with ETA</li>
                          <li>• Start response timer and tracking</li>
                          <li>• Alert nearby units if needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRespond(selectedEmergency._id, formData)}
                      className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={20} />
                      Dispatch Response Team
                    </button>
                  </div>
                </div>
              )}

              {/* View Modal */}
              {modalMode === 'view' && (
              <div className="space-y-4">
                {/* Severity and Status */}
                <div className="flex gap-3">
                  <span className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${getSeverityColor(selectedEmergency.severity)}`}>
                    {selectedEmergency.severity.toUpperCase()} PRIORITY
                  </span>
                  <span className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${getStatusBadge(selectedEmergency.status)}`}>
                    {selectedEmergency.status.toUpperCase()}
                  </span>
                </div>

                {/* Emergency Info */}
                <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                  <InfoRow label="Type" value={selectedEmergency.emergencyType.replace('-', ' ').toUpperCase()} />
                  {/* <InfoRow label="Description" value={selectedEmergency.description} /> */}
                  <InfoRow label="Reported" value={formatDistanceToNow(new Date(selectedEmergency.createdAt), { addSuffix: true })} />
                </div>

                {/* Reporter Info */}
                <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Reporter Information</h3>
                  <InfoRow label="Name" value={selectedEmergency.userName} />
                  <InfoRow label="Phone" value={selectedEmergency.userPhone} />
                </div>

                {/* Location */}
                <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Location</h3>
                  <InfoRow 
                    label="Coordinates" 
                    value={`${selectedEmergency.location.coordinates[1]}, ${selectedEmergency.location.coordinates[0]}`} 
                  />
                  {selectedEmergency.location.accuracy && (
                    <InfoRow label="Accuracy" value={`±${selectedEmergency.location.accuracy}m`} />
                  )}
                  <a
                    href={`https://www.google.com/maps?q=${selectedEmergency.location.coordinates[1]},${selectedEmergency.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <MapPin size={16} />
                    Open in Google Maps
                  </a>
                </div>

                {/* Responder Info */}
                {selectedEmergency.responderName && (
                  <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Response Information</h3>
                    <InfoRow label="Responder" value={selectedEmergency.responderName} />
                    <InfoRow 
                      label="Responded At" 
                      value={formatDistanceToNow(new Date(selectedEmergency.createdAt), { addSuffix: true })} 
                    />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-700">
                  {selectedEmergency.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          closeModal();
                          setTimeout(() => openAcknowledgeModal(selectedEmergency), 100);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Acknowledge
                      </button>
                 

                      <button
                        onClick={() => {
                          closeModal();
                          setTimeout(() => openRespondModal(selectedEmergency), 100);
                        }}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <PlayCircle size={18} />
                        Respond Now
                      </button>
                    </>
                  )}

                  {selectedEmergency.status === 'acknowledged' && (
                    <button
                      onClick={() => {
                        closeModal();
                        setTimeout(() => openRespondModal(selectedEmergency), 100);
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={18} />
                      Start Response
                    </button>
                  )}

                  {(selectedEmergency.status === 'responding' || selectedEmergency.status === 'acknowledged') && (
                    <button
                      onClick={() => {
                        handleResolve(selectedEmergency._id);
                        closeModal();
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Mark as Resolved
                    </button>
                  )}

                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
{activeChat && (
  <ChatModal 
    emergency={activeChat} 
    onClose={() => setActiveChat(null)} 
    currentUser={session?.user} 
  />
)}

    </div>
  );

  
  
}

// Helper Components
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-800 last:border-0">
      <span className="text-sm font-medium text-gray-400">{label}:</span>
      <span className="text-sm text-white text-right capitalize">{value}</span>
    </div>
  );
}


