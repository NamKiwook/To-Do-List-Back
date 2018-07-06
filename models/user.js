var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({
	username: String,
	boards: {type: Array, default: []},
	userEmail: {type: String, unique: true},
	password: String
})

module.exports = mongoose.model('user', userSchema)