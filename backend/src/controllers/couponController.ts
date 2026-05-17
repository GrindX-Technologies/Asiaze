import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Coupon from '../models/Coupon';
import User from '../models/User';

import Redemption from '../models/Redemption';

export const getAllRedemptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const redemptions = await Redemption.find()
      .populate('user', 'name email referralId')
      .populate('coupon', 'title requiredPoints discount type')
      .populate('referredBy', 'name email referralId')
      .sort({ createdAt: -1 });
    
    res.json(redemptions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

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
  try {
    const couponId = req.params.id;
    const userId = (req as any).user._id;

    const coupon = await Coupon.findById(couponId);
    if (!coupon || !coupon.isActive) {
      res.status(404).json({ message: 'Coupon not found or inactive' });
      return;
    }

    // Atomic update without requiring MongoDB Replica Sets (Transactions)
    const updatedUser: any = await User.findOneAndUpdate(
      { 
        _id: userId, 
        points: { $gte: coupon.requiredPoints },
        redeemedCoupons: { $ne: couponId }
      } as any,
      {
        $inc: { points: -coupon.requiredPoints, usedPoints: coupon.requiredPoints },
        $addToSet: { redeemedCoupons: couponId }
      },
      { new: true }
    );

    if (!updatedUser) {
      const userCheck = await User.findById(userId);
      if (!userCheck) {
        res.status(404).json({ message: 'User not found' });
      } else if (userCheck.redeemedCoupons && userCheck.redeemedCoupons.includes(couponId as any)) {
        res.status(400).json({ message: 'Coupon already redeemed' });
      } else {
        res.status(400).json({ message: 'Insufficient points' });
      }
      return;
    }

    // Create redemption record
    await Redemption.create({
      user: new mongoose.Types.ObjectId(userId),
      coupon: new mongoose.Types.ObjectId(couponId as string),
      pointsUsed: coupon.requiredPoints,
      referredBy: updatedUser.referredBy ? new mongoose.Types.ObjectId(updatedUser.referredBy.toString()) : undefined,
      status: 'successful'
    });

    res.json({ 
      message: 'Coupon successfully redeemed', 
      points: updatedUser.points, 
      usedPoints: updatedUser.usedPoints, 
      redeemedCoupons: updatedUser.redeemedCoupons 
    });
  } catch (error: any) {
    console.error('Error redeeming coupon:', error);
    res.status(500).json({ message: 'Failed to redeem coupon', error: error.message });
  }
};
