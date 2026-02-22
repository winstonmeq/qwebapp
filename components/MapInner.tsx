// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { Emergency, User } from '@/types';
// import { MapPin, Phone, Clock, AlertTriangle } from 'lucide-react';

// interface EmergencyMapProps {
//   emergencies: Emergency[];
//   users: User[];
//   center: [number, number];
// }

// export default function MapInner({ emergencies, users, center }: EmergencyMapProps) {
//   const [renderMap, setRenderMap] = useState(false);

//   useEffect(() => {
//     // 1. Logic to fix the "Map container is already initialized" error
//     const container = L.DomUtil.get('emergency-map-container');
//     if (container !== null) {
//       // @ts-ignore - This cleans up the internal Leaflet instance tracking
//       container._leaflet_id = null;
//     }

//     // 2. Set icon defaults
//     // @ts-ignore
//     delete L.Icon.Default.prototype._getIconUrl;
//     L.Icon.Default.mergeOptions({
//       iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//       iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//       shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//     });

//     setRenderMap(true);

//     return () => {
//       setRenderMap(false);
//     };
//   }, []);

//   const getSeverityColor = (sev: string) => ({
//     critical: '#DC2626', high: '#EA580C', medium: '#CA8A04', low: '#16A34A'
//   }[sev] || '#6B7280');

//   const createEmergencyIcon = (severity: string) => L.divIcon({
//     html: `<div style="display:flex; justify-content:center;">
//             <svg width="32" height="42" viewBox="0 0 32 42">
//                <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26c0-8.8-7.2-16-16-16z" fill="${getSeverityColor(severity)}"/>
//                <circle cx="16" cy="16" r="8" fill="white"/>
//                <text x="16" y="21" font-size="16" text-anchor="middle" fill="${getSeverityColor(severity)}" font-weight="bold">!</text>
//              </svg>
//            </div>`,
//     className: '',
//     iconSize: [32, 42],
//     iconAnchor: [16, 42]
//   });

//   // Don't render anything until the cleanup check is done
//   if (!renderMap) return <div className="w-full h-full bg-gray-900 animate-pulse" />;

//   return (
//     <div id="emergency-map-container" className="w-full h-full">
//       <MapContainer
//         center={center}
//         zoom={13}
//         style={{ height: '100%', width: '100%' }}
//         scrollWheelZoom={true}
//         // REMOVED whenReady here to prevent initialization race conditions
//       >
//         <TileLayer 
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
//         />

//         {emergencies.map((e) => (
//           <Marker 
//             key={`emergency-${e._id}`} 
//             position={[e.location.latitude, e.location.longitude]} 
//             icon={createEmergencyIcon(e.severity)}
//           >
//             <Popup>
//               <div className="p-1 min-w-[150px]">
//                 <h4 className="font-bold flex items-center gap-1">
//                   <AlertTriangle size={14} className="text-red-500"/>
//                   {e.emergencyType}
//                 </h4>
//                 <p className="text-xs text-gray-600 mt-1">Reported by: {e.userName}</p>
//               </div>
//             </Popup>
//             {e.location.accuracy && (
//               <Circle 
//                 center={[e.location.latitude, e.location.longitude]} 
//                 radius={e.location.accuracy} 
//                 pathOptions={{ color: getSeverityColor(e.severity), fillOpacity: 0.1, weight: 1 }} 
//               />
//             )}
//           </Marker>
//         ))}

//         {users.map((u) => u.currentLocation && (
//           <Marker 
//             key={`user-${u._id}`} 
//             position={[u.currentLocation.latitude, u.currentLocation.longitude]}
//           >
//              <Popup><div className="text-xs font-bold">{u.fName}</div></Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }