var exec = require('child_process').exec;

function PromiseExec(cmd) {
  return new Promise(function(resolve, reject) {
    exec(cmd, function(error, stdout, stderr) {
      if(stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

var cmdPatientUnspent = "sudo docker exec -i patient src/gcoin-cli listunspent";

PromiseExec(cmdPatientUnspent).then(function(unspentList){
  var unspentList = JSON.parse(unspentList);

  var medicineFunc = function(coins) {
    return unspentList.filter(function(el){
      if(el.amount==coins){
	return true;
      }
    });
  }

  var medicineRemain = medicineFunc(3);
  var medicineError = medicineFunc(2);
  var medicineHistory = medicineFunc(1);

  //console.log(medicineError);
  
  var operation = medicineRemain;  
  return operation;

}).then(function(operation_list){
  var operationTxID = operation_list.map(function(el){
    return el.txid;
  });
  
  console.log(operationTxID);

  var cmdRawTxList = "sudo docker exec -i patient src/gcoin-cli getrawtransaction ";
  var cmdDecodeRawTx = "sudo docker exec -i patient src/gcoin-cli decoderawtransaction ";
  var rawTransaction = operationTxID.map(function(el){

    return PromiseExec(cmdRawTxList+el).then(function(decodedTx){

      return PromiseExec(cmdDecodeRawTx+decodedTx);
  
    });
    
  });

  return Promise.all(rawTransaction).then(function(decodedTxList){

    var msgList = decodedTxList.map(function(el){
    
      el = JSON.parse(el);
      var op_return_msg = el.vout[1].scriptPubKey.asm;
      
      return op_return_msg.slice(10, op_return_msg.length+1);
    });
    return msgList;
  });
}).then(function(msgList){

  console.log(msgList);
  
  var finalMsgList = msgList.map(function(el){

    var base64Data = new Buffer(el, 'hex').toString('ascii');
    var rawData = new Buffer(base64Data, 'base64').toString('ascii');

    return rawData;
  
  });
 
  console.log(finalMsgList);
});

