# Frontend for Small Business Quotation & Order Manager

This folder contains a responsive React application built with Vite and Tailwind CSS.

## How to run

1. Open a terminal in `frontend/`.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Copy the example environment file:
   ```powershell
   copy .env.example .env
   ```
4. Start the frontend server:
   ```powershell
   npm run dev
   ```

## Environment

- `VITE_API_BASE_URL` points to the backend API.
- The default value is `http://127.0.0.1:8000/api`.

## Included pages

- Login
- Register
- Dashboard
- Customers
- Products
- Quotations
- Orders

## What makes the UI responsive

- Tailwind CSS utility classes
- mobile-friendly navigation
- fluid cards and tables
- layouts that adapt from small phones to large laptop screens
