import { Request, Response } from 'express';
import Reel from '../models/Reel';

// @desc    Get all reels
// @route   GET /api/reels
// @access  Public
export const getReels = async (req: Request, res: Response): Promise<void> => {
  try {
    const reels = await Reel.find({ status: 'active' }).populate('uploader', 'name avatar').sort({ createdAt: -1 });
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
    const { title, description, videoUrl, thumbnailUrl, status } = req.body;
    
    const reel = new Reel({
      title,
      description,
      videoUrl,
      thumbnailUrl,
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
