import mongoose, { Schema, Model, Document } from 'mongoose';


interface IProvince extends Document {
    countryCode: string;
    code: string;
    name: string;
    region: string;
    isActive: boolean;
  }
  
  const ProvinceSchema = new Schema<IProvince>({
    countryCode: { type: String, required: true, ref: 'Country', uppercase: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    region: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }, { timestamps: true });
  
  // Index for fast filtering by country
  ProvinceSchema.index({ countryCode: 1 });
  
  const ProvinceModel: Model<IProvince> = mongoose.models.Province || mongoose.model<IProvince>('Province', ProvinceSchema);

  export default ProvinceModel;



