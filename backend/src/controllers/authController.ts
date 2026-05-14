import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, avatar, googleId } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      // User exists, update avatar if empty and log in
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
      
      if (user.isBlocked) {
        res.status(403).json({ message: 'User account is blocked' });
        return;
      }

      user.loginHistory.push({
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        device: req.headers['user-agent'] || 'unknown',
        date: new Date(),
      });
      await user.save();

      await user.populate('preferredCategories');
      const categoriesList = (user.preferredCategories || []).map((c: any) => c.name);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        avatar: user.avatar,
        preferredCategories: categoriesList,
        token: generateToken(user._id as any),
      });
    } else {
      // Create new user
      const referralId = `REF${Math.floor(100000 + Math.random() * 900000)}`;

      user = await User.create({
        name,
        email,
        avatar,
        referralId,
        role: 'user',
        // password is not required for social login
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        referralId: user.referralId,
        token: generateToken(user._id as any),
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

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

      await user.populate('preferredCategories');
      const categoriesList = (user.preferredCategories || []).map((c: any) => c.name);

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
        
        // Fetch dynamic pointsPerReferral setting
        let pointsToAdd = 10; // fallback
        try {
          const { default: Setting } = await import('../models/Setting');
          const setting = await Setting.findOne({ key: 'pointsPerReferral' });
          if (setting && setting.value) {
            pointsToAdd = Number(setting.value);
          }
        } catch (err) {
          console.error('Error fetching pointsPerReferral setting:', err);
        }

        const MAX_POINTS = 10000000;
        referrer.points = Math.min(MAX_POINTS, Math.max(0, referrer.points + pointsToAdd));
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
      
      if (req.body.avatar !== undefined) {
        user.avatar = req.body.avatar;
      }
      if (req.body.phone !== undefined) {
        user.phone = req.body.phone;
      }
      if (req.body.state !== undefined) {
        user.state = req.body.state;
      }
      
      if (req.body.preferredCategories !== undefined && Array.isArray(req.body.preferredCategories)) {
        try {
          const { default: Category } = await import('../models/Category');
          const categories = await Category.find({ name: { $in: req.body.preferredCategories } });
          user.preferredCategories = categories.map(c => c._id as any);
        } catch (err) {
          console.error('Error finding categories:', err);
        }
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      await updatedUser.populate('preferredCategories');
      const categoriesList = (updatedUser.preferredCategories || []).map((c: any) => c.name);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        state: updatedUser.state,
        role: updatedUser.role,
        preferredCategories: categoriesList,
        token: generateToken(updatedUser._id as any),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user will be populated by authMiddleware
    const user = await User.findById((req as any).user._id)
      .select('-password')
      .populate('preferredCategories')
      .populate('savedNews')
      .populate('savedReels');
    
    if (user) {
      const userData = user.toObject();
      userData.preferredCategories = (user.preferredCategories || []).map((c: any) => c.name);
      res.json(userData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 to prevent email enumeration
      res.json({ message: 'If that email address is in our database, we will send you an email to reset your password.' });
      return;
    }

    // In a real application, you would generate a reset token and send an email here.
    // For now, we'll mock the success response.
    res.json({ message: 'If that email address is in our database, we will send you an email to reset your password.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleSaveNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const newsId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isSaved = user.savedNews.includes(newsId as any);
    if (isSaved) {
      user.savedNews = user.savedNews.filter(id => id.toString() !== newsId);
    } else {
      user.savedNews.push(newsId as any);
    }
    
    await user.save();
    res.json({ isSaved: !isSaved, savedNews: user.savedNews });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleSaveReel = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const reelId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isSaved = user.savedReels.includes(reelId as any);
    if (isSaved) {
      user.savedReels = user.savedReels.filter(id => id.toString() !== reelId);
    } else {
      user.savedReels.push(reelId as any);
    }
    
    await user.save();
    res.json({ isSaved: !isSaved, savedReels: user.savedReels });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleSaveAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const adId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isSaved = user.savedAds.includes(adId as any);
    if (isSaved) {
      user.savedAds = user.savedAds.filter(id => id.toString() !== adId);
    } else {
      user.savedAds.push(adId as any);
    }
    
    await user.save();
    res.json({ isSaved: !isSaved, savedAds: user.savedAds });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
