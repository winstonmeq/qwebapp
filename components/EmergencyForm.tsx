'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, User, MessageSquare, AlertTriangle } from 'lucide-react';

interface EmergencyFormProps {
  onSubmit?: (data: any) => void;
}

export default function EmergencyForm({ onSubmit }: EmergencyFormProps) {
  const [formData, setFormData] = useState({
    userName: '',
    userPhone: '',
    emergencyType: 'medical',
    severity: 'medium',
    description: '',
  });

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      alert('Location is required to submit an emergency.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/emergencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          location,
          userId: formData.userPhone, // Using phone as user ID for simplicity
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Emergency reported successfully! Help is on the way.');
        setFormData({
          userName: '',
          userPhone: '',
          emergencyType: 'medical',
          severity: 'medium',
          description: '',
        });
        onSubmit?.(result.data);
      } else {
        alert('Failed to report emergency. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting emergency:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertTriangle className="text-red-600" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Report Emergency</h2>
          <p className="text-gray-600">Fill in the details below to get immediate help</p>
        </div>
      </div>

      {locationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {locationError}
        </div>
      )}

      {location && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <MapPin size={20} />
          <span>Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User className="inline mr-2" size={16} />
            Your Name
          </label>
          <input
            type="text"
            required
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="inline mr-2" size={16} />
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={formData.userPhone}
            onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Emergency Type
          </label>
          <select
            value={formData.emergencyType}
            onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          >
            <option value="medical">Medical Emergency</option>
            <option value="fire">Fire</option>
            <option value="crime">Crime/Security</option>
            <option value="accident">Accident</option>
            <option value="natural-disaster">Natural Disaster</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Severity Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['low', 'medium', 'high', 'critical'].map((severity) => (
              <button
                key={severity}
                type="button"
                onClick={() => setFormData({ ...formData, severity })}
                className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  formData.severity === severity
                    ? severity === 'critical'
                      ? 'bg-red-600 text-white'
                      : severity === 'high'
                      ? 'bg-orange-600 text-white'
                      : severity === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {severity.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MessageSquare className="inline mr-2" size={16} />
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
            placeholder="Provide additional details about the emergency..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !location}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg shadow-lg"
        >
          {isSubmitting ? 'Submitting...' : 'REPORT EMERGENCY'}
        </button>
      </form>
    </div>
  );
}
