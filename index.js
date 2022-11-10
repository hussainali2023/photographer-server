const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const run = async () => {
  try {
    const servicesCollection = client.db("photographer").collection("services");
    const reviewsCollection = client.db("photographer").collection("reviews");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

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
      const sort = { length: 1 };
      const cursor = servicesCollection.find(query).sort(sort);
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
    app.get("/reviews/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get("/reviews/:shortName", async (req, res) => {
      const shortName = req.params.shortName;
      const query = { shortName: shortName };
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    // update
    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      const option = { upsart: true };
      const updatedUser = {
        $set: {
          name: user.name,
          photoURL: user.photoURL,
          serviceId: user.serviceId,
          email: user.email,
          message: user.message,
        },
      };
      const result = await reviewsCollection.updateOne(
        filter,
        updatedUser,
        option
      );
      res.send(result);
    });
  } catch {
    console.error(error);
  }
};
run();

app.listen(port, () => {
  console.log(`Photographer Server is running on port: ${port}`);
});
