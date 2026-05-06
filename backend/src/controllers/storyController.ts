import { Request, Response } from 'express';
import Story from '../models/Story';

export const getStories = async (req: Request, res: Response) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 }).populate('author', 'name avatar');
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
