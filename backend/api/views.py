from datetime import datetime

from bson import ObjectId
from pymongo.errors import PyMongoError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .db import db, check_connection
from .serializers import (
    CustomerSerializer,
    OrderSerializer,
    ProductSerializer,
    QuotationSerializer,
)

CUSTOMER_COLLECTION = "customers"
PRODUCT_COLLECTION = "products"
QUOTATION_COLLECTION = "quotations"
ORDER_COLLECTION = "orders"


def serialize_document(document, serializer_name):
    if document is None:
        return None

    serialized = {"id": str(document.get("_id"))}
    serialized.update({k: document.get(k) for k in document if k not in ["_id"]})
    if document.get("created_at"):
        serialized["created_at"] = document["created_at"].isoformat()
    if document.get("updated_at"):
        serialized["updated_at"] = document["updated_at"].isoformat()

    return serialized


def get_object_or_response(collection_name, object_id):
    if not ObjectId.is_valid(object_id):
        return None, Response(
            {"detail": "Invalid ID."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    collection = db[collection_name]
    document = collection.find_one({"_id": ObjectId(object_id)})
    if document is None:
        return None, Response(
            {"detail": "Item not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return document, None


def db_error_response(error):
    return Response(
        {"detail": "Database error. Check MongoDB connection.", "error": str(error)},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


def validate_customer_exists(customer_id):
    if not ObjectId.is_valid(customer_id):
        return False
    return db[CUSTOMER_COLLECTION].count_documents({"_id": ObjectId(customer_id)}) > 0


def compute_totals(items, discount, tax):
    subtotal = round(sum(item["unit_price"] * item["quantity"] for item in items), 2)
    total = round(max(0.0, subtotal - discount + tax), 2)
    return subtotal, total


@api_view(["GET"])
def health_check(request):
    connected = check_connection()
    status_text = "connected" if connected else "disconnected"
    return Response({"status": "ok", "database": status_text})


@api_view(["GET", "POST"])
def customer_list_create(request):
    try:
        collection = db[CUSTOMER_COLLECTION]

        if request.method == "GET":
            customers = [serialize_document(customer, "customer") for customer in collection.find()]
            return Response(customers)

        serializer = CustomerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        result = collection.insert_one(serializer.validated_data)
        created = collection.find_one({"_id": result.inserted_id})
        return Response(serialize_document(created, "customer"), status=status.HTTP_201_CREATED)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["GET", "PUT", "DELETE"])
def customer_detail(request, customer_id):
    document, error_response = get_object_or_response(CUSTOMER_COLLECTION, customer_id)
    if error_response:
        return error_response

    try:
        collection = db[CUSTOMER_COLLECTION]
        if request.method == "GET":
            return Response(serialize_document(document, "customer"))

        if request.method == "PUT":
            serializer = CustomerSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            collection.update_one({"_id": document["_id"]}, {"$set": serializer.validated_data})
            updated = collection.find_one({"_id": document["_id"]})
            return Response(serialize_document(updated, "customer"))

        collection.delete_one({"_id": document["_id"]})
        return Response(status=status.HTTP_204_NO_CONTENT)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["GET", "POST"])
def product_list_create(request):
    try:
        collection = db[PRODUCT_COLLECTION]

        if request.method == "GET":
            products = [serialize_document(product, "product") for product in collection.find()]
            return Response(products)

        serializer = ProductSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        result = collection.insert_one(serializer.validated_data)
        created = collection.find_one({"_id": result.inserted_id})
        return Response(serialize_document(created, "product"), status=status.HTTP_201_CREATED)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["GET", "PUT", "DELETE"])
def product_detail(request, product_id):
    document, error_response = get_object_or_response(PRODUCT_COLLECTION, product_id)
    if error_response:
        return error_response

    try:
        collection = db[PRODUCT_COLLECTION]
        if request.method == "GET":
            return Response(serialize_document(document, "product"))

        if request.method == "PUT":
            serializer = ProductSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            collection.update_one({"_id": document["_id"]}, {"$set": serializer.validated_data})
            updated = collection.find_one({"_id": document["_id"]})
            return Response(serialize_document(updated, "product"))

        collection.delete_one({"_id": document["_id"]})
        return Response(status=status.HTTP_204_NO_CONTENT)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["GET", "POST"])
def quotation_list_create(request):
    try:
        collection = db[QUOTATION_COLLECTION]

        if request.method == "GET":
            quotations = [serialize_document(q, "quotation") for q in collection.find()]
            return Response(quotations)

        serializer = QuotationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        customer_id = validated_data["customer_id"]
        if not validate_customer_exists(customer_id):
            return Response({"detail": "Customer does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal, total = compute_totals(
            validated_data["items"],
            validated_data.get("discount", 0.0),
            validated_data.get("tax", 0.0),
        )
        document = {
            "customer_id": customer_id,
            "status": validated_data["status"],
            "notes": validated_data.get("notes", ""),
            "items": validated_data["items"],
            "discount": validated_data.get("discount", 0.0),
            "tax": validated_data.get("tax", 0.0),
            "subtotal": subtotal,
            "total": total,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = collection.insert_one(document)
        created = collection.find_one({"_id": result.inserted_id})
        return Response(serialize_document(created, "quotation"), status=status.HTTP_201_CREATED)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["GET", "PUT", "DELETE"])
def quotation_detail(request, quotation_id):
    document, error_response = get_object_or_response(QUOTATION_COLLECTION, quotation_id)
    if error_response:
        return error_response

    try:
        collection = db[QUOTATION_COLLECTION]
        if request.method == "GET":
            return Response(serialize_document(document, "quotation"))

        if request.method == "PUT":
            serializer = QuotationSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            validated_data = serializer.validated_data
            customer_id = validated_data["customer_id"]
            if not validate_customer_exists(customer_id):
                return Response({"detail": "Customer does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            subtotal, total = compute_totals(
                validated_data["items"],
                validated_data.get("discount", 0.0),
                validated_data.get("tax", 0.0),
            )
            updated_data = {
                "customer_id": customer_id,
                "status": validated_data["status"],
                "notes": validated_data.get("notes", ""),
                "items": validated_data["items"],
                "discount": validated_data.get("discount", 0.0),
                "tax": validated_data.get("tax", 0.0),
                "subtotal": subtotal,
                "total": total,
                "updated_at": datetime.utcnow(),
            }
            collection.update_one({"_id": document["_id"]}, {"$set": updated_data})
            updated = collection.find_one({"_id": document["_id"]})
            return Response(serialize_document(updated, "quotation"))

        collection.delete_one({"_id": document["_id"]})
        return Response(status=status.HTTP_204_NO_CONTENT)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["POST"])
def quotation_convert_to_order(request, quotation_id):
    quotation, error_response = get_object_or_response(QUOTATION_COLLECTION, quotation_id)
    if error_response:
        return error_response

    try:
        if quotation.get("status") == "converted":
            return Response({"detail": "Quotation already converted to order."}, status=status.HTTP_400_BAD_REQUEST)

        order_document = {
            "quotation_id": str(quotation["_id"]),
            "customer_id": quotation["customer_id"],
            "status": "pending",
            "notes": quotation.get("notes", ""),
            "items": quotation["items"],
            "discount": quotation.get("discount", 0.0),
            "tax": quotation.get("tax", 0.0),
            "subtotal": quotation.get("subtotal", 0.0),
            "total": quotation.get("total", 0.0),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        order_result = db[ORDER_COLLECTION].insert_one(order_document)
        db[QUOTATION_COLLECTION].update_one(
            {"_id": quotation["_id"]},
            {"$set": {"status": "converted", "updated_at": datetime.utcnow()}},
        )
        created_order = db[ORDER_COLLECTION].find_one({"_id": order_result.inserted_id})
        return Response(serialize_document(created_order, "order"), status=status.HTTP_201_CREATED)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["GET", "POST"])
def order_list_create(request):
    try:
        collection = db[ORDER_COLLECTION]

        if request.method == "GET":
            orders = [serialize_document(order, "order") for order in collection.find()]
            return Response(orders)

        serializer = OrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        customer_id = validated_data["customer_id"]
        if not validate_customer_exists(customer_id):
            return Response({"detail": "Customer does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal, total = compute_totals(
            validated_data["items"],
            validated_data.get("discount", 0.0),
            validated_data.get("tax", 0.0),
        )
        document = {
            "quotation_id": validated_data.get("quotation_id", ""),
            "customer_id": customer_id,
            "status": validated_data["status"],
            "notes": validated_data.get("notes", ""),
            "items": validated_data["items"],
            "discount": validated_data.get("discount", 0.0),
            "tax": validated_data.get("tax", 0.0),
            "subtotal": subtotal,
            "total": total,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = collection.insert_one(document)
        created = collection.find_one({"_id": result.inserted_id})
        return Response(serialize_document(created, "order"), status=status.HTTP_201_CREATED)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["GET", "PUT", "DELETE"])
def order_detail(request, order_id):
    document, error_response = get_object_or_response(ORDER_COLLECTION, order_id)
    if error_response:
        return error_response

    try:
        collection = db[ORDER_COLLECTION]
        if request.method == "GET":
            return Response(serialize_document(document, "order"))

        if request.method == "PUT":
            serializer = OrderSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            validated_data = serializer.validated_data
            customer_id = validated_data["customer_id"]
            if not validate_customer_exists(customer_id):
                return Response({"detail": "Customer does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            subtotal, total = compute_totals(
                validated_data["items"],
                validated_data.get("discount", 0.0),
                validated_data.get("tax", 0.0),
            )
            updated_data = {
                "quotation_id": validated_data.get("quotation_id", ""),
                "customer_id": customer_id,
                "status": validated_data["status"],
                "notes": validated_data.get("notes", ""),
                "items": validated_data["items"],
                "discount": validated_data.get("discount", 0.0),
                "tax": validated_data.get("tax", 0.0),
                "subtotal": subtotal,
                "total": total,
                "updated_at": datetime.utcnow(),
            }
            collection.update_one({"_id": document["_id"]}, {"$set": updated_data})
            updated = collection.find_one({"_id": document["_id"]})
            return Response(serialize_document(updated, "order"))

        collection.delete_one({"_id": document["_id"]})
        return Response(status=status.HTTP_204_NO_CONTENT)
    except PyMongoError as error:
        return db_error_response(error)
