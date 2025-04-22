const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let db;

async function connectToMongoDB() {
    console.log("Connecting to MongoDB...");
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("MongoDB Connected!");
        db = client.db("rideHailingApp");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}

connectToMongoDB();

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// RIDES MANAGEMENT //

// Fetch ride //
app.get('/rides', async (req, res) => {
    try {
        const rides = await db.collection('rides').find().toArray();
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ error: "Cannot fetch rides" });
    }
});

// Cancel ride //
app.delete('/rides/:id', async (req, res) => {
    try {
        const result = await db.collection('rides').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Ride not found" });
        }
        res.status(200).json({ deleted: result.deletedCount });
    } catch (err) {
        res.status(400).json({ error: "Invalid Ride ID" });
    }
});

// ADMIN MANAGEMENT //

// Block (delete) user //
app.delete('/admin/users/:id', async (req, res) => {
    try {
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ deleted: result.deletedCount });
    } catch (err) {
        res.status(400).json({ error: "Invalid User ID" });
    }
});

// View users //
app.get('/admin/users', async (req, res) => {
    try {
        const users = await db.collection('users').find().toArray();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "Cannot fetch users" });
    }
});

// View all drivers //
app.get('/admin/drivers', async (req, res) => {
    try {
        const drivers = await db.collection('drivers').find().toArray();
        res.status(200).json(drivers);
    } catch (err) {
        res.status(500).json({ error: "Cannot fetch drivers" });
    }
});

// DRIVER MANAGEMENT //

// Register new driver //
app.post('/drivers/register', async (req, res) => {
    try {
        const result = await db.collection('drivers').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: "Invalid driver data" });
    }
});

// Update driver availability //
app.patch('/drivers/:id/availability', async (req, res) => {
    try {
        const result = await db.collection('drivers').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { available: req.body.available } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Driver not found" });
        }
        res.status(200).json({ updated: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: "Invalid Driver ID" });
    }
});

// Driver accepts booking //
app.post('/drivers/accept', async (req, res) => {
    try {
        const result = await db.collection('rides').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: "Invalid booking data" });
    }
});

//  USER MANAGEMENT //

// Register a new user
app.post('/users/register', async (req, res) => {
    try {
        const result = await db.collection('users').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: "Invalid user data" });
    }
});

// User booking ride //
app.post('/users/book', async (req, res) => {
    try {
        const result = await db.collection('rides').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: "Invalid ride booking data" });
    }
});

// User login //
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        const user = await db.collection('users').findOne({ email, password });

        if (!user) {
            return res.status(401).json({ error: "Incorrect email or password" });
        }

        const { _id, name } = user;
        res.status(200).json({ _id, name, email });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// Rating driving //
app.patch('/users/rate/:id', async (req, res) => {
    try {
        const result = await db.collection('drivers').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { rating: req.body.rating } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Driver not found" });
        }
        res.status(200).json({ updated: result.modifiedCount });
    } catch (err) {
        res.status(400).json({ error: "Invalid Driver ID or data" });
    }
});
