# Deploying AgriGrow to Vercel (Free Tier)

This guide provides step-by-step instructions for deploying the AgriGrow e-commerce application on Vercel's free tier.

## Prerequisites

- [GitHub account](https://github.com/) (for source code hosting)
- [Vercel account](https://vercel.com/signup) linked to your GitHub
- [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)
- [Braintree sandbox account](https://www.braintreepayments.com/) for payment processing

## Step 1: Set up MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster (the free tier is fine for starting)
3. Set up a database user with read/write permissions
4. Whitelist all IP addresses (`0.0.0.0/0`) for access from Vercel
5. Get your connection string from Atlas (click "Connect" > "Connect your application")

## Step 2: Push your code to GitHub

1. Create a new GitHub repository
2. Push your local code to the repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

1. Log in to Vercel and click "Add New..."
2. Select "Project" 
3. Import the GitHub repository you created
4. Configure your project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add the following environment variables:
   ```
   MONGO_URL=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   BRAINTREE_MERCHANT_ID=your_braintree_merchant_id
   BRAINTREE_PUBLIC_KEY=your_braintree_public_key
   BRAINTREE_PRIVATE_KEY=your_braintree_private_key
   NODE_ENV=production
   ```

6. Click "Deploy"

## Step 4: Verify your deployment

1. Once the deployment is complete, click the generated URL to open your application
2. Test all functionality:
   - User registration and login
   - Product browsing and searching
   - Adding items to cart
   - Checkout process
   - Forum functionality

## Troubleshooting

### API routes not working

If your API routes are not working, check:
1. Vercel logs for any errors
2. Make sure your `vercel.json` is correctly set up
3. Verify MongoDB connection string is correct

### MongoDB connection issues

If you're having issues connecting to MongoDB:
1. Check if your MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Verify your connection string includes the right username, password and database name
3. Make sure your MongoDB Atlas cluster is active and running

### Environment variables

If environment variables aren't working:
1. Redeploy the application after setting them
2. Check if they're being accessed correctly in your code

## Maintenance

- **Domain**: You can add a custom domain in your Vercel project settings
- **Updates**: Push changes to your GitHub repository and Vercel will automatically redeploy
- **Monitoring**: Use Vercel Analytics to monitor your application's performance

## Scaling beyond free tier

Vercel's free tier has some limitations:
- Serverless functions execution time limit (10 seconds)
- Bandwidth limits (100GB per month)
- Limited build time (45 minutes)

If you need more resources, consider upgrading to Vercel's Pro plan or splitting the backend to a dedicated hosting service. 