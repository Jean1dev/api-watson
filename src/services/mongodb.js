const MongoClient = require('mongodb').MongoClient;
const DATABASE_NAME = 'test'
const uri = process.env.MONGO_URL || 'mongodb+srv://admin:admin@if-tecnologia-mxonm.gcp.mongodb.net/test?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true });

class MongoUtils {

    asyncSaveMessage(message) {
        client.connect(err => {
            const object = {
                message,
                date: new Date()
            }
            client.db(DATABASE_NAME).collection("messages").insertOne(object)
        })
    }
}

module.exports = new MongoUtils()