import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import rateLimit from 'express-rate-limit';
import { notFoundMiddleware, errorHandler } from './middlewares/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure env
dotenv.config();

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
connectDB();

// Rest object
const app = express();

// Define rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.DEV_MODE === 'development' ? 'dev' : 'combined'));
app.use(limiter); // Apply rate limiting to all requests

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/forum', forumRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const buildPath = path.join(__dirname, '../dist');
  app.use(express.static(buildPath));
  
  // Any route that is not an API route should be handled by React
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // REST API welcome message for development
  app.get('/', (req, res) => {
    res.send('<h1>Welcome to AgriGrow Food Crops API</h1>');
  });
}

// Error handling middlewares
app.use(notFoundMiddleware);
app.use(errorHandler);

// PORT
const PORT = process.env.PORT || 8080;

// Run server
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
}); 