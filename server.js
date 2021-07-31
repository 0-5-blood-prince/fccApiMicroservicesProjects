var express = require('express');
var cors = require('cors');
var multer = require('multer')
require('dotenv').config()

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })

app.post('/api/fileanalyse', upload.single('upfile'), (req, res, next) => {
  console.log("Recieved a file")
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  var response = {
      "name": req.file.originalname,
      "type": req.file.mimetype,
      "size": req.file.size
    };
  console.log(response)
    res.json(response)
  
})



const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
