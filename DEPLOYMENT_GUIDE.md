# Quick Deployment Guide (Free Tier - All on Render)

This guide will help you deploy the entire application on Render using free tiers.

## Prerequisites

- GitHub account (already connected)
- MongoDB Atlas account (free) ✅ Already done
- Render account (free)

## Step 1: Deploy Backend to Render (5 minutes)

1. Go to https://dashboard.render.com/register
2. Sign up with GitHub (recommended)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo: `nareshchaudhary01/small-business-quotation-manager`
5. Configure:

   **Basic Settings:**
   - Name: `bizquote-api`
   - Region: Oregon (US West) or closest to you
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --log-file -`
   - Instance Type: Free

   **Environment Variables (click "Advanced" → "Add Environment Variable" for each):**

   ```
   DJANGO_SECRET_KEY=django-insecure-xk9m2n4p6q8r1s3t5u7v9w0y2z4a6c8e0g2i4k6m8n0p2q4r6s8t0u2v4w6x8
   DJANGO_DEBUG=False
   ALLOWED_HOSTS=bizquote-api.onrender.com,bizquote-web.onrender.com
   MONGO_URI=mongodb+srv://nareshhdangi_db_user:lBtK2okBVagDj7SD@bizuser.3gfnlri.mongodb.net/?appName=bizuser
   MONGO_DB_NAME=business_manager
   JWT_SECRET=jwt-secret-key-32-chars-minimum-length-xyz123
   CORS_ALLOWED_ORIGINS=https://bizquote-web.onrender.com
   ```

6. Click "Deploy Web Service"
7. Wait for deployment (2-3 minutes)
8. Copy your backend URL: `https://bizquote-api.onrender.com`

## Step 2: Deploy Frontend to Render Static Site (3 minutes)

1. Go to https://dashboard.render.com (same account as backend)
2. Click "New +" → "Static Site"
3. Connect your GitHub repo: `nareshchaudhary01/small-business-quotation-manager`
4. Configure:

   **Basic Settings:**
   - Name: `bizquote-web`
   - Region: Same as backend (Oregon US West)
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Instance Type: Free

   **Important:** Do NOT add "Publish: dist" to the build command. The Publish Directory is a separate field in the Render UI.

   **Environment Variables (click "Advanced" → "Add Environment Variable"):**

   ```
   VITE_API_BASE_URL=https://bizquote-api.onrender.com/api
   ```

5. Click "Deploy Static Site"
6. Wait for deployment (1-2 minutes)
7. Copy your frontend URL: `https://bizquote-web.onrender.com`

## Step 3: Update CORS on Backend (1 minute)

**Note: CORS is already configured correctly in Step 1 with `https://bizquote-web.onrender.com`**

If you used a different name for your frontend, update the backend's `CORS_ALLOWED_ORIGINS`:
1. Go to Render dashboard
2. Open your `bizquote-api` service
3. Go to "Environment" section
4. Update `CORS_ALLOWED_ORIGINS` to your actual frontend URL
5. Click "Save Changes"
6. Wait for redeploy

## Step 4: Test Your Live App

1. Open your Render frontend URL: `https://bizquote-web.onrender.com`
2. Register a new account
3. Login
4. Create a customer
5. Create a product
6. Create a quotation
7. Convert to order

## Total Cost: $0/month

- MongoDB Atlas M0: Free
- Render Free Tier (Backend): Free
- Render Free Tier (Frontend Static Site): Free

## Troubleshooting

**Backend fails to start:**
- Check Render logs for errors
- Verify MONGO_URI is correct
- Ensure MongoDB cluster is created and active

**Frontend can't connect to backend:**
- Check CORS_ALLOWED_ORIGINS includes your Render frontend URL (bizquote-web.onrender.com)
- Verify VITE_API_BASE_URL is correct (https://bizquote-api.onrender.com/api)
- Check backend is running (visit https://bizquote-api.onrender.com/api/health/)

**MongoDB connection error:**
- Verify IP whitelist (0.0.0.0/0) is set in MongoDB Atlas
- Check username/password in connection string
- Ensure cluster is created and active
