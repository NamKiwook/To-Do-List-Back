let httpMocks = require('node-mocks-http')
let chai = require('chai')
let sinon = require('sinon')
let board = require('../routes/board')
let boardSchema = require('../models/board')
let userSchema = require('../models/user')

chai.should()

describe('board', function () {
  let req
  let res

  beforeEach (function () {
    req = httpMocks.createRequest()
    res = httpMocks.createResponse()
    req.decoded = {userEamil : 'listenme1@naver.com'}
  })

  describe('보드의 내용 불러오기', function () {
    let findById
    let expect
    let boardId
    beforeEach (function () {
      expect = {name: 'board1', card: [{name: 'card1', list: [{name: 'list1'},{name: 'list2'},{name: 'list3'}]},{name: 'card2', list: [{name: 'list1'},{name: 'list2'},{name: 'list3'}]}]}
      findById = sinon.stub(boardSchema,'findById')
      boardId = 1
    })
    afterEach (function () {
      findById.restore()
    })

    it('정상적인 작동',async function () {
      findById.resolves(expect)
      req.query.boardId = boardId
      await board.loadBoard(req,res)
      res.statusCode.should.equal(200)
      res._getData().should.equal(expect)
    })

    it('해당 ID가 없음',async function () {
      findById.resolves(null)
      req.query.boardId = boardId
      await board.loadBoard(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Board')
    })

    it('입력값 부족',async function () {
      findById.resolves(expect)
      await board.loadBoard(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')

    })

    it('DB 실패',async function () {
      findById.throws('MongoError','DB ERROR')
      req.query.boardId = boardId
      await board.loadBoard(req,res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
  })

  describe('보드 생성', function () {
    let save
    let expect
    let userUpdate

    beforeEach (function () {
      save = sinon.stub(boardSchema.prototype,'save')
      userUpdate = sinon.stub(userSchema, 'updateOne')
      expect = {name: 'board3', card: []}
    })

    afterEach (function () {
      save.restore()
      userUpdate.restore()
    })

    it('정상적인 작동', async function () {
      save.resolves(expect)
      userUpdate.resolves({})
      req.body.name = expect.name
      req.body.card = expect.card
      await board.createBoard(req, res)
      res.statusCode.should.equal(200)
      res._getData().should.property('name').equal(expect.name)
      res._getData().should.property('card').equal(expect.card)
    })

    it('입력값 부족', async function () {
      save.resolves(expect)
      userUpdate.resolves()
      await board.createBoard(req, res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('보드 DB 실패', async function () {
      save.throws('MongoError','DB ERROR')
      userUpdate.resolves()
      req.body = expect
      await board.createBoard(req, res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })

    it('유저 DB 실패', async function () {
      save.resolves(expect)
      userUpdate.throws('MongoError','DB ERROR')
      req.body = expect
      await board.createBoard(req, res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
  })


  describe('보드 이름 변경', function () {
    let save
    let markModified
    let findById
    let expect
    let boardId

    beforeEach (function () {
      save = sinon.stub(boardSchema.prototype,'save')
      markModified = sinon.stub(boardSchema.prototype,'markModified')
      findById = sinon.stub(boardSchema,'findById')
      expect = {name: 'board4', card: []}
      boardId = 1
    })

    afterEach (function () {
      save.restore()
      findById.restore()
      markModified.restore()
    })
    it('정상적인 작동', async function () {
      findById.resolves(new boardSchema({name: 'board3', card: []}))
      save.resolves(new boardSchema(expect))
      markModified.resolves()
      req.body = expect
      req.body.boardId = boardId
      await board.modifyBoard(req,res)
      res.statusCode.should.equal(200)
      res._getData().should.property('name').equal(expect.name)
      res._getData().should.property('card')
    })

    it('해당 ID가 없음',async function () {
      findById.resolves()
      save.resolves(new boardSchema(expect))
      markModified.resolves()
      req.body = expect
      req.body.boardId = boardId
      await board.modifyBoard(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Board')
    })

    it('입력값 부족', async function () {
      findById.resolves(new boardSchema({name: 'board3', card: []}))
      save.resolves(new boardSchema(expect))
      markModified.resolves()
      await board.modifyBoard(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('검색 DB 실패', async function () {
      findById.throws('MongoError','DB ERROR')
      save.resolves(new boardSchema(expect))
      markModified.resolves()
      req.body = expect
      req.body.boardId = boardId
      await board.modifyBoard(req,res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })

    it('저장 DB 실패', async function () {
      findById.resolves(new boardSchema({name: 'board3', card: []}))
      save.throws('MongoError','DB ERROR')
      markModified.resolves()
      req.body = expect
      req.body.boardId = boardId
      await board.modifyBoard(req,res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
  })

  describe('보드 삭제', function () {
    let deleteOne
    let boardId
    let userUpdate

    beforeEach (function () {
      deleteOne = sinon.stub(boardSchema,'deleteOne')
      userUpdate = sinon.stub(userSchema, 'updateOne')
      boardId = 1
    })

    afterEach (function () {
      deleteOne.restore()
      userUpdate.restore()
    })

    it('정상적인 작동', async function () {
      deleteOne.resolves()
      userUpdate.resolves()
      req.body.boardId = boardId
      await board.deleteBoard(req, res)
      res.statusCode.should.equal(204)
    })

    it('입력값 부족', async function () {
      deleteOne.resolves()
      userUpdate.resolves()
      await board.deleteBoard(req, res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('보드 DB 실패', async function () {
      deleteOne.throws('MongoError','DB ERROR')
      userUpdate.resolves()
      req.body.boardId = boardId
      await board.deleteBoard(req, res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })

    it('유저 DB 실패', async function () {
      deleteOne.resolves()
      userUpdate.throws('MongoError','DB ERROR')
      req.body.boardId = boardId
      await board.deleteBoard(req, res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
  })
})