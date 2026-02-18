import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Location Schema for User
 */
const LocationSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false } // Prevents creating an _id for subdocument
);

/**
 * User Document Interface
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin' | 'responder';
  lguId?: string;      // NEW: "quezon-city", "manila", etc.
  lguName?: string;    // NEW: "Quezon City", "Manila", etc.
  currentLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: Date;
  };
  isActive: boolean;
  lastSeen: Date;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Schema
 */
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin', 'responder'], default: 'user' },
    currentLocation: { type: LocationSchema },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    emailVerified: { type: Date },
  },
  { timestamps: true }
);

/**
 * Indexes for Performance
 */
// UserSchema.index({ email: 1 });
// UserSchema.index({ phone: 1 });
// UserSchema.index({ isActive: 1 });
// UserSchema.index({ role: 1 });

/**
 * Model - prevents OverwriteModelError in Next.js Hot Reload
 */
const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
