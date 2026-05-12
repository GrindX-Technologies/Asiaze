import express from 'express';
import { getStories, getStoryById, createStory, updateStory, deleteStory, updateStoryStatus } from '../controllers/storyController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getStories)
  .post(protect, admin, createStory);

router.route('/:id/status')
  .patch(protect, admin, updateStoryStatus);

router.route('/:id')
  .get(getStoryById)
  .put(protect, admin, updateStory)
  .delete(protect, admin, deleteStory);

export default router;
