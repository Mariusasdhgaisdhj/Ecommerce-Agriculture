import express from 'express';
import { requireSignIn, isAdmin } from '../middlewares/authMiddleware.js';
import {
  createOrderController,
  buyNowController,
  getUserOrdersController,
  getOrderDetailsController,
} from '../controllers/orderController.js';

const router = express.Router();

// CREATE ORDER FROM CART || POST
router.post('/create', requireSignIn, createOrderController);

// BUY NOW (IMMEDIATE CHECKOUT) || POST
router.post('/buy-now', requireSignIn, buyNowController);

// GET USER ORDERS || GET
router.get('/user-orders', requireSignIn, getUserOrdersController);

// GET ORDER DETAILS || GET
router.get('/details/:orderId', requireSignIn, getOrderDetailsController);

export default router; 