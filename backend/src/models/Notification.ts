import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'all' | 'specific_users' | 'topic';
  targetAudience?: string;
  targetUsers?: mongoose.Types.ObjectId[];
  topic?: string;
  imageUrl?: string;
  actionLink?: string;
  status: 'pending' | 'sent' | 'failed';
  successCount?: number;
  failureCount?: number;
  opens?: number;
  clicks?: number;
  sentBy: mongoose.Types.ObjectId;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['all', 'specific_users', 'topic'], required: true },
    targetAudience: { type: String },
    targetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    topic: { type: String },
    imageUrl: { type: String },
    actionLink: { type: String },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    opens: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
