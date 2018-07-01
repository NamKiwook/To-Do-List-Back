var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
  name: String,
  list: {type: Array, default: []},
});

module.exports = mongoose.model('board', boardSchema);