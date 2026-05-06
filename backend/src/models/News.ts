import mongoose, { Schema, Document } from 'mongoose';

export interface INews extends Document {
  title: string;
  slug: string;
  content?: string;
  summary?: string;
  coverImage?: string;
  sourceUrl?: string;
  language?: string;
  source?: string;
  states?: string[];
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  shares: number;
  isBreaking: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, default: '' },
    summary: { type: String },
    coverImage: { type: String },
    sourceUrl: { type: String },
    language: { type: String, default: 'en' },
    source: { type: String },
    states: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    isBreaking: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<INews>('News', newsSchema);
