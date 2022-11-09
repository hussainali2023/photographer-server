const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

    app.get("/services-home", async (req, res) => {
      const query = {};
      const sort = { length: -1 };
      const limit = 3;
      const cursor = servicesCollection.find(query).sort(sort).limit(limit);
      const services = await cursor.toArray();
      res.send(services);
    });
  } catch {
    console.error(error);
  }
};
run();

app.listen(port, () => {
  console.log(`Photographer Server is running on port: ${port}`);
});
