var mongoose = require('mongoose')
var Schema = mongoose.Schema

var listSchema = new Schema({name: String})
var cardSchema = new Schema({
	name: String,
	list: [listSchema]
})

var boardSchema = new Schema({
	name: String,
	card: [cardSchema]
})

module.exports = mongoose.model('board', boardSchema)