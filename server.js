require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns= require('dns')
let mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// Basic Configuration
const port = process.env.PORT || 3000;
let Schema = mongoose.Schema;
var url_id = 1;
let urlSchema = new Schema({
  "original_url" : String,
  "short_url" : String
});

let Url = mongoose.model('Url', urlSchema);
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
const options = {
    all:true,
};
app.route('/api/shorturl/').post(function(req,res){
       var a = (req.body.url);
      //   if(a.substring(0,4)==="http" && a[4]===':'){
      //     a = a.substring(7,a.length)
      // }
      //   if(a.substring(0,4)=== "http" && a[4]==='s'){
      //     a = a.substring(8,a.length)
      //   }
   var error = false
          console.log("Url lookedup "+ a)
          if(a.substring(0,7)==="http://" || a.substring(0,8)==="https://") 
         {
            console.log(a+" passed lookup")
           // a = a.match('/https?//[^/]*/')
           console.log("Hey is this "+ a)
            if(error) return 
              console.log("Sending JSON ")
              
            Url.findOne({}).sort({"short_url": 'desc'}).exec(
                (err, data)=>{
                    if(err){
                      console.log(err)
                      return
                    }
                    if(data== undefined){
                      let urlobject = new Url({"original_url": req.body.url, "short_url": "1"})
                      res.json({"original_url": req.body.url, "short_url": "1"})
                      urlobject.save((error,data) => {
                        if(error){
                          console.log("Error " + error);
                        }
                      })
                    }
                    else{
                    
                      let urlobject = new Url({"original_url": req.body.url, "short_url": (parseInt(data["short_url"])+1).toString()})
                      res.json({"original_url": req.body.url, "short_url": (parseInt(data["short_url"])+1).toString()})
                      urlobject.save((error,data) => {
                        if(error){
                          console.log("Error " + error);
                        }
                      })
                    }
                }
            )
              
    
          }
           else{
            // console.log("Err : " + err)
            res.send({"error":"invalid url"})
            error = true
          }
        }
      )
  
app.route('/api/shorturl/:id').get(function(req,res){
        console.log("shorturl_id "+ req.params.id)
        // res.redirect(url)
        Url.findOne({"short_url":req.params.id}, function (err, data) {
          if(err){
            res.send({"error":"invalid url"})
          }
          else {
            console.log("redirected to : "+data["original_url"])
            res.redirect(data["original_url"])
          }
          
        });
       })