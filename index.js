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

    const db = client.db("erythro-share");
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

    // update profile
    app.patch("/dashboard/profile", async (req, res) => {
      try {
        const { name, email, image, bloodGroup, district, upazila } = req.body;

        if (!email) {
          return res
            .status(400)
            .json({ message: "Email is required to update profile" });
        }

        const updateUser = {
          name,
          image,
          bloodGroup,
          district,
          upazila,
        };

        // Remove undefined fields to avoid overwriting with null
        Object.keys(updateUser).forEach(
          (key) => updateUser[key] === undefined && delete updateUser[key],
        );

        const result = await db
          .collection("user")
          .updateOne({ email: email }, { $set: updateUser });

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ ...updateUser, success: true });
      } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    // get all users
    app.get("/dashboard/all-users", async (req, res) => {
      const users = await db.collection("user").find().toArray();
      return res.status(200).json(users);
    });

    // block/unblock and make admin/volunteer user
    app.patch("/dashboard/user-status", async (req, res) => {
      const { email, status, role } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ message: "Email is required to update user status" });
      }
      if (!status) {
        return res
          .status(400)
          .json({ message: "Status is required to update user status" });
      }
      if (!role) {
        return res
          .status(400)
          .json({ message: "Role is required to update user status" });
      }
      const result = await db.collection("user").updateOne();
      return res.status(200).json({ success: true });
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
