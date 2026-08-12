# Small Business Quotation & Order Manager

This project is a full-stack learning application for building a simple quotation and order management system using Python, Django, Django REST Framework, MongoDB Atlas, React, and GitHub.

The current workspace includes the Django backend scaffolding for the project.

## Current project structure

- `backend/` — Django backend and REST API
- `frontend/` — placeholder for the React frontend

## Backend setup

1. Open a terminal in `backend/`.
2. Install dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```
3. Set the MongoDB Atlas connection values as environment variables:
   - `MONGO_URI` (for example: `mongodb+srv://<username>:<password>@cluster0.mongodb.net`)
   - `MONGO_DB_NAME` (for example: `business_manager`)
4. Create the Django system tables and run the first migration:
   ```powershell
   python manage.py migrate
   ```
5. Run the Django development server:
   ```powershell
   python manage.py runserver
   ```
6. Open `http://127.0.0.1:8000/api/health/` to verify the backend is running.

## Next steps

- Add business models for customers, products, quotations, and orders
- Implement REST API endpoints for CRUD operations
- Add JWT authentication for user login and registration
- Build a React frontend that calls the Django API
- Deploy the backend on Render and the frontend on Vercel

## Example API routes available now

- `GET /api/health/` — check server and MongoDB connection status
- `GET /api/customers/` — return the full customer list
- `POST /api/customers/` — create a new customer
- `GET /api/customers/<id>/` — fetch one customer
- `PUT /api/customers/<id>/` — update a customer
- `DELETE /api/customers/<id>/` — delete a customer
- `GET /api/products/` — return the full product list
- `POST /api/products/` — create a new product
- `GET /api/products/<id>/` — fetch one product
- `PUT /api/products/<id>/` — update a product
- `DELETE /api/products/<id>/` — delete a product
- `GET /api/quotations/` — return the full quotation list
- `POST /api/quotations/` — create a new quotation
- `GET /api/quotations/<id>/` — fetch one quotation
- `PUT /api/quotations/<id>/` — update a quotation
- `DELETE /api/quotations/<id>/` — delete a quotation
- `POST /api/quotations/<id>/convert/` — convert a quotation into an order
- `GET /api/orders/` — return the full order list
- `POST /api/orders/` — create a new order
- `GET /api/orders/<id>/` — fetch one order
- `PUT /api/orders/<id>/` — update an order
- `DELETE /api/orders/<id>/` — delete an order
