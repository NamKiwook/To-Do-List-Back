var mongoose = require('mongoose')
var Schema = mongoose.Schema

var listSchema = {name: String}
var cardSchema = {
	name: String,
	list: [listSchema]
}

var boardSchema = new Schema({
	name: String,
	card: [cardSchema]
})

module.exports = mongoose.model('board', boardSchema)