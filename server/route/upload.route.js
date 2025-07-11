import express from 'express';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  return res.status(200).json({ imageUrl: req.file.path });
});

export default router;
