import mongoose, { Schema, Model, Document } from 'mongoose';


interface IMunicipality extends Document {
    countryCode: string;
    provinceCode: string;
    code: string;
    name: string;
    type: 'city' | 'municipality';
    contactEmail: string;
    hotlineNumbers: string[];
    isActive: boolean;
  }
  
  const MunicipalitySchema = new Schema<IMunicipality>({
    countryCode: { type: String, required: true, uppercase: true },
    provinceCode: { type: String, required: true, uppercase: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['city', 'municipality'], required: true },
    contactEmail: { type: String, lowercase: true },
    hotlineNumbers: [{ type: String }],
    isActive: { type: Boolean, default: true }
  }, { timestamps: true });
  
  // Essential Indices
  MunicipalitySchema.index({ provinceCode: 1 });
  MunicipalitySchema.index({ coverage: '2dsphere' }); // For geospatial queries
  
  const MunicipalityModel: Model<IMunicipality> = mongoose.models.Municipality || mongoose.model<IMunicipality>('Municipality', MunicipalitySchema);

  export default MunicipalityModel;
  
