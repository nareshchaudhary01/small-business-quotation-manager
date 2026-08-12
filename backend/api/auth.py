import os
from datetime import datetime, timedelta
from functools import wraps

from bson import ObjectId
from django.contrib.auth.hashers import check_password, make_password
from jose import JWTError, jwt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .db import db
from .serializers import LoginSerializer, RegisterSerializer

USER_COLLECTION = "users"
JWT_SECRET = os.environ.get("JWT_SECRET")
if JWT_SECRET is None:
    JWT_SECRET = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-insecure-key-for-local")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))


def create_access_token(user_id, email):
    expires = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "user_id": str(user_id),
        "email": email,
        "exp": expires,
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise JWTError("Invalid token type")
        return payload
    except JWTError:
        return None


def get_token_from_request(request):
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return None
    return authorization.split(" ", 1)[1].strip()


def login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = get_token_from_request(request)
        if not token:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        payload = decode_access_token(token)
        if payload is None:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_401_UNAUTHORIZED)

        user = db[USER_COLLECTION].find_one({"_id": ObjectId(payload.get("user_id"))})
        if user is None:
            return Response({"detail": "User not found."}, status=status.HTTP_401_UNAUTHORIZED)

        request.user = user
        return view_func(request, *args, **kwargs)

    return wrapper


def serialize_user(user):
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
    }


@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    validated_data = serializer.validated_data
    email = validated_data["email"].lower().strip()
    existing = db[USER_COLLECTION].count_documents({"email": email})
    if existing > 0:
        return Response({"detail": "Email is already registered."}, status=status.HTTP_400_BAD_REQUEST)

    user_document = {
        "name": validated_data["name"].strip(),
        "email": email,
        "password_hash": make_password(validated_data["password"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = db[USER_COLLECTION].insert_one(user_document)
    user_document = db[USER_COLLECTION].find_one({"_id": result.inserted_id})
    access_token = create_access_token(result.inserted_id, email)

    return Response(
        {
            "user": serialize_user(user_document),
            "access": access_token,
            "token_type": "Bearer",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    validated_data = serializer.validated_data
    email = validated_data["email"].lower().strip()
    user = db[USER_COLLECTION].find_one({"email": email})
    if user is None or not check_password(validated_data["password"], user.get("password_hash", "")):
        return Response({"detail": "Email or password is incorrect."}, status=status.HTTP_401_UNAUTHORIZED)

    access_token = create_access_token(user["_id"], email)
    return Response(
        {
            "user": serialize_user(user),
            "access": access_token,
            "token_type": "Bearer",
        }
    )
