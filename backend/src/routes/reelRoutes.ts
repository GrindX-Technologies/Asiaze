import express from 'express';
import { getReels, createReel, getReelById, updateReel, deleteReel, toggleLikeReel } from '../controllers/reelController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getReels)
  .post(protect, admin, createReel);

router.route('/:id/like')
  .put(protect, toggleLikeReel);

router.route('/:id')
  .get(getReelById)
  .put(protect, admin, updateReel)
  .delete(protect, admin, deleteReel);

export default router;
