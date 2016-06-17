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

function DockerCmd(role, cmd) {
  return "sudo docker exec -i "+role+" src/gcoin-cli "+cmd;
}

function ErrorHandler(err) {
  console.log(err);
}
var sender = "patient";
var receiver = "pharmacy";
//var sender = "pharmacy";
//var receiver = "patient";

var tradingAmount = 2;
var sendingColor = 2;
var sendingAmount = null;
var changeAmount = null;
var feechangeAmount = null;

var cmdSenderAddress = DockerCmd(sender, "getfixedaddress");
var cmdReceiverAddress = DockerCmd(receiver, "getfixedaddress");
var cmdSenderUnspent = DockerCmd(sender, "listunspent");

Promise.all([PromiseExec(cmdSenderAddress), PromiseExec(cmdReceiverAddress), PromiseExec(cmdSenderUnspent)]).then(function(values) {

  var changeAddress = values[0];
  var receiverAddress = values[1];
  var senderUnspentList = JSON.parse(values[2]);

  var availableUnspentList = senderUnspentList.filter((el) => {
    if (el.amount >= tradingAmount && el.color == sendingColor) {
      return true;
    }
  }).sort().reverse();

  var feeList = senderUnspentList.filter((el) => {
    if (el.amount >= 1 && el.color == 1) {
      return true;
    }
  }).sort();

  if (availableUnspentList.length > 0 && availableUnspentList[0]!=feeList[0]) {

    var availableUnspentTx = availableUnspentList[0];
    var availableFee = feeList[0];

    var sendingAmount = availableUnspentTx.amount;
    var changeAmount = sendingAmount - tradingAmount;
    var feechangeAmount = availableFee.amount - 1;

    console.log("\n----------------------Information of the Transaction---------------------------\n");
    console.log("Sender Address: "+changeAddress);
    console.log("Receiver Address: "+receiverAddress);
    console.log("Unspent Transaction: "+JSON.stringify(availableUnspentTx));
    console.log("Fee Transactoin: "+JSON.stringify(availableFee));

    if (sendingColor!=1 && feechangeAmount!=0 && changeAmount!=0) {
      var Sender = [{
        txid: availableUnspentTx.txid,
        vout: availableUnspentTx.vout
      },{
        txid: availableFee.txid,
        vout: availableFee.vout
      }];

      var Receiver = [{
        address: changeAddress,
        value: feechangeAmount,
        color: 1
      },{
        address: changeAddress,
        value: changeAmount,
        color: sendingColor
      },{
        address: receiverAddress,
        value: tradingAmount,
        color: sendingColor
      }];
    } else if (sendingColor!=1 && feechangeAmount==0 && changeAmount ==0) {
      var Sender = [{
        txid: availableUnspentTx.txid,
        vout: availableUnspentTx.vout
      },{
        txid: availableFee.txid,
        vout: availableFee.vout
      }];

      var Receiver = [{
        address: receiverAddress,
        value: tradingAmount,
        color: sendingColor
      }];

    } else if (sendingColor!=1 && feechangeAmount==0 && changeAmount!=0) {
      var Sender = [{
        txid: availableUnspentTx.txid,
        vout: availableUnspentTx.vout
      },{
        txid: availableFee.txid,
        vout: availableFee.vout
      }];

      var Receiver = [{
        address: receiverAddress,
        value: tradingAmount,
        color: sendingColor
      },{
        address: changeAddress,
        value: changeAmount,
        color: sendingColor
      }];

    } else if (sendingColor!=1 && feechangeAmount!=0 && changeAmount==0) {
      var Sender = [{
        txid: availableUnspentTx.txid,
        vout: availableUnspentTx.vout
      },{
        txid: availableFee.txid,
        vout: availableFee.vout
      }];

      var Receiver = [{
        address: changeAddress,
        value: feechangeAmount,
        color: 1
      },{
        address: receiverAddress,
        value: tradingAmount,
        color: sendingColor
      }];

    } else {
      var Sender = [{
        txid: availableUnspentTx.txid,
        vout: availableUnspentTx.vout
      }];

      var Receiver = [{
        address: changeAddress,
        value: changeAmount-1,
        color: sendingColor
      },{
        address: receiverAddress,
        value: tradingAmount,
        color: sendingColor
      }];
    }


    var cmdRawTransaction = DockerCmd(sender, "createrawtransaction") + " '" + JSON.stringify(Sender) + "' '" + JSON.stringify(Receiver) + "'";

    PromiseExec(cmdRawTransaction).then(function(newTx) {

      PromiseExec(DockerCmd(sender, "signrawtransaction ") + newTx).then((signedTx) => {

        var signedTx = JSON.parse(signedTx);
        var signedTxHex = signedTx.hex;

        PromiseExec(DockerCmd(sender, "decoderawtransaction ") + signedTxHex).then((rawTx) => {

          console.log("\n----------------------Signed Transaction---------------------------\n");
          console.log(rawTx);
        }, ErrorHandler);


        PromiseExec(DockerCmd(sender, "sendrawtransaction ") + signedTxHex).then((txId) => {
          console.log("\n----------------------Successed Transaction ID---------------------------\n");
          console.log(txId);
        }, ErrorHandler);

      }, ErrorHandler);

    }, ErrorHandler);

  } else {
    console.log("Please mint some gcoin!");
  }

});
