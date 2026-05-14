import express from 'express';
import { login, register, getProfile, updateProfile, forgotPassword, googleAuth, toggleSaveNews, toggleSaveReel, toggleSaveAd } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.put('/save/news/:id', protect, toggleSaveNews);
router.put('/save/reels/:id', protect, toggleSaveReel);
router.put('/save/ads/:id', protect, toggleSaveAd);

export default router;
