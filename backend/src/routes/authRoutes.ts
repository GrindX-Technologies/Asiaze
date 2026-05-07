import express from 'express';
import { login, register, getProfile, updateProfile, forgotPassword, googleAuth } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
