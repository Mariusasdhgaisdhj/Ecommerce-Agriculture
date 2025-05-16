# AgriGrow E-commerce Deployment Guide

This guide provides step-by-step instructions for deploying the AgriGrow e-commerce application to production.

## Prerequisites

- [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)
- [Heroku account](https://signup.heroku.com/) or similar hosting service
- [Braintree sandbox account](https://www.braintreepayments.com/) for payment processing
- Git installed on your local machine
- Node.js 18 or higher

## Deployment Steps

### 1. Set Up MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster (the free tier is fine for starting)
3. Set up a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) or specific IPs for your deployment environment
5. Get your connection string from Atlas (click "Connect" > "Connect your application")

### 2. Update Environment Variables

1. Create a `.env` file in the server directory using the `.env.example` template
2. Replace the placeholders with your actual values:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `BRAINTREE_MERCHANT_ID`, `BRAINTREE_PUBLIC_KEY`, `BRAINTREE_PRIVATE_KEY`: Your Braintree credentials

### 3. Deploy to Heroku

1. Install the Heroku CLI:
   ```
   npm install -g heroku
   ```

2. Log in to Heroku:
   ```
   heroku login
   ```

3. Create a new Heroku app:
   ```
   heroku create agrigrow-app
   ```

4. Add environment variables to Heroku:
   ```
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URL=your_mongodb_atlas_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret_key
   heroku config:set BRAINTREE_MERCHANT_ID=your_braintree_merchant_id
   heroku config:set BRAINTREE_PUBLIC_KEY=your_braintree_public_key
   heroku config:set BRAINTREE_PRIVATE_KEY=your_braintree_private_key
   ```

5. Deploy to Heroku:
   ```
   git push heroku main
   ```

6. Open your deployed application:
   ```
   heroku open
   ```

### 4. Alternative: Deploy to Render

Render is another popular hosting service that offers easy deployment for full-stack applications.

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure as follows:
   - **Build Command**: `npm install && npm run build && cd server && npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add the same environment variables as listed above

### 5. Update Frontend API URL (if needed)

If you're deploying the frontend separately or need to update the API URL:

1. Set the `VITE_API_URL` environment variable to point to your backend:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

## Troubleshooting

- **Database Connection Issues**: 
  - Verify the MongoDB connection string is correct
  - Ensure your IP whitelist includes the server IP address
  
- **Build Failures**:
  - Check Heroku logs: `heroku logs --tail`
  - Make sure all dependencies are correctly specified in package.json

- **API Connection Issues**:
  - Verify that the API URL environment variable is set correctly
  - Check for CORS issues in the server configuration

## Maintenance

- **Scaling**: If you need more resources, upgrade your Heroku plan or MongoDB Atlas tier
- **Monitoring**: Set up monitoring with Heroku metrics or a third-party service
- **Backups**: Configure regular database backups in MongoDB Atlas

## Need Help?

If you encounter any issues during deployment, please refer to:
- [Heroku Documentation](https://devcenter.heroku.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html) 