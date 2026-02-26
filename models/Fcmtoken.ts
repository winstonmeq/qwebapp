import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFcmToken extends Document {
  userId: string;
  lguCode: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

const FcmTokenSchema = new Schema<IFcmToken>(
  {
    userId:  { type: String, required: true, unique: true },
    lguCode: { type: String, required: true, index: true },
    token:   { type: String, required: true },
  },
  { timestamps: true }
);

const FcmTokenModel: Model<IFcmToken> =
  mongoose.models.FcmToken || mongoose.model<IFcmToken>('FcmToken', FcmTokenSchema);

export default FcmTokenModel;