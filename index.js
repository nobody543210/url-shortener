require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns =  require('dns');
const urlParser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const db = client.db('url')
const urls = db.collection('url')


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {

  const url = req.body.url;
  const dnsLookup = dns.lookup(urlParser.parse(url).hostname,
   async(err, address)=>{
    if(!address){
      res.json({ error: 'invalid url' })
    }else{
    await client.connect();
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      res.json({ original_url: url, short_url: urlCount })
    }

   }
)
});


app.get('/api/shorturl/:short_url', async function(req, res) {
  const shorturl = req.params.short_url
  const urlDoc = await urls.findOne({ short_url: +shorturl })
  res.redirect(urlDoc.url)
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
