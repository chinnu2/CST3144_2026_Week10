
// Import dependencies
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

// Create Express instance
const app = express();

app.use(express.json());
app.set('port', 3000);

// Configure CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, Accept, X-Requested-With, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Connect to MongoDB
const uri = 'mongodb+srv://sinuchinnu556_db_user:wednesday@cluster0.j9feal1.mongodb.net/?retryWrites=true&w=majority';
//mongodb+srv://sinuchinnu556_db_user:wednesday@cluster0.j9feal1.mongodb.net/

//const client = new MongoClient(uri);
//const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

let db;

async function startServer() {
    try {
        await client.connect();

        console.log('Connected successfully to MongoDB');

        db = client.db('Webstore');

        // Root path
        app.get('/', (req, res) => {
            res.send('Select a collection, e.g., /collection/messages');
        });

        // Get collection name
        app.param('collectionName', (req, res, next, collectionName) => {
            req.collection = db.collection(collectionName);
            next();
        });

        // Retrieve all objects
        app.get('/collection/:collectionName', async (req, res, next) => {
            try {
                const results = await req.collection.find({}).toArray();
                res.send(results);
            } catch (err) {
                next(err);
            }
        });

        // Insert a new object
        app.post('/collection/:collectionName', async (req, res, next) => {
            try {
                const result = await req.collection.insertOne(req.body);
                res.status(201).send({
                    msg: 'success',
                    insertedId: result.insertedId
                });
            } catch (err) {
                next(err);
            }
        });

        // Retrieve an object using ObjectId
        app.get('/collection/:collectionName/:id', async (req, res, next) => {
            try {
                if (!ObjectId.isValid(req.params.id)) {
                    return res.status(400).send({ msg: 'Invalid ObjectId' });
                }

                const result = await req.collection.findOne({
                    _id: new ObjectId(req.params.id)
                });

                res.send(result);
            } catch (err) {
                next(err);
            }
        });

        // Update an object
        app.put('/collection/:collectionName/:id', async (req, res, next) => {
            try {
                if (!ObjectId.isValid(req.params.id)) {
                    return res.status(400).send({ msg: 'Invalid ObjectId' });
                }

                const result = await req.collection.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $set: req.body }
                );

                res.send(result.matchedCount === 1
                    ? { msg: 'success' }
                    : { msg: 'error' });
            } catch (err) {
                next(err);
            }
        });

        // Delete an object
        app.delete('/collection/:collectionName/:id', async (req, res, next) => {
            try {
                if (!ObjectId.isValid(req.params.id)) {
                    return res.status(400).send({ msg: 'Invalid ObjectId' });
                }

                const result = await req.collection.deleteOne({
                    _id: new ObjectId(req.params.id)
                });

                res.send(result.deletedCount === 1
                    ? { msg: 'success' }
                    : { msg: 'error' });
            } catch (err) {
                next(err);
            }
        });

        // Error handling
        app.use((err, req, res, next) => {
            console.error(err);
            res.status(500).send({ error: 'Server error' });
        });
// Start server only after MongoDB connects
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Express.js server running at localhost:${port}`);
});
        // Start server only after MongoDB connects
       // app.listen(3000, () => {
          //  console.log('Express.js server running at localhost:3000');
       // });

    } catch (err) {
        console.error('MongoDB connection failed:', err);
    }
}


startServer();
