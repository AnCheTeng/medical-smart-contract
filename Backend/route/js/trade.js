var exec = require('child_process').exec;
console.log("==EXEC==", process.argv)

var sender = process.argv[4] || "patient";
var receiver = process.argv[5] || "pharmacy";
// var sender = "pharmacy";
// var receiver = "patient";

var sendingColor = parseInt(process.argv[3]) || 2;
var tradingAmount = parseInt(process.argv[2]) || 2;
var sendingAmount = null;
var changeAmount = null;
var feechangeAmount = null;


function PromiseExec(cmd) {
  return new Promise(function(resolve, reject) {
    exec(cmd, function(error, stdout, stderr) {
      if (stderr) {
        console.log(cmd, "reject")
        reject(stderr);
      } else {
        console.log(cmd, "stdout")
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


var cmdSenderAddress = DockerCmd(sender, "getfixedaddress");
var cmdReceiverAddress = DockerCmd(receiver, "getfixedaddress");
var cmdSenderUnspent = DockerCmd(sender, "listunspent");

Promise.all([PromiseExec(cmdSenderAddress), PromiseExec(cmdReceiverAddress), PromiseExec(cmdSenderUnspent)]).then(function(values) {

  var changeAddress = values[0];
  var receiverAddress = values[1];
  var senderUnspentList = JSON.parse(values[2]);

  var amountThreshold = sendingColor!=1 ? 3 : tradingAmount;

  var availableUnspentList = senderUnspentList.filter((el) => {
    if (el.amount >= amountThreshold && el.color == sendingColor) {
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
    console.log("Sender Address: "+changeAddress+"\n");
    console.log("Receiver Address: "+receiverAddress+"\n");
    console.log("Unspent Transaction: "+JSON.stringify(availableUnspentTx)+"\n");
    console.log("Fee Transactoin: "+JSON.stringify(availableFee)+"\n");

    var Sender = [{
      txid: availableUnspentTx.txid,
      vout: availableUnspentTx.vout
    }];

    var Receiver = [];

    if (sendingColor!=1){
      Sender.push({
        txid: availableFee.txid,
        vout: availableFee.vout
      });

      if(changeAmount!=0){
        Receiver.push({
          address: changeAddress,
          value: changeAmount,
          color: sendingColor
        });
      }

      if(feechangeAmount!=0){
        Receiver.push({
          address: changeAddress,
          value: feechangeAmount,
          color: 1
        });
      }

    } else {
      if(changeAmount>=2){
        Receiver.push({
          address: changeAddress,
          value: changeAmount-1,
          color: sendingColor
        });
      }
    }

    Receiver.push({
      address: receiverAddress,
      value: tradingAmount,
      color: sendingColor
    });

    var cmdRawTransaction = DockerCmd(sender, "createrawtransaction") + " '" + JSON.stringify(Sender) + "' '" + JSON.stringify(Receiver) + "'";

    PromiseExec(cmdRawTransaction).then(function(newTx) {

      PromiseExec(DockerCmd(sender, "signrawtransaction ") + newTx).then((signedTx) => {

        var signedTx = JSON.parse(signedTx);
        var signedTxHex = signedTx.hex;

        PromiseExec(DockerCmd(sender, "decoderawtransaction ") + signedTxHex).then((rawTx) => {

          console.log("\n----------------------Signed Transaction---------------------------\n");
          console.log(rawTx+"\n");
        }, ErrorHandler);


        PromiseExec(DockerCmd(sender, "sendrawtransaction ") + signedTxHex).then((txId) => {
          console.log("\n----------------------Successed Transaction ID---------------------------\n");
          console.log(txId+"\n");
        }, ErrorHandler);

      }, ErrorHandler);

    }, ErrorHandler);

  } else {
    console.log(sender, "Please mint some gcoin!");
  }

});
