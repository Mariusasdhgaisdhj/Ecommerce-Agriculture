import cartModel from '../models/cartModel.js';
import productModel from '../models/productModel.js';

// Add product to cart
export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
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
    
    // Check if product is in stock
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock or insufficient quantity',
      });
    }
    
    // Find user's cart or create a new one
    let cart = await cartModel.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new cartModel({
        user: req.user._id,
        items: [],
        totalAmount: 0,
      });
    }
    
    // Check if product is already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }
    
    // Calculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    await cart.save();
    
    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in adding product to cart',
      error,
    });
  }
};

// Get user's cart
export const getCartController = async (req, res) => {
  try {
    let cart = await cartModel.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: '-image',
      populate: {
        path: 'category',
      },
    });
    
    if (!cart) {
      cart = {
        items: [],
        totalAmount: 0,
      };
    }
    
    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting cart',
      error,
    });
  }
};

// Update cart item quantity
export const updateCartItemController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required',
      });
    }
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
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
    
    // Check if product is in stock
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock or insufficient quantity',
      });
    }
    
    // Find user's cart
    const cart = await cartModel.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    
    // Calculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    await cart.save();
    
    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in updating cart',
      error,
    });
  }
};

// Remove item from cart
export const removeCartItemController = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }
    
    // Find user's cart
    const cart = await cartModel.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );
    
    // Calculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    await cart.save();
    
    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in removing item from cart',
      error,
    });
  }
};

// Clear cart
export const clearCartController = async (req, res) => {
  try {
    // Find user's cart
    const cart = await cartModel.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }
    
    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    
    await cart.save();
    
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in clearing cart',
      error,
    });
  }
}; 