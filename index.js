const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const upload = require('express-fileupload');

const port = 5000
const uri = "mongodb+srv://hossainmdrobin09:hossainmdrobin09@cluster0.mgbyb.mongodb.net/mobilerepair?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('service'));
app.use(upload())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

client.connect(err => {
  const serviceCollection = client.db("mobilerepair").collection("service");
  const mechanicCollection = client.db("mobilerepair").collection("mechanic");
  const customerCollection = client.db("mobilerepair").collection("customer");
  console.log('connected');

  //UPLOADING SERVICE DATA TO MONGODB INCLUDING PICTURES#######################
  app.post('/service',(req,res)=>{
    const name= req.body.name;
    const description = req.body.description;
    const cost = req.body.cost;
    const file = req.files.photo;
    dbFilePath = `${file.name}`
    const filePath = `${__dirname}/service/${file.name}`;
    file.mv(filePath, err =>{
      if(err) console.log(err);
    })
    serviceCollection.insertOne({name,description,cost,dbFilePath},(err,result) =>{
      if(err) console.log(err);
      res.send(result);
    })
  })

  //LOADING SERVICE DETAIL FROM MONGODB
  app.get('/loadservices',(req, res) => {
    serviceCollection.find({})
    .toArray((err, result) => {
      if(err) console.log(err);
      res.send(result)
    })
  })

  //UPLOADING MECHANIC'S DATA TO MONGODB INCLUDING PICTURES#######################
  app.post('/mechanic',(req,res)=>{
    const name= req.body.name;
    const about = req.body.about;
    const email = req.body.email;
    const file = req.files.photo;
    const randomNumber = Math.random();
    const number = (randomNumber*1000000000);
    const int = Math.floor(number);
    
    let additionalName = int.toString();
    
    dbFilePath = `${additionalName}${file.name}`
    const filePath = `${__dirname}/service/${additionalName}${file.name}`;
    file.mv(filePath, err =>{
      if(err) console.log(err);
    })
    mechanicCollection.insertOne({name,about,email,dbFilePath},(err,result) =>{
      if(err) console.log(err);
      res.send(result);
    })
  })

  //LOADING MECHANIC DETAIL FROM MONGODB
  app.get('/loadmechanics',(req, res) => {
    mechanicCollection.find({})
    .toArray((err, result) => {
      if(err) console.log(err);
      res.send(result)
    })
  })

  // POST CUSTOMER DETAIL ON CUSTOMER COLLECTION ON MONGODB
  app.post('/customer',(req,res) => {
    const customerDetail = req.body;
    customerCollection.insertOne(customerDetail, (err, result) =>{
      if(err) console.log(err)
      res.send(result);
    })
  })
  app.post('/loadcustomer', (req,res) => {
    const loggedInUser = req.body;
    mechanicCollection.find(loggedInUser)
    .toArray((err,result) => {
      if(err) throw err;
      if(result.length > 0){
        customerCollection.find({})
        .toArray((err, result)=>{
          if(err) throw err;
          res.send(result);
        })
      }else{
        customerCollection.find(loggedInUser)
        .toArray((err, result)=>{
          if(err) throw err;
          res.send(result);
        })
      }
    })
    
    
  })
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})