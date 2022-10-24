//express_demo.js 文件
var express = require('express');
var fs = require('fs');
var multer = require('multer');
const url = require('url');

var upload = multer({ dest: 'uploads/' });
var app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var DEFAULT_PORT = 5000
var DEFAULT_HOST = '127.0.0.1'
var SERVER_NAME = 'patientApp'

var http = require('http');
var mongoose = require("mongoose");

var port = process.env.PORT;
var ipaddress = process.env.IP;

var uristring =
  process.env.MONGODB_URI ||
  //'mongodb://127.0.0.1:27017/data';
  'mongodb+srv://MAPD712PatientApp:AYEZGNZeFw9cclQk@cluster0.uzxamyj.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(uristring, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log("!!!! Connected to db: " + uristring)
});

var registerSchema = new mongoose.Schema({
  username: String,
  password: String,
  occupation: String,
  dateOfBirth: String,
  emailAddress: String,
  phoneNumber: String,
  imageUri: String,
  imageType: String,
  imageName: String
})

var Resgiter = mongoose.model('Register', registerSchema);

if (typeof ipaddress === "undefined") {
  //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
  //  allows us to run/test the app locally.
  console.warn('No process.env.IP var, using default: ' + DEFAULT_HOST);
  ipaddress = DEFAULT_HOST;
};

if (typeof port === "undefined") {
  console.warn('No process.env.PORT var, using default port: ' + DEFAULT_PORT);
  port = DEFAULT_PORT;
};

var server = app.listen(5000, function () { //port 5000

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})

app.get('/', function (req, res) {
  res.send('Hello World');
})

//Register Part
app.post('/register', upload.single('fileData'), function (req, res) {
  console.log('POST request: login params=>' + JSON.stringify(req.params));
  console.log('POST request: login body=>' + JSON.stringify(req.body));
  // Make sure name is defined
  if (req.body.username === undefined) {
    // If there are any errors, pass them to next in the correct format
    throw new Error("username cannot be empty")
  }
  if (req.body.password === undefined) {
    // If there are any errors, pass them to next in the correct format
    throw new Error("password cannot be empty")
  }

  //upload image
  var des_file = "userImage/" + req.body.username
  fs.readFile( url.fileURLToPath(req.body.imageUri) , function (err, data) {
      fs.writeFile(des_file, data, function (err) {
          if( err ){
              console.log( err );
          }else{
              console.log("Success!");
          }
      });
  });

  // Creating new Login.
  var newUser = new Resgiter({
    username: req.body.username,
    password: req.body.password,
    occupation: req.body.occupation,
    dateOfBirth: req.body.dateOfBirth,
    emailAddress: req.body.emailAddress,
    phoneNumber: req.body.phoneNumber,
    imageUri: '/userImage/'+username,
    imageType: req.body.imageType,
    imageName: req.body.imageName
  });

  // Create the new user and saving to db
  newUser.save(function (error, result) {
    // If there are any errors, pass them to next in the correct format
    if (error) return next(new Error(JSON.stringify(error.errors)))
    // Send the login if no issues
    res.send(201, result)
  })
})
