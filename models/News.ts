import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INews extends Document {
  title: string;
  slug: string;
  content: string;
  summary: string;
  author: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  lguCode?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['announcement', 'alert', 'event', 'update', 'general'],
      default: 'general',
    },
    tags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    lguCode: {
      type: String,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from title before saving
NewsSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() +
      '-' +
      Date.now();
  }
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Index for fast querying
NewsSchema.index({ lguCode: 1, status: 1, createdAt: -1 });
NewsSchema.index({ slug: 1 });

const NewsModel: Model<INews> =
  mongoose.models.News || mongoose.model<INews>('News', NewsSchema);

export default NewsModel;