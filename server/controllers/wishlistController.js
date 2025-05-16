import wishlistModel from '../models/wishlistModel.js';
import productModel from '../models/productModel.js';

// Add/remove product from wishlist (toggle)
export const toggleWishlistController = async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }
    
    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    // Find user's wishlist or create a new one
    let wishlist = await wishlistModel.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new wishlistModel({
        user: req.user._id,
        products: [productId],
      });
      await wishlist.save();
      
      return res.status(201).json({
        success: true,
        message: 'Product added to wishlist',
        added: true,
      });
    }
    
    // Check if product is already in wishlist
    const isProductInWishlist = wishlist.products.includes(productId);
    
    if (isProductInWishlist) {
      // Remove product from wishlist
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId.toString()
      );
      await wishlist.save();
      
      return res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        added: false,
      });
    } else {
      // Add product to wishlist
      wishlist.products.push(productId);
      await wishlist.save();
      
      return res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        added: true,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in wishlist operation',
      error,
    });
  }
};

// Get user's wishlist
export const getWishlistController = async (req, res) => {
  try {
    const wishlist = await wishlistModel
      .findOne({ user: req.user._id })
      .populate({
        path: 'products',
        select: '-image',
        populate: {
          path: 'category',
        },
      });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        products: [],
      });
    }
    
    return res.status(200).json({
      success: true,
      products: wishlist.products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting wishlist',
      error,
    });
  }
};

// Check if a product is in user's wishlist
export const checkWishlistController = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }
    
    const wishlist = await wishlistModel.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false,
      });
    }
    
    const inWishlist = wishlist.products.includes(productId);
    
    return res.status(200).json({
      success: true,
      inWishlist,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in checking wishlist',
      error,
    });
  }
}; 