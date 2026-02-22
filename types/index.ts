export interface Location {
  coordinates: any;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

// /types/index.ts

export interface Emergency {
  [x: string]: any;
  _id: string;
  userId: string;
  userName: string;
  userPhone: string;
  emergencyType: 'medical' | 'fire' | 'crime' | 'accident' | 'natural-disaster' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';
  description?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    accuracy?: number;
  };
  responderId?: string;
  responderName?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface User {
  _id?: string;
  googleId?: string;
  name: string;
  email: string;
  image?: string;
  lguCode:string;
  phone: string;
  role: 'user' | 'system-admin' | 'responder';
  currentLocation?: Location;
  isActive: boolean;
  lastSeen: Date;
  emailVerified?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Responder {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  type: 'police' | 'medical' | 'fire' | 'rescue';
  currentLocation?: Location;
  isAvailable: boolean;
  activeEmergencies: string[];
}
