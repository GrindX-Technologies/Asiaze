import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) {
        res.status(403).json({ message: 'User account is blocked' });
        return;
      }

      // Optional: Log login history
      user.loginHistory.push({
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        device: req.headers['user-agent'] || 'unknown',
        date: new Date(),
      });
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        avatar: user.avatar,
        token: generateToken(user._id as any),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, state, referredByCode } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Handle Referral logic
    let referredByUserId = undefined;
    if (referredByCode) {
      const referrer = await User.findOne({ referralId: referredByCode });
      if (referrer) {
        referredByUserId = referrer._id;
        // Optionally add points to referrer here
        referrer.points += 10; // example points
        await referrer.save();
      }
    }

    // Generate unique referralId for new user
    const referralId = `REF${Math.floor(100000 + Math.random() * 900000)}`;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      state,
      referralId,
      referredBy: referredByUserId,
      role: 'user', // default
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralId: user.referralId,
        token: generateToken(user._id as any),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id as any),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user will be populated by authMiddleware
    const user = await User.findById((req as any).user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
