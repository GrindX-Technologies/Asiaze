import mongoose, { Schema, Document } from 'mongoose';

export interface IReel extends Document {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  uploader: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
  views: number;
  likes: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

const reelSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IReel>('Reel', reelSchema);
