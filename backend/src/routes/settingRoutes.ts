import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getSettings) // Make public so mobile app can fetch configs (like ad frequency)
  .post(protect, admin, updateSetting);

export default router;
