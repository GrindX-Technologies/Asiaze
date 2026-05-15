import { Request, Response } from 'express';
import { getMessaging } from '../config/firebaseConfig';
import User from '../models/User';
import Notification from '../models/Notification';

export const sendPushNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, body, actionLink, targetAudience } = req.body;
    const adminId = (req as any).user._id;

    if (!title || !body) {
      res.status(400).json({ message: 'Title and body are required' });
      return;
    }

    let query: any = { deviceToken: { $exists: true, $ne: '' } };

    if (targetAudience === 'active') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query['loginHistory.date'] = { $gte: thirtyDaysAgo };
    } else if (targetAudience === 'inactive') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query['loginHistory.date'] = { $lt: thirtyDaysAgo };
    }

    const users = await User.find(query).select('deviceToken');
    const tokens = users.map((u) => u.deviceToken).filter(Boolean) as string[];

    if (tokens.length === 0) {
      // Save failed notification to history
      await Notification.create({
        title,
        message: body,
        type: 'all',
        targetAudience: targetAudience || 'all',
        actionLink: actionLink || '',
        status: 'failed',
        sentBy: adminId,
        sentAt: new Date(),
        successCount: 0,
        failureCount: 0
      });
      res.status(400).json({ message: 'No devices found for the specified target audience' });
      return;
    }

    const messaging = getMessaging();

    const messagePayload = {
      notification: {
        title,
        body,
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        actionLink: actionLink || '',
      },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(messagePayload);

    // Save success/partial success to history
    await Notification.create({
      title,
      message: body,
      type: 'all',
      targetAudience: targetAudience || 'all',
      actionLink: actionLink || '',
      status: response.successCount > 0 ? 'sent' : 'failed',
      sentBy: adminId,
      sentAt: new Date(),
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    res.status(200).json({
      message: 'Push notification sent',
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    try {
      await Notification.create({
        title: req.body.title || 'Unknown',
        message: req.body.body || 'Unknown error',
        type: 'all',
        targetAudience: req.body.targetAudience || 'all',
        status: 'failed',
        sentBy: (req as any).user._id,
        sentAt: new Date()
      });
    } catch (e) {}
    res.status(500).json({ message: 'Failed to send notification', error: error.message });
  }
};

export const getPastNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const target = req.query.target as string;
    const status = req.query.status as string;
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (target && target !== 'all') {
      query.targetAudience = target;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const count = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ sentAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sentBy', 'name email');

    res.json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
