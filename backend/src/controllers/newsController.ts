import { Request, Response } from 'express';
import News from '../models/News';

// @desc    Get all news
// @route   GET /api/news
// @access  Public
export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const news = await News.find(query).populate('category author tags').sort({ createdAt: -1 });
    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
export const createNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, content, summary, coverImage, sourceUrl, language, source, category, tags, status, isBreaking } = req.body;
    
    const news = new News({
      title,
      slug,
      content,
      summary,
      coverImage,
      sourceUrl,
      language,
      source,
      author: (req as any).user._id,
      category,
      tags,
      status,
      isBreaking,
      publishedAt: status === 'published' ? new Date() : undefined
    });

    const createdNews = await news.save();
    res.status(201).json(createdNews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
