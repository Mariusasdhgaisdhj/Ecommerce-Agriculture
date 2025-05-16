import express from 'express';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import {
  createCategoryController,
  updateCategoryController,
  getCategoriesController,
  getSingleCategoryController,
  deleteCategoryController,
} from '../controllers/categoryController.js';

const router = express.Router();

// Routes
// CREATE CATEGORY || POST
router.post('/create-category', requireSignIn, isAdmin, createCategoryController);

// UPDATE CATEGORY || PUT
router.put('/update-category/:id', requireSignIn, isAdmin, updateCategoryController);

// GET ALL CATEGORIES || GET
router.get('/get-categories', getCategoriesController);

// GET SINGLE CATEGORY || GET
router.get('/single-category/:slug', getSingleCategoryController);

// DELETE CATEGORY || DELETE
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController);

export default router; 