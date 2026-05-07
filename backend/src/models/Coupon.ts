import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  title: string;
  appLink: string;
  imageUrl?: string;
  requiredPoints: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true, default: 'Reward' },
    appLink: { type: String, required: true },
    imageUrl: { type: String },
    requiredPoints: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>('Coupon', couponSchema);
