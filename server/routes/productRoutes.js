import express from 'express';
import { isAdmin, requireSignIn, isSeller } from '../middlewares/authMiddleware.js';
import {
  createProductController,
  getProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  braintreeTokenController,
  braintreePaymentController,
  searchProductController,
  filterProductsController,
  relatedProductsController,
  createProductReviewController,
} from '../controllers/productController.js';
import formidable from 'express-formidable';

const router = express.Router();

// Routes
// CREATE PRODUCT || POST - Both admin and sellers can create products
router.post(
  '/create-product',
  requireSignIn,
  (req, res, next) => {
    const user = req.user;
    // Check if user is admin or seller
    if (user.role === 1 || (user.role === 2 && user.isSeller && user.sellerStatus === 'approved')) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only admin and approved sellers can create products',
      });
    }
  },
  formidable(),
  createProductController
);

// GET ALL PRODUCTS || GET
router.get('/get-products', getProductsController);

// GET SINGLE PRODUCT || GET
router.get('/get-product/:slug', getSingleProductController);

// SEARCH PRODUCTS WITH ENHANCED FILTERS || GET
router.get('/search', searchProductController);

// FILTER PRODUCTS || POST
router.post('/filter', filterProductsController);

// RELATED PRODUCTS || GET
router.get('/related/:productId/:categoryId', relatedProductsController);

// CREATE/UPDATE REVIEW || POST
router.post('/review', requireSignIn, createProductReviewController);

// UPDATE PRODUCT || PUT - Both admin and sellers can update their products
router.put(
  '/update-product/:id',
  requireSignIn,
  (req, res, next) => {
    const user = req.user;
    // Admin can update any product, sellers can only update their own products
    if (user.role === 1) {
      next();
    } else if (user.role === 2 && user.isSeller && user.sellerStatus === 'approved') {
      // For sellers, we'll check if they own the product in the controller
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only admin and approved sellers can update products',
      });
    }
  },
  formidable(),
  updateProductController
);

// DELETE PRODUCT || DELETE - Both admin and sellers can delete their products
router.delete(
  '/delete-product/:id',
  requireSignIn,
  (req, res, next) => {
    const user = req.user;
    // Admin can delete any product, sellers can only delete their own products
    if (user.role === 1) {
      next();
    } else if (user.role === 2 && user.isSeller && user.sellerStatus === 'approved') {
      // For sellers, we'll check if they own the product in the controller
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only admin and approved sellers can delete products',
      });
    }
  },
  deleteProductController
);

// PAYMENT ROUTES
// TOKEN || GET
router.get('/braintree/token', braintreeTokenController);

// PAYMENT || POST
router.post('/braintree/payment', requireSignIn, braintreePaymentController);

export default router; 