import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<ITag>('Tag', tagSchema);
