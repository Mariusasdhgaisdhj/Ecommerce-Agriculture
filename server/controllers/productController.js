import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';
import orderModel from '../models/orderModel.js';
import slugify from 'slugify';
import fs from 'fs';
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

// Create product
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.fields;
    const { image } = req.files;
    
    // Validation
    if (!name || !description || !price || !category || !quantity || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const product = new productModel({
      name,
      description,
      price,
      category,
      quantity,
      seller: req.user._id,
      slug: slugify(name),
    });
    
    if (image) {
      product.image.data = fs.readFileSync(image.path);
      product.image.contentType = image.type;
    }
    
    await product.save();
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in creating product',
      error,
    });
  }
};

// Get all products
export const getProductsController = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = '-createdAt', category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = {};
    if (category) {
      query.category = category;
    }
    
    const totalProducts = await productModel.countDocuments(query);
    const products = await productModel
      .find(query)
      .populate('category')
      .select('-image')
      .limit(parseInt(limit))
      .skip(skip)
      .sort(sort);
    
    return res.status(200).json({
      success: true,
      totalCount: totalProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / parseInt(limit)),
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting products',
      error,
    });
  }
};

// Get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select('-image')
      .populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting product',
      error,
    });
  }
};

// Update product
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.fields;
    const { image } = req.files;
    
    // Validation
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if product exists
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    // If user is a seller, check if they own the product
    if (req.user.role === 2) {
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You can only update your own products',
        });
      }
    }
    
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        category,
        quantity,
        slug: slugify(name),
      },
      { new: true }
    );
    
    if (image) {
      updatedProduct.image.data = fs.readFileSync(image.path);
      updatedProduct.image.contentType = image.type;
    }
    
    await updatedProduct.save();
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in updating product',
      error,
    });
  }
};

// Delete product
export const deleteProductController = async (req, res) => {
  try {
    // Check if product exists
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    // If user is a seller, check if they own the product
    if (req.user.role === 2) {
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You can only delete your own products',
        });
      }
    }
    
    await productModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in deleting product',
      error,
    });
  }
};

// Payment gateway API
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        return res.status(500).json({ error: err });
      } else {
        return res.status(200).json({ clientToken: response.clientToken });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in generating token',
      error,
    });
  }
};

// Payment
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    
    // Calculate total
    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });
    
    // Create transaction
    gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) {
        if (result) {
          // Create order
          const order = await new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          
          return res.status(200).json({ ok: true, order });
        } else {
          return res.status(500).json({ error });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in processing payment',
      error,
    });
  }
};

// Enhanced search products
export const searchProductController = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;
    
    // Build query object
    const query = {};
    
    // Add keyword search condition if provided
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'category.name': { $regex: keyword, $options: 'i' } },
      ];
    }
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    // Add price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Execute query with populated category
    const products = await productModel
      .find(query)
      .select('-image')
      .populate('category')
      .sort(sort);
    
    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in searching products',
      error,
    });
  }
};

// Filter products
export const filterProductsController = async (req, res) => {
  try {
    const { categories, priceRange } = req.body;
    
    // Build query
    const query = {};
    
    // Add category filter if provided
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }
    
    // Add price range filter if provided
    if (priceRange && priceRange.length === 2) {
      const [min, max] = priceRange;
      query.price = { $gte: min, $lte: max };
    }
    
    const products = await productModel
      .find(query)
      .populate('category')
      .select('-image')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in filtering products',
      error,
    });
  }
};

// Get related products
export const relatedProductsController = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;
    
    if (!productId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Category ID are required',
      });
    }
    
    const products = await productModel
      .find({
        category: categoryId,
        _id: { $ne: productId }, // Exclude the current product
      })
      .select('-image')
      .populate('category')
      .limit(6);
    
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting related products',
      error,
    });
  }
};

// Create or update product review
export const createProductReviewController = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    
    // Validation
    if (!rating || !comment || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Rating, comment, and product ID are required',
      });
    }
    
    const product = await productModel.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      // Update existing review
      product.reviews.forEach((review) => {
        if (review.user.toString() === req.user._id.toString()) {
          review.rating = Number(rating);
          review.comment = comment;
        }
      });
    } else {
      // Add new review
      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      };
      
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
    }
    
    // Calculate average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    
    await product.save();
    
    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in adding review',
      error,
    });
  }
}; 