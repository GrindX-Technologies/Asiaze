import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, admin, getSettings)
  .post(protect, admin, updateSetting);

export default router;
