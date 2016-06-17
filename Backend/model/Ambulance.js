var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ambulance = new Schema({
  number: Number,
}, {
  versionKey: false
});

module.exports = mongoose.model('Ambulance', Ambulance);
