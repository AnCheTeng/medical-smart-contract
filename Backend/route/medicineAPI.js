var express = require('express');
var bodyParser = require('body-parser');
var cool = require('cool-ascii-faces');
var exec = require('child_process').exec;

var router = express.Router();
var parseUrlencoded = bodyParser.urlencoded({
  extended: false
});

router.route('/')
  .get(parseUrlencoded, function(request, response) {
  	var result = '<title>MedicineAPI</title><h1 style="color:green;">Welcome to MedicineAPI</h1>';
  	var times = process.env.TIMES || 5;
  	for (i = 0; i < times; i++)
  	  result += ('<p>' + cool() + '</p>');
  	result += ('<br /><br /><h3 style="color:#6f502c;"> Need help? see <a href="/medicineAPI/API-list" style="color:green;">API list<a> </h3>');
  	response.send(result);
  });

// API 查詢頁
router.route('/API-list')
  .get(parseUrlencoded, function(request, response) {
  	var result = '<title>API-list</title><h1 style="color:#ad604c;">API list</h1>';
  	result += ('<h3 style="color:#6f502c;"> setMedicine <a href="setMedicine" style="color:green;">GO!<a> </h3>');
  	result += ('<h3 style="color:#6f502c;"> getMedicine <a href="getMedicine" style="color:green;">GO!<a> </h3>');
  	result += ('<h3 style="color:#6f502c;"> takeMedicine <a href="takeMedicine" style="color:green;">GO!<a> </h3>');
  	response.send(result);
  });

// ============= API =============

function PromiseExec(cmd) {
  return new Promise(function(resolve, reject) {
    exec(cmd, function(error, stdout, stderr) {
      if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

var cmdPrefix = "sudo docker exec -i ";
var cmdSrcPath = " src/gcoin-cli ";
var cmdMint = "mint";
var cmdAddress = "getfixedaddress";
var cmdUnspent = "listunspent";

function DockerCmd(role) {
  var cmd = cmdPrefix + role + cmdSrcPath;
  for (var i = 1; i < arguments.length; i++)
    cmd += (arguments[i] + ' ');
  console.log("==EXEC==", cmd)
  return cmd;
}

// 開藥單
router.route('/setMedicine/:diagnosis')
  .get(parseUrlencoded, function(request, response) {
    exec('node route/js/setPatientMedicine.js ' + request.params.diagnosis, function(error, stdout, stderr){
      console.log(stdout);
    });
    response.send("setMedicine");
  });

// 查藥單
router.route('/getMedicine')
	.get(parseUrlencoded, function(request, response) {
    exec('node route/js/getPatientInfo.js', function(error, stdout, stderr){
      console.log(stdout);
    });
	  response.send("getMedicine");
	});

// 領藥
router.route('/takeMedicine')
	.get(parseUrlencoded, function(request, response) {
	  response.send("takeMedicine");
	});

// 挖礦
router.route('/mint/:role/:amount/:type')
	.get(parseUrlencoded, function(req, res) {
    var role = req.params.role, type = req.params.type, amount = req.params.amount;
    var cmd = DockerCmd(role, cmdMint, amount, type);
    var str = role + " mint type " + type + " (amount: " + amount + ")";
	  res.send(str);
	});

module.exports = router;
