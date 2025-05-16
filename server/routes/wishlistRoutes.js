import express from 'express';
import { requireSignIn } from '../middlewares/authMiddleware.js';
import {
  toggleWishlistController,
  getWishlistController,
  checkWishlistController,
} from '../controllers/wishlistController.js';

const router = express.Router();

// TOGGLE PRODUCT IN WISHLIST || POST
router.post('/toggle', requireSignIn, toggleWishlistController);

// GET USER WISHLIST || GET
router.get('/get-wishlist', requireSignIn, getWishlistController);

// CHECK IF PRODUCT IS IN WISHLIST || GET
router.get('/check/:productId', requireSignIn, checkWishlistController);

export default router; 