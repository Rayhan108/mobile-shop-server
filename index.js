const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("NextGen Phone Server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.njyz70v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("NextGenPhnDb").collection("users");

    app.post("/users", async (req, res) => {
      const { name, email, photo } = req.body;
      const role = "buyer";
      const query = { email: email };
      const previousUser = await usersCollection.findOne(query);
      if (previousUser) {
        return res.send({ message: "user already exist" });
      }
      const userData = {
        name,
        email,
        photo,
        role,
      };
      const result = await usersCollection.insertOne(userData);
      res.send(result);
    });

    // get users
    app.get("/allUsers", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

//make seller

app.patch("/seller/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedoc = {
      $set: {
        role: "seller",
      },
    };
    const result = await usersCollection.updateOne(filter, updatedoc);
    res.send(result);
  });

//make admin

  // make admin
  app.patch("/admin/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        role: "admin",
      },
    };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);
  });






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`NextGen Phone is running on port ${port}`);
});
