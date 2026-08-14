# Small Business Quotation & Order Manager

A full-stack quotation and order management system using Django REST Framework, MongoDB Atlas, React, and Vite.

## Project Structure

- `backend/` — Django backend and REST API
- `frontend/` — React + Vite frontend with Tailwind CSS

## Local Development

### Backend Setup

1. Open a terminal in `backend/`
2. Install dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```
3. Set environment variables (or use defaults for local testing):
   - `MONGO_URI` (default: `mongodb://localhost:27017`)
   - `MONGO_DB_NAME` (default: `business_manager`)
   - `DJANGO_SECRET_KEY` (default: insecure key for local only)
   - `JWT_SECRET` (default: insecure key for local only)
4. Run migrations:
   ```powershell
   python manage.py migrate
   ```
5. Start the server:
   ```powershell
   python manage.py runserver
   ```
6. Verify at `http://127.0.0.1:8000/api/health/`

### Frontend Setup

1. Open a terminal in `frontend/`
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
4. Start the dev server:
   ```powershell
   npm run dev
   ```
5. Open the URL shown (typically `http://127.0.0.1:5173`)

## Production Deployment

### Architecture

- **Frontend**: Vercel (React SPA)
- **Backend**: Render (Django REST API)
- **Database**: MongoDB Atlas

### Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and sign up/login
2. Create a free M0 cluster
3. **Database Access**: Add a new database user
   - Username: `bizuser` (or your choice)
   - Password: Use a strong password (save this!)
   - Role: Read and write to any database
4. **Network Access**: Add IP `0.0.0.0/0` to allow from anywhere
5. Click **Connect** → **Drivers** → **Python**
6. Copy the connection string:
   ```
   mongodb+srv://bizuser:YourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render

1. Go to [dashboard.render.com](https://dashboard.render.com) and sign up/login
2. Click **New +** → **Web Service**
3. Connect your GitHub repo: `nareshchaudhary01/small-business-quotation-manager`
4. Configure settings:

   | Setting | Value |
   |---------|-------|
   | Name | `bizquote-api` |
   | Region | Closest to you |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |
   | Plan | Free |

5. Click **Advanced** → **Add Environment Variable**:

   ```
   DJANGO_SECRET_KEY=generate-a-50-char-random-string-here
   DJANGO_DEBUG=False
   ALLOWED_HOSTS=bizquote-api.onrender.com
   MONGO_URI=mongodb+srv://bizuser:YourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGO_DB_NAME=business_manager
   JWT_SECRET=generate-another-32-char-random-string-here
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

6. Click **Deploy Web Service**

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure settings:

   | Setting | Value |
   |---------|-------|
   | Framework Preset | Vite |
   | Root Directory | `frontend` |
   | Build Command | `npm install && npm run build` |
   | Output Directory | `dist` |

5. Click **Environment Variables** → Add:

   ```
   VITE_API_BASE_URL=https://bizquote-api.onrender.com/api
   ```

6. Click **Deploy**

### Step 4: Update CORS Settings

After both deployments are live:

1. Go to your Render backend service
2. Update `CORS_ALLOWED_ORIGINS` to include your actual Vercel URL:
   ```
   CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
   ```
3. Redeploy the backend

## API Endpoints

### Authentication
- `POST /api/auth/register/` — Register new user
- `POST /api/auth/login/` — Login and get JWT token

### Customers
- `GET /api/customers/` — List all customers
- `POST /api/customers/` — Create customer
- `GET /api/customers/<id>/` — Get customer details
- `PUT /api/customers/<id>/` — Update customer
- `DELETE /api/customers/<id>/` — Delete customer

### Products
- `GET /api/products/` — List all products
- `POST /api/products/` — Create product
- `GET /api/products/<id>/` — Get product details
- `PUT /api/products/<id>/` — Update product
- `DELETE /api/products/<id>/` — Delete product

### Quotations
- `GET /api/quotations/` — List all quotations
- `POST /api/quotations/` — Create quotation
- `GET /api/quotations/<id>/` — Get quotation details
- `PUT /api/quotations/<id>/` — Update quotation
- `DELETE /api/quotations/<id>/` — Delete quotation
- `POST /api/quotations/<id>/convert/` — Convert quotation to order

### Orders
- `GET /api/orders/` — List all orders
- `POST /api/orders/` — Create order
- `GET /api/orders/<id>/` — Get order details
- `PUT /api/orders/<id>/` — Update order
- `DELETE /api/orders/<id>/` — Delete order

### Health
- `GET /api/health/` — Check server and MongoDB status

## Authentication

All protected endpoints require:
```
Authorization: Bearer <your-jwt-token>
```

Get your token from `/api/auth/login/` and include it in the request headers.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DJANGO_SECRET_KEY` | Django secret key | Yes (production) |
| `DJANGO_DEBUG` | Debug mode (True/False) | No (default: False) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | No (default: localhost,127.0.0.1) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `MONGO_DB_NAME` | MongoDB database name | Yes |
| `JWT_SECRET` | JWT signing secret | Yes (production) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | No (default: localhost URLs) |

## Recent Bug Fixes

- ✅ Fixed Fake DB queries to match any field (not just _id)
- ✅ Replaced deprecated `datetime.utcnow()` with `datetime.now(timezone.utc)`
- ✅ Added missing API functions (getQuotation, updateQuotation, deleteQuotation)
- ✅ Hardened Django security (DEBUG=False by default, proper CORS)
- ✅ Added WhiteNoise for production static file serving
- ✅ Fixed port mismatch from 8002 to 8000
- ✅ URL routes already correct (customers/<str:customer_id>/)
- ✅ React components have proper hooks and state management
