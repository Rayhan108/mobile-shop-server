const express = require("express");
const app = express();
var jwt = require('jsonwebtoken');
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


// jwt verify middleware

const verifyAccess = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).send({ error: true, message: 'You are not valid user,unauthorized access ' });
    }
  
    const token = authorization.split(' ')[1];
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ error: true, message: 'You are not valid user,unauthorized access' })
      }
      req.decoded = decoded;
      next();
    })
  }






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

    app.post('/jwt',(req,res)=>{
        const user = req.body;
        const token =jwt.sign(user,process.env.ACCESS_SECRET_TOKEN,{expiresIn:'1h'})
        res.send({token});
      
      })
      


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

    // get admin role
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });
    // get seller role
    app.get("/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "seller" };
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
