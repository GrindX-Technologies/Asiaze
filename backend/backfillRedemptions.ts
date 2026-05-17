import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import User from './src/models/User';
import Coupon from './src/models/Coupon';
import Redemption from './src/models/Redemption';

async function backfill() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB');

    const users = await User.find({ redeemedCoupons: { $exists: true, $not: { $size: 0 } } }).populate('redeemedCoupons');
    
    for (const user of users) {
      for (const couponObj of user.redeemedCoupons) {
        const coupon = couponObj as any;
        // Check if already exists
        const exists = await Redemption.findOne({ user: user._id, coupon: coupon._id });
        if (!exists) {
          await Redemption.create({
            user: user._id,
            coupon: coupon._id,
            pointsUsed: coupon.requiredPoints || 0,
            referredBy: user.referredBy,
            status: 'successful',
            createdAt: new Date(), // fallback to current date for legacy
            updatedAt: new Date()
          });
          console.log(`Created redemption for User ${user._id} and Coupon ${coupon._id}`);
        }
      }
    }

    console.log('Backfill complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

backfill();