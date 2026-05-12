import { Request, Response } from 'express';
import Category from '../models/Category';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, image, description, status } = req.body;
    
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const category = new Category({
      name, slug, image, description, status
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    category.name = req.body.name || category.name;
    category.slug = req.body.slug || category.slug;
    category.image = req.body.image !== undefined ? req.body.image : category.image;
    category.description = req.body.description !== undefined ? req.body.description : category.description;
    category.status = req.body.status || category.status;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ message: 'Category removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
