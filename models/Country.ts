import mongoose, { Schema, Model, Document } from 'mongoose';

interface ICountry extends Document {
  code: string;
  name: string;
  isActive: boolean;
}

const CountrySchema = new Schema<ICountry>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });


const CountryModel: Model<ICountry> = mongoose.models.countryCode || mongoose.model<ICountry>('Country', CountrySchema);

export default CountryModel;
