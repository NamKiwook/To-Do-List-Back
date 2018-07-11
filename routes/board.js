let userSchema = require('../models/user')
let boardSchema = require('../models/board')

let loadBoard = async (req, res) => {
  try {
    if(!req.query.boardId) throw new Error('Not Filled')
    let board = await boardSchema.findById(req.query.boardId)
    if(!board) throw new Error('Not Board')
    res.status(200).send(board)
  } catch (err){
    if (err.name === 'MongoError') res.status(503).send({errorMessage: err.message})
    else res.status(400).send({errorMessage: err.message})
  }
}

let createBoard = async (req, res) => {
  try {
    if(!req.body.name) throw new Error('Not Filled')
    let board = new boardSchema({name : req.body.name})
    board = await board.save()
    await userSchema.updateOne({userEmail : req.decoded.userEmail}, {$push:{boards : board._id}})
    res.status(200).send(board)
  } catch (err) {
    if (err.name === 'MongoError') res.status(503).send({errorMessage: err.message})
    else res.status(400).send({errorMessage: err.message})
  }
}

let modifyBoard = async (req, res) => {
  try {
    if(!req.body.boardId || !req.body.name || !req.body.card) throw new Error('Not Filled')
    let board = await boardSchema.findById(req.body.boardId)
    if(!board) throw new Error('Not Board')
    board.name = req.body.name
    board.card = req.body.card
    board.markModified('name')
    board.markModified('card')
    board = await board.save()
    res.status(200).send(board)
  } catch (err) {
    if (err.name === 'MongoError') res.status(503).send({errorMessage: err.message})
    else res.status(400).send({errorMessage: err.message})
  }
}

let deleteBoard = async (req, res) => {
  try {
    if(!req.body.boardId) throw new Error('Not Filled')
    await boardSchema.deleteOne({_id : req.body.boardId})
    await userSchema.updateOne({userEmail : req.decoded.userEmail}, {$pull:{boards : req.body.boardId}})
    res.status(204).send()
  } catch (err){
    if (err.name === 'MongoError') res.status(503).send({errorMessage: err.message})
    else res.status(400).send({errorMessage: err.message})
  }
}


module.exports = {loadBoard, createBoard, modifyBoard, deleteBoard}