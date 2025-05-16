import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';
import braintree from 'braintree';
import dotenv from 'dotenv';

dotenv.config();

// Configure Braintree
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// Create order from cart (existing functionality)
export const createOrderController = async (req, res) => {
  try {
    const { cartItems, shippingAddress, paymentMethod, nonce } = req.body;
    
    if (!cartItems || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Cart items, shipping address, and payment method are required',
      });
    }
    
    if (paymentMethod === 'braintree' && !nonce) {
      return res.status(400).json({
        success: false,
        message: 'Payment nonce is required for Braintree payment',
      });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of cartItems) {
      const product = await productModel.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }
      totalAmount += product.price * item.quantity;
    }
    
    // Process payment with Braintree if using that payment method
    let paymentResult = null;
    if (paymentMethod === 'braintree') {
      const result = await gateway.transaction.sale({
        amount: totalAmount.toString(),
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Payment failed',
          error: result.message,
        });
      }
      
      paymentResult = result.transaction;
    }
    
    // Create order
    const order = new orderModel({
      user: req.user._id,
      orderItems: cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress,
      paymentMethod,
      paymentResult: paymentResult ? {
        id: paymentResult.id,
        status: paymentResult.status,
        updateTime: paymentResult.updatedAt,
        email: req.user.email,
      } : null,
      itemsPrice: totalAmount,
      taxPrice: 0, // Can be calculated based on your tax logic
      shippingPrice: 0, // Can be calculated based on your shipping logic
      totalPrice: totalAmount, // Total + tax + shipping
    });
    
    await order.save();
    
    // Update product quantities
    for (const item of cartItems) {
      const product = await productModel.findById(item.product);
      product.quantity -= item.quantity;
      await product.save();
    }
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in creating order',
      error,
    });
  }
};

// Buy Now functionality (immediate checkout)
export const buyNowController = async (req, res) => {
  try {
    const { productId, quantity = 1, shippingAddress, paymentMethod, nonce } = req.body;
    
    if (!productId || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, shipping address, and payment method are required',
      });
    }
    
    if (paymentMethod === 'braintree' && !nonce) {
      return res.status(400).json({
        success: false,
        message: 'Payment nonce is required for Braintree payment',
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
    
    // Calculate total amount
    const totalAmount = product.price * quantity;
    
    // Process payment with Braintree if using that payment method
    let paymentResult = null;
    if (paymentMethod === 'braintree') {
      const result = await gateway.transaction.sale({
        amount: totalAmount.toString(),
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Payment failed',
          error: result.message,
        });
      }
      
      paymentResult = result.transaction;
    }
    
    // Create order
    const order = new orderModel({
      user: req.user._id,
      orderItems: [{
        product: productId,
        quantity,
        price: product.price,
      }],
      shippingAddress,
      paymentMethod,
      paymentResult: paymentResult ? {
        id: paymentResult.id,
        status: paymentResult.status,
        updateTime: paymentResult.updatedAt,
        email: req.user.email,
      } : null,
      itemsPrice: totalAmount,
      taxPrice: 0, // Can be calculated based on your tax logic
      shippingPrice: 0, // Can be calculated based on your shipping logic
      totalPrice: totalAmount, // Total + tax + shipping
    });
    
    await order.save();
    
    // Update product quantity
    product.quantity -= quantity;
    await product.save();
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in creating order',
      error,
    });
  }
};

// Get user's orders
export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id })
      .populate({
        path: 'orderItems.product',
        select: 'name price image',
      })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting orders',
      error,
    });
  }
};

// Get order details
export const getOrderDetailsController = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await orderModel
      .findById(orderId)
      .populate({
        path: 'orderItems.product',
        select: 'name price image',
      })
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    // Check if order belongs to the logged-in user or user is admin
    const user = await userModel.findById(req.user._id);
    if (order.user._id.toString() !== req.user._id.toString() && user.role !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }
    
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting order details',
      error,
    });
  }
}; 