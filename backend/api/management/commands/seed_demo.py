from django.core.management.base import BaseCommand
from bson import ObjectId
from datetime import datetime

from api.db import db, check_connection

USER_COLLECTION = "users"
CUSTOMER_COLLECTION = "customers"
PRODUCT_COLLECTION = "products"
QUOTATION_COLLECTION = "quotations"
ORDER_COLLECTION = "orders"

DEMO_MARKER = {"demo_seed": True}

class Command(BaseCommand):
    help = "Seed demo data into the MongoDB database (idempotent)."

    def handle(self, *args, **options):
        self.stdout.write("Checking database connection...")
        if not check_connection():
            self.stderr.write("Database is not connected. Aborting seed.")
            return

        # Users
        users_col = db[USER_COLLECTION]
        if users_col.count_documents(DEMO_MARKER) == 0:
            self.stdout.write("Creating demo user...")
            user = {
                "name": "Demo User",
                "email": "demo@example.com",
                "password_hash": "",  # not used for demo login via API
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                **DEMO_MARKER,
            }
            users_col.insert_one(user)
        else:
            self.stdout.write("Demo user already exists.")

        # Customers
        customers_col = db[CUSTOMER_COLLECTION]
        if customers_col.count_documents(DEMO_MARKER) == 0:
            self.stdout.write("Creating demo customers...")
            demo_customers = [
                {"name": "Alice's Boutique", "email": "alice@example.com", "phone": "1234567890", "address": "123 Market St", **DEMO_MARKER},
                {"name": "Bob's Hardware", "email": "bob@example.com", "phone": "9876543210", "address": "456 Industrial Rd", **DEMO_MARKER},
            ]
            customers_col.insert_many(demo_customers)
        else:
            self.stdout.write("Demo customers already exist.")

        # Products
        products_col = db[PRODUCT_COLLECTION]
        if products_col.count_documents(DEMO_MARKER) == 0:
            self.stdout.write("Creating demo products...")
            demo_products = [
                {"name": "T-Shirt", "description": "Comfortable cotton T-Shirt", "sku": "TSHIRT-001", "price": 299.0, "stock": 50, **DEMO_MARKER},
                {"name": "Mug", "description": "Ceramic mug", "sku": "MUG-001", "price": 99.0, "stock": 120, **DEMO_MARKER},
            ]
            products_col.insert_many(demo_products)
        else:
            self.stdout.write("Demo products already exist.")

        # Quotations
        quotations_col = db[QUOTATION_COLLECTION]
        orders_col = db[ORDER_COLLECTION]
        if quotations_col.count_documents(DEMO_MARKER) == 0:
            self.stdout.write("Creating a demo quotation and order...")
            # pick first customer and product
            customer = customers_col.find_one(DEMO_MARKER)
            product = products_col.find_one(DEMO_MARKER)
            if not customer or not product:
                self.stderr.write("Customers or products missing; aborting quotation creation.")
            else:
                items = [{
                    "product_id": str(product.get("_id")),
                    "name": product.get("name"),
                    "unit_price": product.get("price"),
                    "quantity": 2,
                    "total_price": round(product.get("price") * 2, 2),
                }]
                subtotal = sum(i["total_price"] for i in items)
                quotation = {
                    "customer_id": str(customer.get("_id")),
                    "status": "draft",
                    "notes": "Demo quotation",
                    "items": items,
                    "discount": 0.0,
                    "tax": 0.0,
                    "subtotal": subtotal,
                    "total": subtotal,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    **DEMO_MARKER,
                }
                qres = quotations_col.insert_one(quotation)

                # Create a corresponding order (optional)
                order = {
                    "quotation_id": str(qres.inserted_id),
                    "customer_id": str(customer.get("_id")),
                    "status": "pending",
                    "notes": "Converted from demo quotation",
                    "items": items,
                    "discount": 0.0,
                    "tax": 0.0,
                    "subtotal": subtotal,
                    "total": subtotal,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    **DEMO_MARKER,
                }
                orders_col.insert_one(order)
        else:
            self.stdout.write("Demo quotations already exist.")

        self.stdout.write(self.style.SUCCESS("Demo data seeded (idempotent)."))
