"""
MediClear AI - Database Service Module
Provides high-availability MongoDB connectivity with automatic local JSON failover.
"""
import os
import json
import uuid
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

DATASTORE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'mediclear_store.json')

class JSONStore:
    def __init__(self, filepath=DATASTORE_PATH):
        self.filepath = filepath
        self._ensure_storage()

    def _ensure_storage(self):
        if not os.path.exists(self.filepath):
            data = {
                'users': [],
                'reports': [],
                'symptoms': [],
                'prescriptions': [],
                'appointments': []
            }
            with open(self.filepath, 'w') as f:
                json.dump(data, f, indent=2)

    def _load_data(self):
        self._ensure_storage()
        try:
            with open(self.filepath, 'r') as f:
                return json.load(f)
        except Exception:
            return {'users': [], 'reports': [], 'symptoms': [], 'prescriptions': [], 'appointments': []}

    def _save_data(self, data):
        with open(self.filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    class StoreCollection:
        def __init__(self, store, col_name):
            self.store = store
            self.name = col_name

        def find_one(self, query):
            data = self.store._load_data()
            items = data.get(self.name, [])
            for item in items:
                if all(item.get(k) == v for k, v in query.items()):
                    c = item.copy()
                    c['_id'] = c.get('id', c.get('_id'))
                    return c
            return None

        def find(self, query=None):
            data = self.store._load_data()
            items = data.get(self.name, [])
            if not query:
                results = items
            else:
                results = [item for item in items if all(item.get(k) == v for k, v in query.items())]
            
            out = []
            for r in results:
                c = r.copy()
                c['_id'] = c.get('id', c.get('_id'))
                out.append(c)
            return out

        def insert_one(self, document):
            data = self.store._load_data()
            if self.name not in data:
                data[self.name] = []
            
            doc = document.copy()
            doc_id = str(doc.get('id', doc.get('_id', uuid.uuid4())))
            doc['id'] = doc_id
            doc['_id'] = doc_id
            data[self.name].append(doc)
            self.store._save_data(data)

            class InsertRes:
                def __init__(self, inserted_id):
                    self.inserted_id = inserted_id
            return InsertRes(doc_id)

        def update_one(self, query, update):
            data = self.store._load_data()
            items = data.get(self.name, [])
            modified = 0
            for item in items:
                if all(item.get(k) == v for k, v in query.items()):
                    if '$set' in update:
                        for k, v in update['$set'].items():
                            item[k] = v
                        modified += 1
            if modified > 0:
                self.store._save_data(data)
            return type('UpdateRes', (), {'modified_count': modified})()

    def get_collection(self, name):
        return self.StoreCollection(self, name)


class MediClearDBManager:
    def __init__(self):
        self.db = None
        self.using_mongo = False
        self.json_store = JSONStore()

    def connect(self, mongo_uri):
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            client.admin.command('ping')
            db_name = mongo_uri.split('/')[-1].split('?')[0] or 'mediclear_ai_db'
            self.db = client[db_name]
            self.using_mongo = True
            print(f"[MediClear DB] Connected to MongoDB at {mongo_uri}")
        except Exception as e:
            print(f"[MediClear DB] MongoDB offline ({e}). Using local JSON store.")
            self.using_mongo = False

    def get_collection(self, collection_name):
        if self.using_mongo and self.db is not None:
            return self.db[collection_name]
        return self.json_store.get_collection(collection_name)


db_service = MediClearDBManager()
