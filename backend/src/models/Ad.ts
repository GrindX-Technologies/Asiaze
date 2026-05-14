import mongoose, { Schema, Document } from 'mongoose';

export interface IAd extends Document {
  title: string;
  type: 'feed' | 'story' | 'reel';
  mediaUrl: string;
  linkUrl?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const adSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['feed', 'story', 'reel'], required: true },
    mediaUrl: { type: String, required: true },
    linkUrl: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAd>('Ad', adSchema);
