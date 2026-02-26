// models/AnalyticsEvent.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  lguCode: string;
  eventName: string;
  screen: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    lguCode: { type: String, required: true },
    eventName: { type: String, required: true },
    screen: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);