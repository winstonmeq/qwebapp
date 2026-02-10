'use client';

import { useEffect, useRef, useState } from 'react';
import { Emergency, User } from '@/types';
import { MapPin, Activity, Phone, Clock, AlertTriangle } from 'lucide-react';
import { useMap } from 'react-leaflet';
import dynamic from 'next/dynamic';

// Dynamic imports for SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });

interface EmergencyMapProps {
  emergencies: Emergency[];
  users: User[];
  center?: [number, number];
  alertUser?: User | null;
  clearAlert?: () => void;
}

export default function EmergencyMap({
  emergencies,
  users,
  center = [7.123, 125.123],
  alertUser,
  clearAlert,
}: EmergencyMapProps) {

  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);
  const mapInitialized = useRef(false);

  // Initialize Leaflet and fix default icons
  useEffect(() => {
    if (mapInitialized.current) return;
    mapInitialized.current = true;

    setIsClient(true);
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);

      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  // Helper to open map on alert user
  function MapController({ alertUser }: { alertUser?: User | null }) {
    const map = useMap();

    useEffect(() => {
      if (alertUser?.currentLocation) {
        const { latitude, longitude } = alertUser.currentLocation;
        if (latitude != null && longitude != null) {
          map.setView([latitude, longitude], 16, { animate: true });
        }
      }
    }, [alertUser, map]);

    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#CA8A04';
      case 'low': return '#16A34A';
      default: return '#6B7280';
    }
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

  const createCustomIcon = (severity: string) => {
    if (!L) return null;

    const color = getSeverityColor(severity);
    const svgIcon = `
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26c0-8.8-7.2-16-16-16z" fill="${color}"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <text x="16" y="21" font-size="16" text-anchor="middle" fill="${color}" font-weight="bold">!</text>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker',
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    });
  };

  const createUserIcon = () => {
    if (!L) return null;

    const svgIcon = `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#2563EB" opacity="0.8"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'user-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  };

  if (!isClient || !L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {alertUser && (
        <div className="absolute top-4 right-4 z-[9999] bg-red-600 text-white p-4 rounded-xl shadow-xl w-[320px] animate-pulse">
          <h3 className="font-bold text-lg">🚨 New Location Update</h3>
          <p className="mt-2 text-sm">
            <strong>{alertUser.name}</strong> updated location
          </p>
          <p className="text-xs mt-1">{new Date(alertUser.lastSeen).toLocaleString()}</p>
          <button
            className="mt-3 bg-white text-red-600 px-3 py-1 rounded text-sm font-semibold"
            onClick={clearAlert}
          >
            Close
          </button>
        </div>
      )}

      <MapContainer
        key="emergency-map-container"
        center={center}
        zoom={13}
        className="w-full h-full"
        style={{ background: '#1f2937' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController alertUser={alertUser} />

        {/* Emergency Markers */}
        {emergencies.map((emergency) => {
          if (!emergency.location?.coordinates?.length) return null;
          const [lng, lat] = emergency.location.coordinates;
          if (lat == null || lng == null) return null;

          const icon = createCustomIcon(emergency.severity);
          if (!icon) return null;

          return (
            <Marker key={emergency._id} position={[lat, lng]} icon={icon}>
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-red-600" size={20} />
                    <h3 className="font-bold text-lg capitalize">{emergency.emergencyType}</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-white text-xs ${getStatusBadge(emergency.status)}`}>
                        {emergency.status.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-white text-xs`}
                        style={{ backgroundColor: getSeverityColor(emergency.severity) }}
                      >
                        {emergency.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="flex items-center gap-1">
                      <MapPin size={14} />
                      <strong>User:</strong> {emergency.userName}
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone size={14} />
                      <strong>Phone:</strong> {emergency.userPhone}
                    </p>
                    {emergency.description && (
                      <p className="mt-2">
                        <strong>Description:</strong> {emergency.description}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock size={12} />
                      {new Date(emergency.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Popup>
              {emergency.location.accuracy && (
                <Circle
                  center={[lat, lng]}
                  radius={emergency.location.accuracy}
                  pathOptions={{
                    color: getSeverityColor(emergency.severity),
                    fillColor: getSeverityColor(emergency.severity),
                    fillOpacity: 0.1,
                  }}
                />
              )}
            </Marker>
          );
        })}

        {/* User Markers */}
        {users.map((user) => {
          if (!user.currentLocation) return null;
          const { latitude, longitude, accuracy } = user.currentLocation;
          if (latitude == null || longitude == null) return null;

          const icon = createUserIcon();
          if (!icon) return null;

          return (
            <Marker key={user._id} position={[latitude, longitude]} icon={icon} autoPan={true}>
              <Popup>
                <div className="p-2 text-sm font-bold">{user.name}</div>
              </Popup>
              {accuracy && (
                <Circle
                  center={[latitude, longitude]}
                  radius={accuracy}
                  pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.05 }}
                />
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
