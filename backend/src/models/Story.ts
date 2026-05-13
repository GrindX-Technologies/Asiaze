import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryPage {
  imageUrl: string;
  title: string;
  description: string;
}

export interface IStory extends Document {
  title: string; // Group title (internal or displayed as fallback)
  category: string;
  pages: IStoryPage[];
  status: string;
  views: number;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  viewedBy: string[]; // Can store user IDs or device/session IDs
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StoryPageSchema: Schema = new Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const StorySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    pages: { type: [StoryPageSchema], required: true },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    viewedBy: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStory>('Story', StorySchema);
