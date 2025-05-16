# AgriGrow Food Crops - E-commerce Application

A full-stack MERN e-commerce platform for selling food crop seeds with robust features for both users and administrators. The platform allows buyers to become sellers after meeting certain requirements.

## Features

### User Features
- User authentication (registration, login)
- Browse food crop products with search and pagination
- Filter products by category and price range
- View product details and related products
- Add products to cart and checkout
- Payment processing with Braintree
- User profile management
- Order history
- Product reviews system
- Apply to become a seller

### Seller Features
- Seller dashboard to manage products
- Create, update, and delete own products
- Track sales and inventory
- Manage product listings
- View seller analytics

### Admin Features
- Product management (create, read, update, delete)
- Category management
- User management
- Order management
- Dashboard with sales analytics
- Approve or reject seller applications

## Tech Stack

### Frontend
- React with TypeScript
- TailwindCSS for styling
- Context API for state management
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Braintree for payment processing
- Express-formidable for file handling

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `GET /api/v1/auth/orders` - Get user orders

### Products
- `GET /api/v1/product/get-products` - Get all products with pagination
- `GET /api/v1/product/get-product/:slug` - Get single product
- `GET /api/v1/product/search` - Search products
- `POST /api/v1/product/filter` - Filter products
- `GET /api/v1/product/related/:productId/:categoryId` - Get related products
- `POST /api/v1/product/review` - Create/update product review
- `POST /api/v1/product/create-product` - Create a product (admin/seller)
- `PUT /api/v1/product/update-product/:id` - Update a product (admin/seller)
- `DELETE /api/v1/product/delete-product/:id` - Delete a product (admin/seller)

### Seller
- `POST /api/v1/seller/apply` - Apply to become a seller
- `GET /api/v1/seller/status` - Get seller application status
- `GET /api/v1/seller/products` - Get seller's products
- `GET /api/v1/seller/applications` - Get all seller applications (admin)
- `PUT /api/v1/seller/update-status` - Update seller application status (admin)

### Categories
- `GET /api/v1/category/get-categories` - Get all categories
- `GET /api/v1/category/get-category/:slug` - Get single category

### Orders & Payment
- `GET /api/v1/product/braintree/token` - Get Braintree token
- `POST /api/v1/product/braintree/payment` - Process payment

## Recent Improvements

1. **Enhanced Pagination**: Added pagination support for product listings
2. **Improved Search**: Implemented text search across product names and descriptions
3. **Product Filtering**: Added ability to filter products by category and price range
4. **Related Products**: Added functionality to show related products based on category
5. **Product Reviews**: Implemented a review and rating system for products
6. **User Profiles**: Enhanced user profile management with order history
7. **API Security**: Added rate limiting to protect against abuse
8. **Error Handling**: Improved error handling with custom middleware
9. **Seller Functionality**: Buyers can now apply to become sellers and manage their own products

## Becoming a Seller

Users can apply to become sellers by following these steps:

1. Create a regular user account
2. Navigate to their profile and select "Apply to Become a Seller"
3. Complete the application form with the following information:
   - Business name
   - Business description
   - Bank account information for payments
   - Verification documents (if required)
4. Submit the application
5. Wait for admin approval
6. Once approved, the user can access the seller dashboard and start listing products

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB
- Braintree account for payment processing

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/agrigrow-ecommerce.git
cd agrigrow-ecommerce
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..
npm install
```

3. Set up environment variables
```
# Create .env file in server folder with:
PORT=8080
DEV_MODE=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BRAINTREE_MERCHANT_ID=your_braintree_merchant_id
BRAINTREE_PUBLIC_KEY=your_braintree_public_key
BRAINTREE_PRIVATE_KEY=your_braintree_private_key
```

4. Run the application
```bash
# Start backend server
cd server
npm run dev

# Start frontend in another terminal
cd ..
npm run dev
```

## License
MIT

## Contributors
- Your Name - Initial work and improvements

Here is the Website Link : https://souvik-3011.github.io/Ecommerce-Agriculture/
