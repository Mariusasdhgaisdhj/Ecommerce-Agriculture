import express from 'express';
import { requireSignIn } from '../middlewares/authMiddleware.js';
import {
  createForumPostController,
  getForumPostsController,
  getSingleForumPostController,
  addCommentController,
  voteForumPostController,
  getForumCategoriesController,
} from '../controllers/forumController.js';

const router = express.Router();

// CREATE FORUM POST || POST
router.post('/create', requireSignIn, createForumPostController);

// GET ALL FORUM POSTS || GET
router.get('/posts', getForumPostsController);

// GET SINGLE FORUM POST || GET
router.get('/post/:id', getSingleForumPostController);

// ADD COMMENT TO FORUM POST || POST
router.post('/post/:id/comment', requireSignIn, addCommentController);

// VOTE ON FORUM POST || PUT
router.put('/post/:id/vote', requireSignIn, voteForumPostController);

// GET FORUM CATEGORIES || GET
router.get('/categories', getForumCategoriesController);

export default router; 