import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Add points for sharing content
// @route   POST /api/users/share
// @access  Private
export const addSharePoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if item was already shared recently to prevent spam (simple debounce could be implemented here, skipping for basic scope)
    // Fetch points_for_sharing from settings
    let pointsToAdd = 15; // default fallback
    try {
      const { default: Setting } = await import('../models/Setting');
      const setting = await Setting.findOne({ key: 'points_for_sharing' });
      if (setting && typeof setting.value === 'number' && setting.value > 0) {
        pointsToAdd = setting.value;
      }
    } catch (err) {
      console.error('Error fetching points_for_sharing:', err);
    }

    // Add points but cap at a max value (e.g. 10,000,000 to prevent overflow)
    const MAX_POINTS = 10000000;
    user.points = Math.min(MAX_POINTS, Math.max(0, user.points + pointsToAdd));
    
    await user.save();

    res.json({ message: 'Points added successfully', points: user.points });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// @route   GET /api/users/rewards
// @access  Private
export const getUserRewards = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id).select('points usedPoints referralId redeemedCoupons');
    if (user) {
      res.json({
        points: user.points,
        usedPoints: user.usedPoints || 0,
        referralId: user.referralId,
        redeemedCoupons: user.redeemedCoupons || [],
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only return app users (role: 'user'), exclude admin users
    const users = await User.find({ role: 'user' })
      .select('-password')
      .populate('redeemedCoupons', 'title requiredPoints discount type isActive createdAt')
      .sort({ createdAt: -1 });

    // Ensure usedPoints is accurate by summing up redeemed coupons if there's a mismatch
    const sanitizedUsers = users.map(user => {
      const userObj = user.toObject();
      if (userObj.redeemedCoupons && Array.isArray(userObj.redeemedCoupons)) {
        const calculatedUsedPoints = userObj.redeemedCoupons.reduce((sum: number, coupon: any) => sum + (coupon.requiredPoints || 0), 0);
        userObj.usedPoints = calculatedUsedPoints; // Enforce calculated total
      } else {
        userObj.usedPoints = 0;
      }
      return userObj;
    });

    res.json(sanitizedUsers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create user (admin)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const referralId = `REF${Math.floor(100000 + Math.random() * 900000)}`;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      referralId
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.role = req.body.role || user.role;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status (block/unblock)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isBlocked = req.body.status === 'blocked';
      user.role = req.body.role || user.role;
      
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.isBlocked ? 'blocked' : 'active',
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update user status
// @route   PUT /api/users/bulk-status
// @access  Private/Admin
export const bulkUpdateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userIds, status } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ message: 'No users selected' });
      return;
    }

    const isBlocked = status === 'blocked';

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isBlocked } }
    );

    res.json({ message: `Users successfully updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete users (single or bulk)
// @route   DELETE /api/users/:id OR POST /api/users/bulk-delete
// @access  Private/Admin
export const deleteUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userIds } = req.body;
    
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      // Bulk delete
      await User.deleteMany({ _id: { $in: userIds } });
      res.json({ message: 'Users successfully deleted' });
    } else if (req.params.id) {
      // Single delete
      const user = await User.findByIdAndDelete(req.params.id);
      if (user) {
        res.json({ message: 'User successfully deleted' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(400).json({ message: 'No users specified for deletion' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update device token for push notifications
// @route   PUT /api/users/fcm-token
// @access  Private
export const updateDeviceToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    
    if (token === undefined) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }

    const user = await User.findById((req as any).user._id);

    if (user) {
      user.deviceToken = token;
      await user.save();
      res.json({ message: 'Device token updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
