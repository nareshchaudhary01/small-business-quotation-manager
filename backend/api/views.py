from bson import ObjectId
from pymongo.errors import PyMongoError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .db import db, check_connection
from .serializers import CustomerSerializer

CUSTOMER_COLLECTION = "customers"


def serialize_customer(customer):
    return {
        "id": str(customer.get("_id")),
        "name": customer.get("name", ""),
        "email": customer.get("email", ""),
        "phone": customer.get("phone", ""),
        "address": customer.get("address", ""),
    }


@api_view(["GET"])
def health_check(request):
    connected = check_connection()
    status_text = "connected" if connected else "disconnected"
    return Response({"status": "ok", "database": status_text})


def db_error_response(error):
    return Response(
        {"detail": "Database error. Check MongoDB connection.", "error": str(error)},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


@api_view(["GET", "POST"])
def customer_list_create(request):
    try:
        collection = db[CUSTOMER_COLLECTION]

        if request.method == "GET":
            customers = [serialize_customer(customer) for customer in collection.find()]
            return Response(customers)

        serializer = CustomerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        customer_data = serializer.validated_data
        result = collection.insert_one(customer_data)
        created = collection.find_one({"_id": result.inserted_id})
        return Response(serialize_customer(created), status=status.HTTP_201_CREATED)
    except PyMongoError as error:
        return db_error_response(error)


@api_view(["GET", "PUT", "DELETE"])
def customer_detail(request, customer_id):
    if not ObjectId.is_valid(customer_id):
        return Response({"detail": "Invalid customer ID."}, status=status.HTTP_400_BAD_REQUEST)

    object_id = ObjectId(customer_id)

    try:
        collection = db[CUSTOMER_COLLECTION]
        customer = collection.find_one({"_id": object_id})
        if customer is None:
            return Response({"detail": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "GET":
            return Response(serialize_customer(customer))

        if request.method == "PUT":
            serializer = CustomerSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            updated_data = serializer.validated_data
            collection.update_one({"_id": object_id}, {"$set": updated_data})
            updated_customer = collection.find_one({"_id": object_id})
            return Response(serialize_customer(updated_customer))

        collection.delete_one({"_id": object_id})
        return Response(status=status.HTTP_204_NO_CONTENT)
    except PyMongoError as error:
        return db_error_response(error)
