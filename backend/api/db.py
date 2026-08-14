import os
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import certifi

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "business_manager")
DEMO_MODE = os.environ.get("DEMO_MODE", "False").lower() in ("1", "true", "yes")


class FakeInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeCollection:
    def __init__(self, name: str):
        self._name = name
        self._data: Dict[str, Dict[str, Any]] = {}

    def _matches(self, document: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for key, value in query.items():
            if key == "_id":
                if str(document.get("_id")) != str(value):
                    return False
            else:
                if document.get(key) != value:
                    return False
        return True

    def find(self, *args, **kwargs):
        return list(self._data.values())

    def find_one(self, query: Dict[str, Any]):
        if not query:
            return None
        for doc in self._data.values():
            if self._matches(doc, query):
                return doc
        return None

    def insert_one(self, document: Dict[str, Any]):
        oid = ObjectId()
        doc = document.copy()
        doc["_id"] = oid
        self._data[str(oid)] = doc
        return FakeInsertResult(oid)

    def insert_many(self, documents: List[Dict[str, Any]]):
        inserted = []
        for document in documents:
            result = self.insert_one(document)
            inserted.append(result.inserted_id)
        return type("FakeInsertManyResult", (), {"inserted_ids": inserted})()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for doc_key, doc in self._data.items():
            if self._matches(doc, query):
                if "$set" in update:
                    for k, v in update["$set"].items():
                        self._data[doc_key][k] = v
                else:
                    for k, v in update.items():
                        self._data[doc_key][k] = v
                return

    def delete_one(self, query: Dict[str, Any]):
        for doc_key, doc in list(self._data.items()):
            if self._matches(doc, query):
                self._data.pop(doc_key, None)
                return

    def count_documents(self, query: Dict[str, Any] = None):
        if not query:
            return len(self._data)
        return sum(1 for doc in self._data.values() if self._matches(doc, query))


class FakeDB:
    def __init__(self):
        self._collections: Dict[str, FakeCollection] = {}

    def __getitem__(self, name: str):
        if name not in self._collections:
            self._collections[name] = FakeCollection(name)
        return self._collections[name]


# Connection management
client = None
db = None
_use_fake = False
_connection_error = None

if DEMO_MODE:
    # Explicit demo mode: use in-memory fake DB
    _use_fake = True
    db = FakeDB()
else:
    # Attempt to connect to real MongoDB Atlas; do NOT silently fall back on error
    try:
        # Use certifi CA bundle to help with TLS verification across environments
        client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
        # attempt a ping to verify the connection
        client.admin.command("ping")
        db = client[MONGO_DB_NAME]
    except Exception as exc:
        # Record the connection error and keep db=None. Do not enable FakeDB.
        _connection_error = exc
        client = None
        db = None
        _use_fake = False


def check_connection():
    """Return True if the effective database is connected.

    - If DEMO_MODE (fake DB) is active, return True.
    - If a real client exists, try pinging it.
    - Otherwise return False.
    """
    global _connection_error
    if _use_fake:
        return True
    if client is None:
        return False
    try:
        client.admin.command("ping")
        return True
    except Exception as exc:
        _connection_error = exc
        return False


def get_connection_error():
    """Return the last MongoDB connection exception, or None."""
    return _connection_error
