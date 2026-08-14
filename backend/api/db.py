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
        if not query:
            return None
        # Support matching by any field, not just _id
        for doc in self._data.values():
            match = True
            for key, value in query.items():
                if key == "_id":
                    if str(doc.get("_id")) != str(value):
                        match = False
                        break
                else:
                    if doc.get(key) != value:
                        match = False
                        break
            if match:
                return doc
        return None

    def insert_one(self, document: Dict[str, Any]):
        oid = ObjectId()
        doc = document.copy()
        doc["_id"] = oid
        self._data[str(oid)] = doc
        return FakeInsertResult(oid)

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        # Find the document matching the query (any field)
        doc_key = None
        for key, doc in self._data.items():
            match = True
            for q_key, q_value in query.items():
                if q_key == "_id":
                    if str(doc.get("_id")) != str(q_value):
                        match = False
                        break
                else:
                    if doc.get(q_key) != q_value:
                        match = False
                        break
            if match:
                doc_key = key
                break
        
        if doc_key is None:
            return
        
        # Support {$set: {...}}
        if "$set" in update:
            for k, v in update["$set"].items():
                self._data[doc_key][k] = v
        else:
            for k, v in update.items():
                self._data[doc_key][k] = v

    def delete_one(self, query: Dict[str, Any]):
        # Find the document matching the query (any field)
        doc_key = None
        for key, doc in self._data.items():
            match = True
            for q_key, q_value in query.items():
                if q_key == "_id":
                    if str(doc.get("_id")) != str(q_value):
                        match = False
                        break
                else:
                    if doc.get(q_key) != q_value:
                        match = False
                        break
            if match:
                doc_key = key
                break
        
        if doc_key is None:
            return
        
        self._data.pop(doc_key, None)

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
