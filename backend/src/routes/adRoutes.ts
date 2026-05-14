import express from 'express';
import { getAds, createAd, updateAd, deleteAd } from '../controllers/adController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getAds) // public or protected? depends on app. We can leave it public to fetch ads in mobile app
  .post(protect, admin, createAd);

router.route('/:id')
  .put(protect, admin, updateAd)
  .delete(protect, admin, deleteAd);

export default router;
