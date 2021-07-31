const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

let mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// const Schema = mongoose.Schema;

let Schema = mongoose.Schema;

let userSchema = new Schema({
  username: {type: String, required: true},
  logs: [{
    description: String,
    duration: Number,
    date: Date
  }]
});

let User = mongoose.model('User', userSchema);





app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

app.post('/api/users/',
       function(req,res){
          var username = req.body.username
          User.find({"username":username}, (err,result)=>{
                      console.log(result)
                      
                     if(err){
                       console.log(err)
                     }
                    if(result.length == 0){
                          let user = new User({"username": username,logs: []})
                          user.save((error,data) => {
                            if(error){
                              console.log(error);
                            }else{
                              console.log("user is saved with name "+ username+" id is " +data._id);
                              res.send({"username": username,"_id": data["_id"]})
                            }
                          })
                    }
                     else {
                        res.send("Username already taken");
                     }
                    })
          
            
        })
app.get('/api/users/',
       function(req,res){
          User.find({},(err,data)=>{
            if(err){
              console.log(err)
            }
            else{
              var users = []
              data.forEach(user =>{
                users.push({"username":user["username"],"_id":user["_id"]})
              })
              console.log("Sent Users")
              res.json(users)
              
            }
          })
            
        })
app.post('/api/users/:_id/exercises',(req,res)=>{
  var id = req.params._id;
  var b = req.body
  console.log("exercise :",b)
  User.findById(id, (error, result) => {
    if(error){
      console.log(error)
    }else{
      b["duration"] = parseInt(b["duration"])
      if(b["date"]==undefined) b["date"] = new Date(Date.now()).toDateString();
      else b["date"] = new Date(Date.parse(b["date"])).toDateString();
    console.log("updated exercise :",b)
      result.logs.push(b)
      result.save((error, updatedResult) => {
        if(error){
          console.log(error)
        }else{
          console.log("Updated Logs")
          const options = { weekday: 'short',year: 'numeric', month: 'short', day: 'numeric' };
// "description":b["description"],
                   // "duration":(b["duration"]),"date": (new Date(b["date"])).toLocaleDateString(undefined,options)
         
        }
      })
      // var c = updatedResult.logs[updatedResult.logs.length-1];
      // console.log(updatedResult.logs)
      var s = {"_id":req.params._id,"username": result["username"],"date": b["date"],"duration":b["duration"],"description":b["description"]}
      console.log(s)
      res.json(s)
      
    }
  })
})
app.get('/api/users/:_id/logs',(req,res)=>{
  const from = req.query.from ? new Date(req.query.from) : 0;
  var limit = req.query.limit
  const to = req.query.to ? new Date(req.query.to) : new Date(2999,12,30);
  if(limit){
    
  }
  else limit = 100
  console.log(req.params._id + "\n" + from + "\n"+ to + "\n" + limit)
  User.findById(req.params._id, (error, result) => {
    if (error) {
      console.log(error)
    }
    else{
      var logs = result["logs"]
      if (req.query.from || req.query.to) {
        logs = logs.filter(ele => {
          var d = new Date(ele.date).getTime();
          return d >= from.getTime() && d <= to.getTime();
        });
      }
      logs = logs.slice(0, req.query.limit);
      res.json({
        _id : req.params.id,
        "username" : result["username"],
        "log": logs,
        "count": logs.length
      });
    }
      
    
  });
})