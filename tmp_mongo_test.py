from pymongo import MongoClient

uri = 'mongodb+srv://nareshchaudhary1532_db_user:iuCMApVS5YnUjtFP@cluster0.d3juwyc.mongodb.net/business_manager?retryWrites=true&w=majority'
print('Trying to connect to', uri)
client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
try:
    client.admin.command('ping')
    print('CONNECTED')
except Exception as e:
    print('ERROR:', type(e).__name__, str(e))
