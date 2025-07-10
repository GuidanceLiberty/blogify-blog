import express from 'express';
import { createPost, deletePost, getLikedPosts, getPost, getPosts, getSearchPosts, getSinglePost, likeUnlikePost, updatePost } from '../controllers/post.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/search', getSearchPosts);
router.use(verifyToken);

router.get('/', getPosts);
router.post('/', createPost);
router.get('/:slug', getPost);
router.get('/single-post/:slug', getSinglePost);
router.put('/:slug', updatePost);
router.delete('/:slug', deletePost);
router.post('/like-and-unlike-post', likeUnlikePost);
router.get('/likes/:user_id', getLikedPosts);

export default router