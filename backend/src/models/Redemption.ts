import mongoose, { Schema, Document } from 'mongoose';

export interface IRedemption extends Document {
  user: mongoose.Types.ObjectId;
  coupon: mongoose.Types.ObjectId;
  pointsUsed: number;
  referredBy?: mongoose.Types.ObjectId;
  status: 'successful' | 'pending' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const redemptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
    pointsUsed: { type: Number, required: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['successful', 'pending', 'failed'], default: 'successful' },
  },
  { timestamps: true }
);

export default mongoose.model<IRedemption>('Redemption', redemptionSchema);
