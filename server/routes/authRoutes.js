import express from 'express';
import {
  registerController,
  loginController,
  testController,
  updateProfileController,
  getUserProfileController,
  getUserOrdersController,
} from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes
// REGISTER || POST
router.post('/register', registerController);

// LOGIN || POST
router.post('/login', loginController);

// TEST || GET
router.get('/test', requireSignIn, isAdmin, testController);

// PROTECTED USER ROUTE || GET
router.get('/user-auth', requireSignIn, (req, res) => {
  res.status(200).json({ ok: true });
});

// PROTECTED ADMIN ROUTE || GET
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
  res.status(200).json({ ok: true });
});

// UPDATE PROFILE || PUT
router.put('/profile', requireSignIn, updateProfileController);

// GET USER PROFILE || GET
router.get('/profile', requireSignIn, getUserProfileController);

// GET USER ORDERS || GET
router.get('/orders', requireSignIn, getUserOrdersController);

export default router;