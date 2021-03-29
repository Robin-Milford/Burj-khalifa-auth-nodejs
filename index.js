const express = require('express')
const bodyParser=require('body-parser');
const cors=require('cors')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const port = 5000


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cigf8.mongodb.net/BurjAlArab?retryWrites=true&w=majority`;


const admin = require('firebase-admin');
var serviceAccount = require("./auth-recap-f56c2-firebase-adminsdk-43kem-24989194d3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express()
app.use(cors());
app.use(bodyParser.json());


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("BurjAlArab").collection("Bookings");
  console.log('Db connected successfully')

  app.post('/addBooking',(req,res)=>{
      const newBooking=req.body;
      bookings.insertOne(newBooking)
      .then(result=>{
       res.send(result.insertedCount>0)
      })
      console.log(newBooking);
  }) 

  app.get('/bookings',(req,res)=>{
      const bearer=req.headers.authorization;
      if (bearer && bearer.startsWith('Bearer ')) {
          const idToken=bearer.split(' ')[1];
          admin.auth().verifyIdToken(idToken)
          .then(function(decodedToken){
              let tokenEmail=decodedToken.email;
              if (tokenEmail == req.query.email) {
                  bookings.find({})
                  .toArray((err,documents)=>{
                      res.send(documents);
                  }) 
              }
          }).catch(function(error){
              //handle error
          })
      }
      else{
        res.status(401).send('Unauthorized access')
      }
  })



});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)