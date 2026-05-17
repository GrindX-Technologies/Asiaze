import { Request, Response } from 'express';
import mongoose from 'mongoose';
import News from '../models/News';
import User from '../models/User';
import Setting from '../models/Setting';

// @desc    Get all news
// @route   GET /api/news
// @access  Public
export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, state, isBreaking } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (state) query.states = state;
    if (isBreaking !== undefined) query.isBreaking = isBreaking === 'true';

    let newsQuery = News.find(query).populate('category author tags').sort({ createdAt: -1 });

    // Enforce breaking news limit if requested
    if (isBreaking === 'true') {
      const limitSetting = await Setting.findOne({ key: 'breaking_news_limit' });
      const limit = limitSetting && limitSetting.value ? Number(limitSetting.value) : 5;
      newsQuery = newsQuery.limit(limit);
    }

    const news = await newsQuery;
    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single news
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const news = await News.findById(req.params.id).populate('category author tags');
    if (news) {
      res.json(news);
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
export const createNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, content, summary, coverImage, sourceUrl, language, source, states, category, tags, status, isBreaking } = req.body;
    
    const news = new News({
      title,
      slug,
      content,
      summary,
      coverImage,
      sourceUrl,
      language,
      source,
      states,
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

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
export const updateNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }

    const { title, slug, content, summary, coverImage, sourceUrl, language, source, states, category, tags, status, isBreaking } = req.body;
    
    if (title) news.title = title;
    if (slug) news.slug = slug;
    if (content !== undefined) news.content = content;
    if (summary !== undefined) news.summary = summary;
    if (coverImage !== undefined) news.coverImage = coverImage;
    if (sourceUrl !== undefined) news.sourceUrl = sourceUrl;
    if (language) news.language = language;
    if (source !== undefined) news.source = source;
    if (states) news.states = states;
    if (category) news.category = category;
    if (tags) news.tags = tags;
    if (status) {
      if (news.status !== 'published' && status === 'published') {
        news.publishedAt = new Date();
      }
      news.status = status;
    }
    if (isBreaking !== undefined) news.isBreaking = isBreaking;

    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
export const deleteNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    // 1. Check for valid ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: 'Invalid News ID format. Cannot proceed with deletion.' });
      return;
    }

    // 2. Find the news item
    const news = await News.findById(id);
    if (!news) {
      res.status(404).json({ message: 'News article not found. It may have already been deleted.' });
      return;
    }

    // 3. Rollback mechanism placeholder: 
    // In a system with complex foreign keys, we would delete related entities (e.g. comments/bookmarks)
    // inside a MongoDB transaction. For now, we perform the deletion safely.
    await news.deleteOne();

    res.status(200).json({ message: 'News article successfully deleted.' });
  } catch (error: any) {
    console.error(`Failed to delete news article (ID: ${req.params.id}):`, error);
    res.status(500).json({ 
      message: 'An internal server error occurred while deleting the news article.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Like/Unlike a news article
// @route   PUT /api/news/:id/like
// @access  Private
export const toggleLikeNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      res.status(404).json({ message: 'News article not found' });
      return;
    }

    const userId = (req as any).user._id;
    const isLikedIndex = news.likedBy.findIndex((id) => id.toString() === userId.toString());

    if (isLikedIndex !== -1) {
      // User already liked it, so unlike it
      news.likedBy.splice(isLikedIndex, 1);
      news.likes = Math.max(0, (news.likes || 0) - 1);
      await User.findByIdAndUpdate(userId, { $pull: { likedNews: news._id } });
    } else {
      // User hasn't liked it, so like it
      news.likedBy.push(userId);
      news.likes = (news.likes || 0) + 1;
      await User.findByIdAndUpdate(userId, { $addToSet: { likedNews: news._id } });
    }

    const updatedNews = await news.save();
    res.json({ likes: updatedNews.likes, isLiked: isLikedIndex === -1 });
  } catch (error: any) {
    console.error('Error toggling like for news:', error);
    res.status(500).json({ message: error.message });
  }
};
