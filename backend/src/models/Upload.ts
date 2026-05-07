import mongoose, { Document, Schema } from 'mongoose';

export interface IUpload extends Document {
  user: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
}

const uploadSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUpload>('Upload', uploadSchema);