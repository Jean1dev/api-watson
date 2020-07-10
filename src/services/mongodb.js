const MongoClient = require('mongodb').MongoClient;
const DATABASE_NAME = 'test'
const uri = process.env.MONGO_URL
const client = new MongoClient(uri, { useNewUrlParser: true });

class MongoUtils {

    asyncSaveMessage(data) {
        client.connect(err => {
            const object = {
                message: data.message,
                props: data.props,
                date: new Date()
            }
            client.db(DATABASE_NAME).collection("messages").insertOne(object)
        })
    }
}

module.exports = new MongoUtils()
