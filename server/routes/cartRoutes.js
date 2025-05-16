import express from 'express';
import { requireSignIn } from '../middlewares/authMiddleware.js';
import {
  addToCartController,
  getCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from '../controllers/cartController.js';

const router = express.Router();

// ADD TO CART || POST
router.post('/add', requireSignIn, addToCartController);

// GET CART || GET
router.get('/get-cart', requireSignIn, getCartController);

// UPDATE CART ITEM || PUT
router.put('/update', requireSignIn, updateCartItemController);

// REMOVE CART ITEM || DELETE
router.delete('/remove/:productId', requireSignIn, removeCartItemController);

// CLEAR CART || DELETE
router.delete('/clear', requireSignIn, clearCartController);

export default router; 