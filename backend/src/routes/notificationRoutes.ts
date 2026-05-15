import express from 'express';
import { sendPushNotification, getPastNotifications } from '../controllers/notificationController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/send', protect, admin, sendPushNotification);
router.get('/past', protect, admin, getPastNotifications);

export default router;
