import { Request, Response } from 'express';
import Ad from '../models/Ad';
import User from '../models/User';

export const getAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, isActive } = req.query;
    const query: any = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const ads = await Ad.find(query).sort({ createdAt: -1 });
    res.json(ads);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, type, mediaUrl, linkUrl, isActive } = req.body;
    const ad = new Ad({
      title,
      type,
      mediaUrl,
      linkUrl,
      isActive,
      createdBy: (req as any).user._id,
    });
    const createdAd = await ad.save();
    res.status(201).json(createdAd);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, type, mediaUrl, linkUrl, isActive } = req.body;
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      res.status(404).json({ message: 'Ad not found' });
      return;
    }

    if (title) ad.title = title;
    if (type) ad.type = type;
    if (mediaUrl) ad.mediaUrl = mediaUrl;
    if (linkUrl !== undefined) ad.linkUrl = linkUrl;
    if (isActive !== undefined) ad.isActive = isActive;

    const updatedAd = await ad.save();
    res.json(updatedAd);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      res.status(404).json({ message: 'Ad not found' });
      return;
    }
    await Ad.deleteOne({ _id: ad._id });
    res.json({ message: 'Ad removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLikeAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      res.status(404).json({ message: 'Ad not found' });
      return;
    }

    const userId = (req as any).user._id;
    const isLikedIndex = ad.likedBy.findIndex((id) => id.toString() === userId.toString());

    if (isLikedIndex !== -1) {
      ad.likedBy.splice(isLikedIndex, 1);
      ad.likes = Math.max(0, (ad.likes || 0) - 1);
      await User.findByIdAndUpdate(userId, { $pull: { likedAds: ad._id } });
    } else {
      ad.likedBy.push(userId);
      ad.likes = (ad.likes || 0) + 1;
      await User.findByIdAndUpdate(userId, { $addToSet: { likedAds: ad._id } });
    }

    const updatedAd = await ad.save();
    res.json(updatedAd);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
