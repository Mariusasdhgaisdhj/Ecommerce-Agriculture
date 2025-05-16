import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';

// Apply to become a seller
export const applySellerController = async (req, res) => {
  try {
    const { businessName, description, accountNumber, accountName, bankName } = req.body;
    
    // Validation
    if (!businessName || !description || !accountNumber || !accountName || !bankName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All seller information fields are required' 
      });
    }
    
    // Check if user exists
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if already applied
    if (user.isSeller && user.sellerStatus !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: user.sellerStatus === 'pending' 
          ? 'Your seller application is already pending' 
          : 'You are already a seller'
      });
    }
    
    // Update user with seller information
    user.isSeller = true;
    user.sellerStatus = 'pending';
    user.sellerInfo = {
      businessName,
      description,
      accountNumber,
      accountName,
      bankName,
      documents: req.body.documents || []
    };
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Seller application submitted successfully',
      sellerStatus: user.sellerStatus
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in applying for seller account',
      error
    });
  }
};

// Get seller application status
export const getSellerStatusController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      isSeller: user.isSeller,
      sellerStatus: user.sellerStatus,
      sellerInfo: user.sellerInfo
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching seller status',
      error
    });
  }
};

// Admin: Get all seller applications
export const getSellerApplicationsController = async (req, res) => {
  try {
    const sellers = await userModel.find({
      isSeller: true,
      sellerStatus: 'pending'
    }).select('-password');
    
    return res.status(200).json({
      success: true,
      count: sellers.length,
      sellers
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching seller applications',
      error
    });
  }
};

// Admin: Approve/reject seller application
export const updateSellerStatusController = async (req, res) => {
  try {
    const { userId, status, rejectionReason } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: 'User ID and status are required'
      });
    }
    
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }
    
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting an application'
      });
    }
    
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.sellerStatus = status;
    
    if (status === 'approved') {
      user.role = 2; // Set role to seller
      if (user.sellerInfo) {
        user.sellerInfo.approvedAt = new Date();
      }
    } else {
      if (user.sellerInfo) {
        user.sellerInfo.rejectionReason = rejectionReason;
      }
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: `Seller application ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        sellerStatus: user.sellerStatus
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in updating seller status',
      error
    });
  }
};

// Get seller products (for seller dashboard)
export const getSellerProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({ seller: req.user._id })
      .populate('category')
      .select('-image')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching seller products',
      error
    });
  }
}; 