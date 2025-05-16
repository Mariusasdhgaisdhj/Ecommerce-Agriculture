import express from 'express';
import { requireSignIn, isAdmin, isSeller } from '../middlewares/authMiddleware.js';
import {
  applySellerController,
  getSellerStatusController,
  getSellerApplicationsController,
  updateSellerStatusController,
  getSellerProductsController,
} from '../controllers/sellerController.js';

const router = express.Router();

// APPLY TO BE A SELLER || POST
router.post('/apply', requireSignIn, applySellerController);

// GET SELLER STATUS || GET
router.get('/status', requireSignIn, getSellerStatusController);

// GET SELLER PRODUCTS || GET
router.get('/products', requireSignIn, isSeller, getSellerProductsController);

// ADMIN ROUTES
// GET ALL SELLER APPLICATIONS || GET
router.get('/applications', requireSignIn, isAdmin, getSellerApplicationsController);

// UPDATE SELLER APPLICATION STATUS || PUT
router.put('/update-status', requireSignIn, isAdmin, updateSellerStatusController);

export default router; 