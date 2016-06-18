var exec = require('child_process').exec;
console.log("==EXEC== getPatientInfo.js")

var msgCategory = 2;
var person = "patient";

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

function MedicineFunc(unspentList, coins) {
  return unspentList.filter(function(el) {
    if (el.amount == coins) {
      return true;
    }
  });
}


PromiseExec(DockerCmd("patient", "listunspent")).then(function(unspentList) {

  var unspentList = JSON.parse(unspentList);
  var InfoList = MedicineFunc(unspentList, msgCategory);

  if (msgCategory == 3){
    return InfoList.map(function(el){
      return el.txid;
    });
  } else {
    var InfoPromise = InfoList.map(function(el){
      return PromiseExec(DockerCmd(person, "getrawtransaction "+el.txid)).then(function(txHex){
        return PromiseExec(DockerCmd(person, "decoderawtransaction "+txHex)).then(function(rawTx){
          rawTx = JSON.parse(rawTx);
          return rawTx.vin[0].txid;
        });
      });
    });

    return Promise.all(InfoPromise).then(function(prevTxID){
      return prevTxID;
    })
  }


}).then(function(opList){

  return rawPromise = opList.map(function(el) {
    return PromiseExec(DockerCmd("patient", "getrawtransaction ") + el).then(function(rawTx){
      return PromiseExec(DockerCmd("patient", "decoderawtransaction ") + rawTx);
    });
  });

}).then(function(rawTxTxList){

  return Promise.all(rawTxTxList).then(function(decodedTxList){
    return msgList = decodedTxList.map(function(el) {
      el = JSON.parse(el);
      var op_return_msg = el.vout[1].scriptPubKey.asm;
      return op_return_msg.slice(10, op_return_msg.length + 1);
    });
  }, ErrorHandler);

}).then(function(msgList) {

  var finalMsgList = msgList.map(function(el) {
    var base64Data = new Buffer(el, 'hex').toString('ascii');
    var rawData = new Buffer(base64Data, 'base64').toString('ascii');

    return rawData;
  });

  console.log(finalMsgList);
});
