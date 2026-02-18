// models/LGU.ts
import mongoose, { Schema, Model, Document } from 'mongoose';



const LocationSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false } // Prevents creating an _id for subdocument
);


export interface ILGU extends Document {
  name: string;        // e.g., "Kidapawan City"
  lguCode: string;        // e.g., "kidapawan"
  logo?: string;
   currentLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: Date;
  };
  isActive: boolean;
}

const LGUSchema = new Schema<ILGU>({
  name: { type: String, required: true },
  lguCode: { type: String, required: true, unique: true },
  currentLocation: {
    type: LocationSchema,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LGUModel: Model<ILGU> = mongoose.models.LGU || mongoose.model<ILGU>('LGU', LGUSchema);
export default LGUModel;