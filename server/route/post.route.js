import express from 'express';
import {
  createPost,
  deletePost,
  getLikedPosts,
  getPost,
  getPosts,
  getSearchPosts,
  getSinglePost,
  likeUnlikePost,
  updatePost,
} from '../controllers/post.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/search', getSearchPosts);
router.use(verifyToken);

// Order matters — more specific routes first
router.get('/single-post/:slug', getSinglePost);
router.get('/likes/:user_id', getLikedPosts);

router.get('/', getPosts);
router.post('/', createPost);
router.get('/:slug', getPost); // should come after /single-post and /likes
router.put('/:slug', updatePost);
router.delete('/:slug', deletePost);
router.post('/like-and-unlike-post', likeUnlikePost);

export default router;
