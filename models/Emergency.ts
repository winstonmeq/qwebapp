import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * GeoJSON Location Schema
 * MongoDB requires [longitude, latitude]
 */
const LocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    accuracy: {
      type: Number,
    },
  },
  { _id: false }
);

export interface IEmergency extends Document {
  lguCode: string; // Added reference to LGU
  userId: string;
  userName: string;
  userPhone: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    accuracy?: number;
  };
  emergencyType:
    | 'medical'
    | 'fire'
    | 'police'
    | 'accident'
    | 'landslide'
    | 'flood'
    | 'ambulance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status:
    | 'pending'
    | 'acknowledged'
    | 'responding'
    | 'resolved'
    | 'cancelled';
  description?: string;
  responderId?: string;
  responderName?: string;
  estimatedArrival?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencySchema = new Schema<IEmergency>(
  {
    lguCode: { type: Schema.Types.String, ref: 'LGU', required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },

    location: {
      type: LocationSchema,
      required: true,
    },

    emergencyType: {
      type: String,
      enum: ['medical', 'fire', 'police', 'accident', 'landslide', 'flood', 'ambulance'],
      required: true,
    },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'responding', 'resolved', 'cancelled'],
      default: 'pending',
    },

    description: { type: String },
    responderId: { type: String },
    responderName: { type: String },
    estimatedArrival: { type: Date },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for Performance
 */

// Geo index for near queries
// EmergencySchema.index({ location: '2dsphere' });

// Filter dashboard by status + latest
EmergencySchema.index({ status: 1, createdAt: -1 });

// Query by user history
EmergencySchema.index({ userId: 1 });
EmergencySchema.index({ lguCode: 1, status: 1 });

const EmergencyModel: Model<IEmergency> =
  mongoose.models.Emergency ||
  mongoose.model<IEmergency>('Emergency', EmergencySchema);

export default EmergencyModel;
