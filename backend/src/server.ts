import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';
import { initFirebase } from './config/firebaseConfig';

// Route Imports
import authRoutes from './routes/authRoutes';
import newsRoutes from './routes/newsRoutes';
import categoryRoutes from './routes/categoryRoutes';
import reelRoutes from './routes/reelRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import settingRoutes from './routes/settingRoutes';
import couponRoutes from './routes/couponRoutes';
import storyRoutes from './routes/storyRoutes';
import tagRoutes from './routes/tagRoutes';
import adRoutes from './routes/adRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

// Models
import './models/Tag';

dotenv.config();

// Connect to MongoDB
connectDB();
initFirebase();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Base Route
app.get('/', (_req: Request, res: Response) => {
  res.send('ASIAZE Backend API is running...');
});

// Error Handling Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

