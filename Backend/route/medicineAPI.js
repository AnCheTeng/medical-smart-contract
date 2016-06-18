var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();
var parseUrlencoded = bodyParser.urlencoded({
  extended: false
});


router.route('/setPatientMedicine')
  .get(parseUrlencoded, function(request, response) {
    response.send("Hello world");
  });


router.route('/getPatientInfo')
.get(parseUrlencoded, function(request, response) {
  response.send("Hello world");
});


router.route('/takeMedicine')
.get(parseUrlencoded, function(request, response) {
  response.send("Hello world");
});


module.exports = router;
