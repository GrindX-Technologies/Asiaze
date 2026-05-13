import { Request, Response } from 'express';
import Story from '../models/Story';

export const getStories = async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;
    let query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    const stories = await Story.find(query).sort({ createdAt: -1 }).populate('author', 'name avatar');
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error });
  }
};

export const getStoryById = async (req: Request, res: Response) => {
  try {
    const story = await Story.findById(req.params.id).populate('author', 'name avatar');
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching story', error });
  }
};

export const createStory = async (req: Request, res: Response) => {
  try {
    const { title, category, pages, status } = req.body;
    const author = (req as any).user._id;

    const story = new Story({
      title,
      category,
      pages,
      status: status || 'published',
      author,
    });

    await story.save();
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error creating story', error });
  }
};

export const updateStory = async (req: Request, res: Response) => {
  try {
    const { title, category, pages, status } = req.body;
    
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { title, category, pages, status },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error updating story', error });
  }
};

export const updateStoryStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['published', 'draft'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error updating story status', error });
  }
};

export const deleteStory = async (req: Request, res: Response) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting story', error });
  }
};

export const toggleLikeStory = async (req: Request, res: Response) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const userId = (req as any).user._id;
    const isLikedIndex = story.likedBy.findIndex((id) => id.toString() === userId.toString());

    if (isLikedIndex !== -1) {
      story.likedBy.splice(isLikedIndex, 1);
      story.likes = Math.max(0, (story.likes || 0) - 1);
    } else {
      story.likedBy.push(userId);
      story.likes = (story.likes || 0) + 1;
    }

    const updatedStory = await story.save();
    res.json(updatedStory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const recordStoryView = async (req: Request, res: Response) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const userIdOrDeviceId = req.body.deviceId || ((req as any).user ? (req as any).user._id.toString() : null);

    if (!userIdOrDeviceId) {
      return res.status(400).json({ message: 'Missing deviceId or user auth' });
    }

    if (!story.viewedBy.includes(userIdOrDeviceId)) {
      story.viewedBy.push(userIdOrDeviceId);
      story.views = (story.views || 0) + 1;
      await story.save();
    }

    res.json(story);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
