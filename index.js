const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const e = require("express");
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

    // post donation requests
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

    // get all donation requests
    app.get("/dashboard/all-blood-donation-request", async (req, res) => {
      try {
        const donationRequests = await donationRequestsCollection
          .find()
          .toArray();
        return res.status(200).json(donationRequests);
      } catch (error) {
        console.error("Fetch donation requests error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    // get all donation requests by email (my donation requests)
    app.get("/dashboard/my-donation-requests/:email", async (req, res) => {
      const { email } = req.params;
      try {
        const donationRequests = await donationRequestsCollection
          .find({ email: email })
          .toArray();
        // console.log(donationRequests);
        return res.status(200).json(donationRequests);
      } catch (error) {
        console.error("Fetch donation requests error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    // delete donation request
    app.delete("/dashboard/donation-request/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await donationRequestsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Request not found" });
        }
        return res
          .status(200)
          .json({ success: true, message: "Request deleted" });
      } catch (error) {
        console.error("Delete donation request error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    // get single donation request
    app.get("/dashboard/donation-request/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await donationRequestsCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!result) {
          return res.status(404).json({ message: "Request not found" });
        }
        return res.status(200).json(result);
      } catch (error) {
        console.error("Get donation request error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    // update donation request status and donor info
    app.patch("/dashboard/donation-request-status/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { status, donorName, donorEmail } = req.body;

        const updateDoc = { $set: { status: status } };
        if (donorName) updateDoc.$set.donorName = donorName;
        if (donorEmail) updateDoc.$set.donorEmail = donorEmail;

        const result = await donationRequestsCollection.updateOne(
          { _id: new ObjectId(id) },
          updateDoc,
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Request not found" });
        }
        return res
          .status(200)
          .json({ success: true, message: "Request updated" });
      } catch (error) {
        console.error("Update donation status error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    // full update donation request
    app.put("/dashboard/donation-request/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData._id;

        const result = await donationRequestsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData },
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Request not found" });
        }
        return res
          .status(200)
          .json({ success: true, message: "Request updated successfully" });
      } catch (error) {
        console.error("Full update donation request error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
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

    // get all users with status filtering
    app.get("/dashboard/all-users", async (req, res) => {
      try {
        const { status } = req.query;
        let query = {};

        if (status && status !== "all") {
          query.status = status;
        }

        const users = await db.collection("user").find(query).toArray();
        return res.status(200).json(users);
      } catch (error) {
        console.error("Fetch users error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    // block/unblock user
    app.patch("/dashboard/user-status", async (req, res) => {
      try {
        const { id, status } = req.body;
        if (!id) {
          return res
            .status(400)
            .json({ message: "User Id is required to update user status" });
        }
        if (!status) {
          return res
            .status(400)
            .json({ message: "Status is required to update user status" });
        }
        const result = await db
          .collection("user")
          .updateOne({ _id: new ObjectId(id) }, { $set: { status: status } });
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("User status update error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    // make user admin/volunteer
    app.patch("/dashboard/user-role", async (req, res) => {
      try {
        const { id, role } = req.body;
        if (!id) {
          return res
            .status(400)
            .json({ message: "User Id is required to update user role" });
        }
        if (!role) {
          return res
            .status(400)
            .json({ message: "Role is required to update user role" });
        }
        const result = await db
          .collection("user")
          .updateOne({ _id: new ObjectId(id) }, { $set: { role: role } });
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("User role update error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
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
