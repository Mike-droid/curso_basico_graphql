const { MongoClient } = require('mongodb');

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME
} = process.env;

const mongoUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.z54zv.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

let conection;

async function connectDB() {
    if (conection) {
        return conection;
    }
    let client;
    try {
        client = await MongoClient.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        conection = client.db(DB_NAME);
    } catch (error) {
        console.error('Could not connect to DB 😪', mongoUrl , error);
        process.exit(1);
    }
    return conection;
}

module.exports = connectDB;