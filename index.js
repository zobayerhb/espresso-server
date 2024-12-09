require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 8000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vpupb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffees");
    const usersCollection = client.db("usersDB").collection("users");

    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    app.post("/coffee", async (req, res) => {
      const coffeeReq = req.body;
      // console.log(coffeeReq);
      const result = await coffeeCollection.insertOne(coffeeReq);
      res.send(result);
    });

    // users related API'S
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUsers = req.body;
      const result = await usersCollection.insertOne(newUsers);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedUser = {
        $set: {
          lastSignInTime: req.body?.lastSignInTime,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedUser);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // coffee related api
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const coffee = req.body;
      const options = { upsert: true };
      const coffeeUpdate = {
        $set: {
          name: coffee.name,
          coffeeAvailable: coffee.coffeeAvailable,
          supplier: coffee.supplier,
          taste: coffee.taste,
          category: coffee.category,
          details: coffee.details,
          photoURL: coffee.photoURL,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        coffeeUpdate,
        options
      );
      res.send(result);
    });

    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffee making server is running on port 8000");
});

app.listen(port, () => {
  console.log(`Coffe server runnning on port ${port}`);
});
