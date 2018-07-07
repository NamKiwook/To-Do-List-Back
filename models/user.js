var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({
	userName: {type : String, required: true},
	boards: {type: [Schema.Types.ObjectId], default: []},
	userEmail: {type: String, unique: true, required: true},
	password: {type : String, required: true}
})

module.exports = mongoose.model('user', userSchema)