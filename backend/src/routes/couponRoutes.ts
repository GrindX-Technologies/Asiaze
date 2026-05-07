import express from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getActiveCoupons } from '../controllers/couponController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/active')
  .get(protect, getActiveCoupons);

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;
