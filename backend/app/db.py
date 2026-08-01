import os
import json
import uuid
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

DB_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data_store.json')

class JSONDatabase:
    """Local JSON fallback database when MongoDB server is not active."""
    def __init__(self, filepath=DB_FILE_PATH):
        self.filepath = filepath
        self._ensure_file()

    def _ensure_file(self):
        if not os.path.exists(self.filepath):
            initial_data = {
                'users': [],
                'reports': [],
                'symptoms': [],
                'prescriptions': [],
                'appointments': []
            }
            with open(self.filepath, 'w') as f:
                json.dump(initial_data, f, indent=2)

    def _read_all(self):
        self._ensure_file()
        try:
            with open(self.filepath, 'r') as f:
                return json.load(f)
        except Exception:
            return {'users': [], 'reports': [], 'symptoms': [], 'prescriptions': [], 'appointments': []}

    def _write_all(self, data):
        with open(self.filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    class Collection:
        def __init__(self, json_db, collection_name):
            self.db = json_db
            self.name = collection_name

        def find_one(self, query):
            data = self.db._read_all()
            items = data.get(self.name, [])
            for item in items:
                if all(item.get(k) == v for k, v in query.items()):
                    item_copy = item.copy()
                    item_copy['_id'] = item_copy.get('id', item_copy.get('_id'))
                    return item_copy
            return None

        def find(self, query=None):
            data = self.db._read_all()
            items = data.get(self.name, [])
            if not query:
                results = items
            else:
                results = [item for item in items if all(item.get(k) == v for k, v in query.items())]
            
            # Decorate with _id
            formatted = []
            for r in results:
                c = r.copy()
                c['_id'] = c.get('id', c.get('_id'))
                formatted.append(c)
            return formatted

        def insert_one(self, document):
            data = self.db._read_all()
            if self.name not in data:
                data[self.name] = []
            
            doc_copy = document.copy()
            if '_id' not in doc_copy and 'id' not in doc_copy:
                doc_copy['id'] = str(uuid.uuid4())
            elif '_id' in doc_copy:
                doc_copy['id'] = str(doc_copy['_id'])
            
            doc_copy['_id'] = doc_copy['id']
            data[self.name].append(doc_copy)
            self.db._write_all(data)

            class InsertResult:
                def __init__(self, inserted_id):
                    self.inserted_id = inserted_id
            return InsertResult(doc_copy['id'])

        def update_one(self, query, update):
            data = self.db._read_all()
            items = data.get(self.name, [])
            modified = 0
            for item in items:
                if all(item.get(k) == v for k, v in query.items()):
                    if '$set' in update:
                        for k, v in update['$set'].items():
                            item[k] = v
                        modified += 1
            if modified > 0:
                self.db._write_all(data)
            return type('UpdateResult', (), {'modified_count': modified})()

        def delete_one(self, query):
            data = self.db._read_all()
            items = data.get(self.name, [])
            new_items = [item for item in items if not all(item.get(k) == v for k, v in query.items())]
            deleted = len(items) - len(new_items)
            data[self.name] = new_items
            self.db._write_all(data)
            return type('DeleteResult', (), {'deleted_count': deleted})()

    def get_collection(self, name):
        return self.Collection(self, name)


class DatabaseManager:
    def __init__(self):
        self.db = None
        self.is_mongo = False
        self.json_db = JSONDatabase()

    def init_db(self, mongo_uri):
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            client.admin.command('ping')
            db_name = mongo_uri.split('/')[-1].split('?')[0] or 'mediclear_db'
            self.db = client[db_name]
            self.is_mongo = True
            print(f"[DatabaseManager] Connected successfully to MongoDB at {mongo_uri}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            print(f"[DatabaseManager] MongoDB not available ({e}). Falling back to local JSON persistence engine.")
            self.is_mongo = False

    def get_collection(self, collection_name):
        if self.is_mongo and self.db is not None:
            return self.db[collection_name]
        return self.json_db.get_collection(collection_name)


db_manager = DatabaseManager()
