# Quick Deployment Guide (Free Tier)

This guide will help you deploy the entire application in under 15 minutes using free tiers.

## Prerequisites

- GitHub account (already connected)
- MongoDB Atlas account (free)
- Render account (free)
- Vercel account (free)

## Step 1: MongoDB Atlas (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/signup
2. Sign up with your email (nareshhdangi@gmail.com)
3. Create a free M0 cluster:
   - Click "Build a Database"
   - Select "M0 Free" (512MB storage)
   - Choose a region closest to you
   - Cluster name: `business-manager`
   - Click "Create"

4. Create database user:
   - Go to "Database Access" → "Add New Database User"
   - Username: `bizuser`
   - Password: `BusinessManager123!` (save this!)
   - Role: "Read and write to any database"
   - Click "Add User"

5. Allow network access:
   - Go to "Network Access" → "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. Get connection string:
   - Go to "Database" → Click "Connect"
   - Select "Drivers" → "Python"
   - Copy the connection string (replace <password> with your password)

## Step 2: Deploy Backend to Render (5 minutes)

1. Go to https://dashboard.render.com/register
2. Sign up with GitHub (recommended) or email
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

   **Environment Variables (click "Advanced"):**
   ```
   DJANGO_SECRET_KEY=django-insecure-change-this-to-a-random-50-char-string-xyz123abc456def789
   DJANGO_DEBUG=False
   ALLOWED_HOSTS=bizquote-api.onrender.com
   MONGO_URI=mongodb+srv://nareshhdangi_db_user:lBtK2okBVagDj7SD@bizuser.3gfnlri.mongodb.net/?appName=bizuser
   MONGO_DB_NAME=business_manager
   JWT_SECRET=another-random-secret-key-minimum-32-characters-long
   CORS_ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173
   ```

6. Click "Deploy Web Service"
7. Wait for deployment (2-3 minutes)
8. Copy your backend URL: `https://bizquote-api.onrender.com`

## Step 3: Deploy Frontend to Vercel (3 minutes)

1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Click "Add New" → "Project"
4. Import your GitHub repo: `nareshchaudhary01/small-business-quotation-manager`
5. Configure:

   **Framework Preset:** Vite
   **Root Directory:** `frontend`
   **Build Command:** `npm install && npm run build`
   **Output Directory:** `dist`

   **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://bizquote-api.onrender.com/api
   ```

6. Click "Deploy"
7. Wait for deployment (1-2 minutes)
8. Copy your frontend URL: `https://your-project.vercel.app`

## Step 4: Update CORS (2 minutes)

1. Go back to Render dashboard
2. Open your `bizquote-api` service
3. Go to "Environment" section
4. Update `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
   ```
5. Click "Save Changes"
6. Wait for redeploy

## Step 5: Test Your Live App

1. Open your Vercel URL
2. Register a new account
3. Login
4. Create a customer
5. Create a product
6. Create a quotation
7. Convert to order

## Total Cost: $0/month

- MongoDB Atlas M0: Free
- Render Free Tier: Free
- Vercel Hobby: Free

## Troubleshooting

**Backend fails to start:**
- Check Render logs for errors
- Verify MONGO_URI is correct
- Ensure MongoDB cluster is created

**Frontend can't connect to backend:**
- Check CORS_ALLOWED_ORIGINS includes your Vercel URL
- Verify VITE_API_BASE_URL is correct
- Check backend is running (visit /api/health/)

**MongoDB connection error:**
- Verify IP whitelist (0.0.0.0/0)
- Check username/password in connection string
- Ensure cluster is created and active
