import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHospital extends Document {
  name: string;
  address: string;
  phone: string;
  facebookURI?: string;
  websiteURL?: string;
  lguCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    facebookURI: { type: String, trim: true },
    websiteURL: { type: String, trim: true },
    lguCode: { type: String, trim: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Hospital: Model<IHospital> =
  mongoose.models.Hospital ||
  mongoose.model<IHospital>("Hospital", HospitalSchema);

export default Hospital;