var exec = require('child_process').exec;

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

var cmdPatientAddress = "sudo docker exec -i patient src/gcoin-cli getfixedaddress";
var cmdDoctorUnspent = "sudo docker exec -i doctor src/gcoin-cli listunspent";

Promise.all([PromiseExec(cmdPatientAddress), PromiseExec(cmdDoctorUnspent)]).then(function(values) {

  var doctorUnspentTx = JSON.parse(values[1]);

  var availableUnspentTx = doctorUnspentTx.filter((el) => {
    if (el.amount == 4 && el.color == 2) {
      return true;
    }
  });

  var fee = doctorUnspentTx.filter((el) => {
    if (el.amount == 1 && el.color == 1) {
      return true;
    }
  });

  console.log("\n----------------------Address of patient---------------------------\n" + values[0]);

  if (availableUnspentTx.length > 0 && fee.length > 0) {

    console.log("\n----------------------Unspent Transaction of Doctor---------------------------\n");
    console.log(availableUnspentTx[0]);
    console.log("\n----------------------Fee of Doctor---------------------------\n");
    console.log(fee[0]);


    var DoctorVin = [{
      txid: availableUnspentTx[0].txid,
      vout: availableUnspentTx[0].vout
    }, {
      txid: fee[0].txid,
      vout: fee[0].vout
    }];

    var PatientVout = [{
      address: values[0],
      value: 3,
      color: 2
    }, {
      address: values[0],
      value: 1,
      color: 2
    }];

    var cmdRawTransaction = "sudo docker exec -i doctor src/gcoin-cli createrawtransaction '" + JSON.stringify(DoctorVin) + "' '" + JSON.stringify(PatientVout) + "'";

    PromiseExec(cmdRawTransaction).then(function(TxHex) {


      var front = TxHex.slice(0, TxHex.length - 77);
      var tail = TxHex.slice(TxHex.length - 25, TxHex.length + 1);


      var rawData = "Test for medicine-log";
      var base64Data = new Buffer(rawData).toString('base64');
      var chr_len_base64Data = String.fromCharCode(base64Data.length);
      var hexData = "6a" + new Buffer(chr_len_base64Data).toString('hex') + new Buffer(base64Data).toString('hex');
      var hexData = new Buffer(String.fromCharCode((new Buffer(hexData, 'hex').toString('ascii')).length)).toString('hex') + hexData;

      var newTx = front + hexData + tail;

      return newTx;

    }, function(err) {
      console.log(err);
    }).then(function(newTx) {

      console.log(newTx);
      PromiseExec("sudo docker exec -i doctor src/gcoin-cli decoderawtransaction " + newTx).then((rawTx) => {

        console.log("\n----------------------OP_RETURN---------------------------\n");
        console.log(rawTx);
      }, function(err) {
        console.log(err);
      });


      PromiseExec("sudo docker exec -i doctor src/gcoin-cli signrawtransaction " + newTx).then((signedTx) => {

        console.log("\n----------------------Signed Transaction Hex---------------------------\n");
        console.log(signedTx);

        var signedTx = JSON.parse(signedTx);
        var signedTxHex = signedTx.hex;

        PromiseExec("sudo docker exec -i doctor src/gcoin-cli decoderawtransaction " + signedTxHex).then((rawTx) => {

          console.log("\n----------------------Signed OP_RETURN---------------------------\n");
          console.log(rawTx);
        }, function(err) {
          console.log(err);
        });


        PromiseExec("sudo docker exec -i doctor src/gcoin-cli sendrawtransaction " + signedTxHex).then((txId) => {
          console.log(txId);
        }, function(err) {
          console.log(err);
        });


      }, function(err) {
        console.log(err);
      });

    }, function(err) {
      console.log(err);
    });


  } else {
    console.log("Please mint some gcoin, Doctor!");
  }

});
