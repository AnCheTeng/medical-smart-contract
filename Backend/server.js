// npm install
var express = require('express');

// DB Schema
// var Ambulance = require('./model/Ambulance');

// route
var ambulance_route = require('./route/ambulance')

var app = express();

console.log("===========================Server is starting===========================");

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.static('../frontend'));

app.use('/ambulance', ambulance_route);

app.get('/', function(request, response) {
  console.log('Hello world!');
});

app.listen('8080', function(request, response) {
  console.log('listening to 8080 port');
});
