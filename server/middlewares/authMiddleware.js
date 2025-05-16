import JWT from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// Protected route middleware
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
    });
  }
};

// Admin middleware
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin resource.',
      });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in admin middleware',
      error,
    });
  }
};

// Seller middleware
export const isSeller = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 2 || !user.isSeller || user.sellerStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. Seller resource.',
      });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in seller middleware',
      error,
    });
  }
}; 