import express from 'express';
import { getNews, getNewsById, createNews, updateNews, deleteNews, toggleLikeNews } from '../controllers/newsController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, admin, createNews);

router.route('/:id/like')
  .put(protect, toggleLikeNews);

router.route('/:id')
  .get(getNewsById)
  .put(protect, admin, updateNews)
  .delete(protect, admin, deleteNews);

export default router;
