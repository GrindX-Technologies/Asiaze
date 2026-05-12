import { Request, Response } from 'express';
import Reel from '../models/Reel';

import User from '../models/User';

// @desc    Get all reels
// @route   GET /api/reels
// @access  Public
export const getReels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // Default to active for public feeds
      query.status = 'active';
    }

    const reels = await Reel.find(query).populate('uploader', 'name avatar').sort({ createdAt: -1 });
    res.json(reels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a reel
// @route   POST /api/reels
// @access  Private/Admin
export const createReel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, videoUrl, thumbnailUrl, articleLink, status } = req.body;
    
    const reel = new Reel({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      articleLink,
      uploader: (req as any).user._id,
      status
    });

    const createdReel = await reel.save();
    res.status(201).json(createdReel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reel by ID
// @route   GET /api/reels/:id
// @access  Public
export const getReelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const reel = await Reel.findById(req.params.id).populate('uploader', 'name avatar');
    if (reel) {
      res.json(reel);
    } else {
      res.status(404).json({ message: 'Reel not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a reel
// @route   PUT /api/reels/:id
// @access  Private/Admin
export const updateReel = async (req: Request, res: Response): Promise<void> => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      res.status(404).json({ message: 'Reel not found' });
      return;
    }

    reel.title = req.body.title || reel.title;
    reel.description = req.body.description !== undefined ? req.body.description : reel.description;
    reel.videoUrl = req.body.videoUrl || reel.videoUrl;
    reel.thumbnailUrl = req.body.thumbnailUrl !== undefined ? req.body.thumbnailUrl : reel.thumbnailUrl;
    reel.articleLink = req.body.articleLink !== undefined ? req.body.articleLink : reel.articleLink;
    reel.status = req.body.status || reel.status;

    const updatedReel = await reel.save();
    res.json(updatedReel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Private/Admin
export const deleteReel = async (req: Request, res: Response): Promise<void> => {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (!reel) {
      res.status(404).json({ message: 'Reel not found' });
      return;
    }
    res.json({ message: 'Reel removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike a reel
// @route   PUT /api/reels/:id/like
// @access  Private
export const toggleLikeReel = async (req: Request, res: Response): Promise<void> => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      res.status(404).json({ message: 'Reel not found' });
      return;
    }

    const userId = (req as any).user._id;
    const isLikedIndex = reel.likedBy.findIndex((id) => id.toString() === userId.toString());

    if (isLikedIndex !== -1) {
      // User already liked it, so unlike it
      reel.likedBy.splice(isLikedIndex, 1);
      reel.likes = Math.max(0, (reel.likes || 0) - 1);
      await User.findByIdAndUpdate(userId, { $pull: { likedReels: reel._id } });
    } else {
      // User hasn't liked it, so like it
      reel.likedBy.push(userId);
      reel.likes = (reel.likes || 0) + 1;
      await User.findByIdAndUpdate(userId, { $addToSet: { likedReels: reel._id } });
    }

    const updatedReel = await reel.save();
    res.json({ likes: updatedReel.likes, isLiked: isLikedIndex === -1 });
  } catch (error: any) {
    console.error('Error toggling like for reel:', error);
    res.status(500).json({ message: error.message });
  }
};
