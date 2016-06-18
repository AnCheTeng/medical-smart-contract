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
  response.redirect('medicineAPI')
});

'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();

console.log("---Server IP---");
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }
    ++alias;
  });
});

app.listen('8888', function(request, response) {
  console.log('listening to 8888 port');
});
