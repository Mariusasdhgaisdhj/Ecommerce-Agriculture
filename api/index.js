import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from '../server/routes/authRoutes.js';
import categoryRoutes from '../server/routes/categoryRoutes.js';
import productRoutes from '../server/routes/productRoutes.js';
import sellerRoutes from '../server/routes/sellerRoutes.js';
import wishlistRoutes from '../server/routes/wishlistRoutes.js';
import cartRoutes from '../server/routes/cartRoutes.js';
import orderRoutes from '../server/routes/orderRoutes.js';
import forumRoutes from '../server/routes/forumRoutes.js';
import { notFoundMiddleware, errorHandler } from '../server/middlewares/errorMiddleware.js';

// Configure env
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

// Call connectDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/forum', forumRoutes);

// API health check
app.get('/api', (req, res) => {
  res.status(200).send('AgriGrow API is running');
});

// Error handling middlewares
app.use(notFoundMiddleware);
app.use(errorHandler);

// Export the Express API
export default app; 