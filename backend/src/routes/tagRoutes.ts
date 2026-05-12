import express from 'express';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getTags)
  .post(protect, admin, createTag);

router.route('/:id')
  .put(protect, admin, updateTag)
  .delete(protect, admin, deleteTag);

export default router;