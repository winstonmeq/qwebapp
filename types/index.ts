export interface Location {
  coordinates: any;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export interface Emergency {
  _id?: string;
  userId: string;
  userName: string;
  userPhone: string;
  location: Location;
  emergencyType: 'medical' | 'fire' | 'crime' | 'accident' | 'natural-disaster' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  responderId?: string;
  responderName?: string;
  estimatedArrival?: Date;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: 'user' | 'admin' | 'responder';
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
