import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware';
import Upload from '../models/Upload';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Create an isolated directory for the user
    const userId = (req as any).user?._id?.toString() || 'anonymous';
    const userDir = path.join('uploads', userId);
    
    // Ensure the directory exists
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const filetypes = /jpg|jpeg|png|webp|mp4|mov|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images and Videos only!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post('/', protect, upload.single('file'), async (req: Request, res: Response) => {
  if (req.file) {
    try {
      const userId = (req as any).user?._id?.toString() || 'anonymous';
      const fileUrl = `/uploads/${userId}/${req.file.filename}`;
      
      // Store in Data Collection
      if (userId !== 'anonymous') {
        await Upload.create({
          user: userId,
          fileName: req.file.filename,
          fileUrl: fileUrl,
          fileType: req.file.mimetype
        });
      }

      res.json({
        message: 'File uploaded successfully',
        url: fileUrl,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Error saving file record', error: error.message });
    }
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

export default router;
