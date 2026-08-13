from pymongo import MongoClient

uri = 'mongodb+srv://nareshchaudhary1532_db_user:iuCMApVS5YnUjtFP@cluster0.d3juwyc.mongodb.net/business_manager?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true'
print('Trying to connect with tlsAllowInvalidCertificates')
client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
try:
    client.admin.command('ping')
    print('CONNECTED (with invalid certs allowed)')
except Exception as e:
    print('ERROR:', type(e).__name__, str(e))
