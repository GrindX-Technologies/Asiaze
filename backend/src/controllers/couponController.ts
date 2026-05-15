import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Coupon from '../models/Coupon';
import User from '../models/User';

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, title, appLink, imageUrl, requiredPoints, isActive } = req.body;
    const couponExists = await Coupon.findOne({ code });

    if (couponExists) {
      res.status(400).json({ message: 'Coupon code already exists' });
      return;
    }

    const coupon = new Coupon({
      code,
      title: title || 'Reward',
      appLink,
      imageUrl,
      requiredPoints,
      isActive,
      createdBy: (req as any).user._id
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      coupon.code = req.body.code || coupon.code;
      coupon.title = req.body.title || coupon.title;
      coupon.appLink = req.body.appLink || coupon.appLink;
      coupon.imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl : coupon.imageUrl;
      coupon.requiredPoints = req.body.requiredPoints !== undefined ? req.body.requiredPoints : coupon.requiredPoints;
      coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;

      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (coupon) {
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const redeemCoupon = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const couponId = req.params.id;
    const userId = (req as any).user._id;

    const coupon = await Coupon.findById(couponId).session(session);
    if (!coupon || !coupon.isActive) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: 'Coupon not found or inactive' });
      return;
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already redeemed
    if (user.redeemedCoupons && user.redeemedCoupons.includes(couponId as any)) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: 'Coupon already redeemed' });
      return;
    }

    // Check points
    if (user.points < coupon.requiredPoints) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: 'Insufficient points' });
      return;
    }

    // Deduct points, add to usedPoints, and add to redeemedCoupons
    user.points -= coupon.requiredPoints;
    user.usedPoints = (user.usedPoints || 0) + coupon.requiredPoints;
    user.redeemedCoupons.push(couponId as any);

    await user.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Coupon successfully redeemed', points: user.points, usedPoints: user.usedPoints, redeemedCoupons: user.redeemedCoupons });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error redeeming coupon:', error);
    res.status(500).json({ message: 'Failed to redeem coupon', error: error.message });
  }
};
