const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    const db = client.db("erythroshare");
    const donationRequestsCollection = db.collection("donationRequests");

    // create a route to post donation requests
    app.post("/dashboard/create-donation-request", async (req, res) => {
      const {
        name,
        email,
        recipientName,
        recipientDistrict,
        recipientUpazila,
        hospitalName,
        address,
        bloodGroup,
        donationDate,
        donationTime,
        requestedMessage,
      } = req.body;

      const donationRequest = {
        name,
        email,
        recipientName,
        recipientDistrict,
        recipientUpazila,
        hospitalName,
        address,
        bloodGroup,
        donationDate,
        donationTime,
        requestedMessage,
        status: "pending",
        createdAt: new Date(),
      };
      // console.log(donationRequest);
      await donationRequestsCollection.insertOne(donationRequest);
      return res.status(201).json(donationRequest);
    });

    // create a route to get all donation requests
    app.get("/dashboard/my-donation-requests/:id", async (req, res) => {
      const donationRequests = await donationRequestsCollection
        .find()
        .toArray();
      // console.log(donationRequests);
      return res.status(200).json(donationRequests);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (err) {
    console.log(err);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
