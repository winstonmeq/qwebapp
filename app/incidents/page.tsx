'use client';

import { useState } from 'react';

export default function CreateEmergencyPage() {
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    userPhone: '',
    latitude: '',
    longitude: '',
    accuracy: '',
    emergencyType: '',
    severity: 'medium',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          userName: formData.userName,
          userPhone: formData.userPhone,
          location: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            accuracy: parseFloat(formData.accuracy || '0'),
          },
          emergencyType: formData.emergencyType,
          severity: formData.severity,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ Emergency created: ${data.data._id}`);
        setFormData({
          userId: '',
          userName: '',
          userPhone: '',
          latitude: '',
          longitude: '',
          accuracy: '',
          emergencyType: '',
          severity: 'medium',
          description: '',
        });
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Create Emergency</h2>

        <input
          name="userId"
          placeholder="User ID"
          value={formData.userId}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          name="userName"
          placeholder="User Name"
          value={formData.userName}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          name="userPhone"
          placeholder="User Phone"
          value={formData.userPhone}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <div className="flex gap-2">
          <input
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            required
          />
          <input
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <input
          name="accuracy"
          placeholder="Accuracy (meters)"
          value={formData.accuracy}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <input
          name="emergencyType"
          placeholder="Emergency Type (e.g., Fire, Flood)"
          value={formData.emergencyType}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <select
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Create Emergency'}
        </button>

        {result && (
          <p className="text-white mt-2 break-words">{result}</p>
        )}
      </form>
    </div>
  );
}
