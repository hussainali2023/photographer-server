const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is Running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hsvslpl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const servicesCollection = client.db("photographer").collection("services");
    const reviewsCollection = client.db("photographer").collection("reviews");

    app.get("/services-home", async (req, res) => {
      const query = {};
      const sort = { length: -1 };
      const limit = 3;
      const cursor = servicesCollection.find(query).sort(sort).limit(limit);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      console.log(reviews);
      const result = await reviewsCollection.insertOne(reviews);
      res.send(result);
    });
    app.get("/reviews/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
  } catch {
    console.error(error);
  }
};
run();

app.listen(port, () => {
  console.log(`Photographer Server is running on port: ${port}`);
});
