const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xudqfrq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const toysCollection = client.db('toyFusion').collection('toys')
    // index
    const indexKeys = { toyName: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "searchByToyName" }; // Replace index_name with the desired index name
    const result = await toysCollection.createIndex(indexKeys, indexOptions);




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/alltoys', async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    app.get("/getToyByName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toysCollection
        .find({ toyName: { $regex: text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.id);
      const jobs = await toysCollection
        .find({
          sellerEmail: req.params.email,
        })
        .toArray();
      res.send(jobs);
    });

    app.get("/getToysByCategory/:category", async (req, res) => {
      console.log(req.params.category);
      const toys = await toysCollection
      .find({
        subCategory: req.params.category,
      })
      .toArray();
      res.send(toys)
    })



    app.post("/addToys", async (req, res) => {
      const body = req.body;
      const result = await toysCollection.insertOne(body)
      res.send(result)
    });




    app.put("/updateToy/:id", async(req, res) => {
      const body = req.body;
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      console.log(body);
      const updateDoc = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description
        }
      };
      const result = await toysCollection.updateOne(filter, updateDoc)
      res.send(result);
    })


    app.delete('/delToy/:id', async(req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})
