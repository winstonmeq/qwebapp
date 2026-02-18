import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * User Document Interface
 */
export interface IUser extends Document {
  lguCode: string;
  name: string;
  email: string;
  image?: string;
  googleId?: string;
  phone: string;
  // --- NEW FIELDS ADDED HERE ---
  sex?: 'Male' | 'Female' | 'Other';
  age?: number;
  province?: string;
  municipality?: string;
  barangay?: string;
  // -----------------------------
  role: 'user' | 'responder' | 'system-admin';
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
    lguCode: { type: Schema.Types.String, ref: 'LGU', required: false },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    phone: { type: String, required: false, unique: true, sparse: true }, // Sparse allows multiple nulls
    
    // --- NEW SCHEMA FIELDS ---
    sex: { type: String, enum: ['Male', 'Female', 'Other'], required: false },
    age: { type: Number, required: false },
    province: { type: String, required: false },
    municipality: { type: String, required: false },
    barangay: { type: String, required: false },
    // -------------------------

    role: { type: String, enum: ['user', 'responder', 'system-admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    emailVerified: { type: Date },
  },
  { timestamps: true }
);

/**
 * Indexes for Performance
 */
UserSchema.index({ isActive: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ lguCode: 1, email: 1 });
// Add an index for location-based reporting
UserSchema.index({ municipality: 1, barangay: 1 });

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;