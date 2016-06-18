// npm install
var express = require('express');

var medicineRoute = require('./route/medicineAPI')

var app = express();

console.log("===========================Server is starting===========================");

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use("/Hospital", express.static('../Hospital'));
app.use("/Pharmacy", express.static('../Pharmacy'));

app.use('/medicineAPI', medicineRoute);

app.get('/', function(request, response) {
  console.log('Hello world!');
});

app.listen('8080', function(request, response) {
  console.log('listening to 8080 port');
});
