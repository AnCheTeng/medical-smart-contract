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

var cmdPharmacyAddress = "sudo docker exec -i pharmacy src/gcoin-cli getfixedaddress";
var cmdDoctorUnspent = "sudo docker exec -i doctor src/gcoin-cli listunspent";

Promise.all([PromiseExec(cmdPharmacyAddress), PromiseExec(cmdDoctorUnspent)]).then(function(values) {

  var doctorUnspentTx = JSON.parse(values[1]);

  var availableUnspentTx = doctorUnspentTx.filter((el) => {
    if (el.amount >= 1 && el.color == 1) {
      return true;
    }
  });

  console.log("\n----------------------Address of Pharmacy---------------------------\n" + values[0]);

  if (availableUnspentTx.length > 0) {

    console.log("\n----------------------Unspent Transaction of Doctor---------------------------\n");
    console.log(availableUnspentTx[0]);

    var DoctorVin = [{
      txid: availableUnspentTx[0].txid,
      vout: availableUnspentTx[0].vout
    }];

    var PharmacyVout = [{
      address: values[0],
      value: 99,
      color: 1
    }];

    var cmdRawTransaction = "sudo docker exec -i doctor src/gcoin-cli createrawtransaction '" + JSON.stringify(DoctorVin) + "' '" + JSON.stringify(PharmacyVout) + "'";

    PromiseExec(cmdRawTransaction).then(function(newTx) {

      PromiseExec("sudo docker exec -i doctor src/gcoin-cli decoderawtransaction " + newTx).then((rawTx) => {

      }, function(err) {
        console.log(err);
      });


      PromiseExec("sudo docker exec -i doctor src/gcoin-cli signrawtransaction " + newTx).then((signedTx) => {

        console.log("\n----------------------Signed Transaction Hex---------------------------\n");
        console.log(signedTx);

        var signedTx = JSON.parse(signedTx);
        var signedTxHex = signedTx.hex;

        PromiseExec("sudo docker exec -i doctor src/gcoin-cli decoderawtransaction " + signedTxHex).then((rawTx) => {

          console.log("\n----------------------Signed Transaction---------------------------\n");
          console.log(rawTx);
        }, function(err) {
          console.log(err);
        });


        PromiseExec("sudo docker exec -i doctor src/gcoin-cli sendrawtransaction " + signedTxHex).then((txId) => {
          console.log("\n----------------------Successed Transaction ID---------------------------\n");
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
