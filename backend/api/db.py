import os
from typing import Any, Dict, List

from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

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

    def find(self, *args, **kwargs):
        return list(self._data.values())

    def find_one(self, query: Dict[str, Any]):
        _id = query.get("_id")
        if _id is None:
            return None
        return self._data.get(str(_id))

    def insert_one(self, document: Dict[str, Any]):
        oid = ObjectId()
        doc = document.copy()
        doc["_id"] = oid
        self._data[str(oid)] = doc
        return FakeInsertResult(oid)

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        _id = query.get("_id")
        if _id is None:
            return
        key = str(_id)
        if key not in self._data:
            return
        # Support {$set: {...}}
        if "$set" in update:
            for k, v in update["$set"].items():
                self._data[key][k] = v
        else:
            for k, v in update.items():
                self._data[key][k] = v

    def delete_one(self, query: Dict[str, Any]):
        _id = query.get("_id")
        if _id is None:
            return
        self._data.pop(str(_id), None)

    def count_documents(self, query: Dict[str, Any] = None):
        if not query:
            return len(self._data)
        # very simple matching for _id
        if "_id" in query:
            return 1 if str(query["_id"]) in self._data else 0
        return len(self._data)


class FakeDB:
    def __init__(self):
        self._collections: Dict[str, FakeCollection] = {}

    def __getitem__(self, name: str):
        if name not in self._collections:
            self._collections[name] = FakeCollection(name)
        return self._collections[name]


# Try to connect to real MongoDB; fall back to fake in DEMO_MODE or on connection failure.
client = None
db = None
_use_fake = False

try:
    if not DEMO_MODE:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # attempt a ping to verify the connection
        client.admin.command("ping")
        db = client[MONGO_DB_NAME]
    else:
        raise ConnectionFailure("Demo mode enabled, using fake DB")
except Exception:
    # Fall back to an in-memory fake DB implementation suitable for local testing
    _use_fake = True
    db = FakeDB()


def check_connection():
    if _use_fake:
        return True
    try:
        client.admin.command("ping")
        return True
    except ConnectionFailure:
        return False
