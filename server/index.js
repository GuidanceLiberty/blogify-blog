import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import connectDB from "./db/connectDB.js";

// Routes
import postRoute from './route/post.route.js';
import commentRoutes from './route/comment.route.js';
import authRoute from "./route/auth.route.js";
import categoryRoute from "./route/category.route.js";
import uploadRoute from './route/upload.route.js';

dotenv.config();
const app = express();

// ✅ Allow dev + prod frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://blogify-blog.onrender.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// ✅ ROUTES
app.use('/api/auth', authRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoute);
console.log("✅ Upload route is mounted at /api/upload");

// ✅ Error handler for Multer file size
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: "File too large. Max size is 2MB.",
    });
  }
  next(err);
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err);

  const message =
    err?.details?.[0]?.message || // Joi or validation error
    err?.message ||               // General error
    'Something went wrong';       // Fallback

  res.status(500).json({
    success: false,
    message,
  });
});

// ✅ Start server
const port = process.env.PORT || 9000;
app.listen(port, () => {
  connectDB();
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
