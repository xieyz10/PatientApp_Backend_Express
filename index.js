//express_demo.js 文件
var express = require('express');
var fs = require('fs');
var multer = require('multer');
const url = require('url');

var upload = multer({ dest: 'resources/userImage/' });
var app = express();
app.set('port', (process.env.PORT || 5000));
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// var DEFAULT_PORT = 5000
var DEFAULT_HOST = '127.0.0.1'
var SERVER_NAME = 'patientApp'

// var http = require('http');
var mongoose = require("mongoose");

var port = process.env.PORT;
var ipaddress = process.env.IP;

var uristring =
  process.env.MONGODB_URI ||
  //'mongodb://127.0.0.1:27017/patientCareApp';
  'mongodb+srv://MAPD712PatientApp:AYEZGNZeFw9cclQk@cluster0.uzxamyj.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(uristring, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log("!!!! Connected to db: " + uristring)
});

const userSchema = new mongoose.Schema({
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

const patientSchema = new mongoose.Schema({
  patientUserName:String,
  firstName: String,
  lastName:String,
  address:String,
  dateOfBirth: String,
  doctorName: String,
  doctorID: String,
  sex: String,
  phoneNumber:String,
  emailAddress:String,
  emergencyContact:String,
  emergencyContactPhoneNumber:String,
  bedNumber: String,
  imageUri: String,
  imageType: String,
  imageName: String,
})

const appointmentSchema = new mongoose.Schema({
  patientName:String,
  address:String,
  doctorID: String,
  phoneNumber:String,
  emailAddress:String,
  appointmentTime:String,
  patientSymptom:String,
  imageUri: String,
  imageType: String,
  imageName: String,
})

var User = mongoose.model('User', userSchema);
var Patient = mongoose.model('Patient', patientSchema);
var Appointment = mongoose.model('Appointment', appointmentSchema);

if (typeof ipaddress === "undefined") {
  //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
  //  allows us to run/test the app locally.
  console.warn('No process.env.IP var, using default: ' + DEFAULT_HOST);
  ipaddress = DEFAULT_HOST;
};

// if (typeof port === "undefined") {
//   console.warn('No process.env.PORT var, using default port: ' + DEFAULT_PORT);
//   port = DEFAULT_PORT;
// };

var server = app.listen(app.get('port'), function () { //port 5000

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})

app.get('/', function (req, res) {
  res.send('Hello World');
})

//User Register
app.post('/register', function (req, res) {
  // console.log("_dirnamee is:"+__dirname)
  // console.log("filename is:"+__filename)
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
  var des_file = "resources/userImage/" + req.body.username+'.jpg'
  fs.readFile(url.fileURLToPath(req.body.imageUri), function (err, data) {
    fs.writeFile(des_file, data, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Success!");
      }
    });
  });

  // Creating new user.
  var newUser = new User({
    username: req.body.username,
    password: req.body.password,
    occupation: req.body.occupation,
    dateOfBirth: req.body.dateOfBirth,
    emailAddress: req.body.emailAddress,
    phoneNumber: req.body.phoneNumber,
    imageUri: url.pathToFileURL(__dirname+"/resources/userImage/"+ req.body.username)+'.jpg',
    imageType: req.body.imageType,
    imageName: req.body.imageName
  });

  console.log("newUser.imageuri is"+newUser.imageUri)

  // Create the new user and saving to db
  newUser.save(function (error, result) {
    // If there are any errors, pass them to next in the correct format
    if (error) { console.log(error) }
    // Send the login if no issues
    res.send(201, result)
  })
})

//Create Patient
app.post('/createPatient', function (req, res) {
  // console.log("_dirnamee is:"+__dirname)
  // console.log("filename is:"+__filename)
  console.log('POST request: login params=>' + JSON.stringify(req.params));
  console.log('POST request: login body=>' + JSON.stringify(req.body));
  // Make sure name is defined
  if (req.body.patientUserName === undefined) {
    // If there are any errors, pass them to next in the correct format
    throw new Error("username cannot be empty")
  }

  // Creating new user.
  var newPatient = new Patient({
    patientUserName:req.body.patientUserName,
    firstName: req.body.firstName,
    lastName:req.body.lastName,
    address:req.body.address,
    dateOfBirth: req.body.dateOfBirth,
    doctorName: req.body.doctorName,
    doctorID: req.body.doctorID,
    sex: req.body.sex,
    phoneNumber:req.body.phoneNumber,
    emailAddress:req.body.emailAddress,
    emergencyContact:req.body.emergencyContact,
    emergencyContactPhoneNumber:req.body.emergencyContactPhoneNumber,
    bedNumber: req.body.bedNumber,
    imageType: req.body.imageType,
    imageName: req.body.imageName,
  });
  // Create the new user and saving to db
  newPatient.save(function (error, result) {
    // If there are any errors, pass them to next in the correct format
    if (error) { console.log(error) }
    // Send the login if no issues
    res.send(201, result)
  })
})

//User Login
app.get('/login', function (req, res, next) {
  var collection = db.collection('users');
  collection.findOne({username: req.query.username, password:req.query.password }, function (err, user) {
    if (err) throw err;
    if (user){
      console.log(user)
      // res.send(user)
      res.json(200, user)
    }
    else
      res.send(404)
  });
})

//find all patients by doctor ID
app.get('/patients', function (req, res, next) {
  var collection = db.collection('patients');
  collection.find({doctorID: req.query.doctorID}).toArray(function (err, patients) {
    if(patients){
      res.json(200, patients)
    }else{
      res.send(404)
    }
  });
})

//Add an appointment
//Create Patient
app.post('/createAppointment', function (req, res) {
  // console.log("_dirnamee is:"+__dirname)
  // console.log("filename is:"+__filename)
  console.log('POST request: login params=>' + JSON.stringify(req.params));
  console.log('POST request: login body=>' + JSON.stringify(req.body));
  // Make sure name is defined
  if (req.body.patientName === undefined) {
    // If there are any errors, pass them to next in the correct format
    throw new Error("patientName cannot be empty")
  }
  //upload image
  var des_file = "resources/appointmentAvatar/" + req.body.patientName+'.jpg'
  fs.readFile(url.fileURLToPath(req.body.imageUri), function (err, data) {
    fs.writeFile(des_file, data, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Success!");
      }
    });
  });

  // Creating new user.
  var newAppointment = new Appointment({
    patientName:req.body.patientName,
    address: req.body.address,
    doctorID:req.body.doctorID,
    phoneNumber:req.body.phoneNumber,
    emailAddress: req.body.emailAddress,
    appointmentTime: req.body.appointmentTime,
    patientSymptom: req.body.patientSymptom,
    imageUri: url.pathToFileURL(__dirname+"/resources/appointmentAvatar/"+ req.body.patientName)+'.jpg'
  });

  // Create the new user and saving to db
  newAppointment.save(function (error, result) {
    // If there are any errors, pass them to next in the correct format
    if (error) { console.log(error) }
    // Send the login if no issues
    res.send(201, result)
  })
})

//find all appointments by doctor ID
app.get('/appointments', function (req, res, next) {
  var collection = db.collection('appointments');
  collection.find({doctorID: req.query.doctorID}).toArray(function (err, appointments) {
    if(appointments){
      res.json(200, appointments)
    }else{
      res.send(404)
    }
  });
})
