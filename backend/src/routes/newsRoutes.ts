import express from 'express';
import { getNews, createNews } from '../controllers/newsController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, admin, createNews);

export default router;
