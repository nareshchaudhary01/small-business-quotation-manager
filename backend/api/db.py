import os

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "business_manager")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[MONGO_DB_NAME]


def check_connection():
    try:
        client.admin.command("ping")
        return True
    except ConnectionFailure:
        return False
