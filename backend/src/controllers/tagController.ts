import { Request, Response } from 'express';
import Tag from '../models/Tag';

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await Tag.find({}).sort({ createdAt: -1 });
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a tag
// @route   POST /api/tags
// @access  Private/Admin
export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, status } = req.body;
    
    const tagExists = await Tag.findOne({ slug });
    if (tagExists) {
      res.status(400).json({ message: 'Tag already exists' });
      return;
    }

    const tag = new Tag({
      name,
      slug,
      status: status || 'active'
    });

    const createdTag = await tag.save();
    res.status(201).json(createdTag);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a tag
// @route   PUT /api/tags/:id
// @access  Private/Admin
export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    const { name, slug, status } = req.body;
    if (name) tag.name = name;
    if (slug) tag.slug = slug;
    if (status) tag.status = status;

    const updatedTag = await tag.save();
    res.json(updatedTag);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private/Admin
export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    await tag.deleteOne();
    res.json({ message: 'Tag removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};