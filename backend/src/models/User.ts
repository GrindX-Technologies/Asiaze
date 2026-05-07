import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  avatar?: string;
  phone?: string;
  state?: string;
  preferredCategories?: mongoose.Types.ObjectId[];
  referralId: string;
  referredBy?: mongoose.Types.ObjectId;
  points: number;
  isBlocked: boolean;
  deviceToken?: string;
  loginHistory: Array<{
    ip: string;
    device: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for social login users
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    avatar: { type: String },
    phone: { type: String },
    state: { type: String },
    preferredCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    referralId: { type: String, unique: true, required: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    points: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    deviceToken: { type: String },
    loginHistory: [
      {
        ip: { type: String },
        device: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
