import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'all' | 'specific_users' | 'topic';
  targetUsers?: mongoose.Types.ObjectId[];
  topic?: string;
  imageUrl?: string;
  status: 'pending' | 'sent' | 'failed';
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
    targetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    topic: { type: String },
    imageUrl: { type: String },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
