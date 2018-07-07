let httpMocks = require('node-mocks-http')
let chai = require('chai')
let user = require('../routes/user')
let sinon = require('sinon')
let userSchema = require('../models/user')

chai.should()

describe('User', function () {
  let req
  let res
  let expect = {
    userName: 'nam',
    userEmail: 'listenme1@naver.com',
    password: '123'
  }
	beforeEach(function () {
		req = httpMocks.createRequest()
		res = httpMocks.createResponse()
	})



	describe('Post User', function () {
		let save
    beforeEach(function () {
			save = sinon.stub(userSchema.prototype,'save')
    })
		afterEach(function () {
			save.restore()
    })
		it('정상적인 작동',async function () {
      save.resolves(expect)
      req.body = expect
			await user.signUpAccount(req,res)
      res.statusCode.should.equal(200)
			res._getData().should.property('userName').equal(expect.userName)
      res._getData().should.property('userEmail').equal(expect.userEmail)
    })

    it('입력값 부족', async function () {
      save.resolves(expect)
      await user.signUpAccount(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('DB 실패',async function () {
      save.throws('MongoError','DB ERROR')
      req.body = expect
      await user.signUpAccount(req,res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
	})

	describe('Post User\'s Token', function () {
    let findOne
    beforeEach(function () {
      findOne = sinon.stub(userSchema,'findOne')
    })
    afterEach(function () {
      findOne.restore()
    })

		it('정상적인 작동', async function () {
      findOne.resolves(expect)
      req.body = {
        userEmail: expect.userEmail,
        password: expect.password
      }
      await user.authToken(req,res)
      res.statusCode.should.equal(200)
      res._getData().should.property('token')
    })

    it('검색 실패', async function () {
      findOne.resolves(null)
      req.body = {
        userEmail: expect.userEmail,
        password: expect.password
      }
      await user.authToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not User')
    })

    it('입력값 부족', async function () {
      findOne.resolves(expect)
      await user.authToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('DB 실패', async function () {
      findOne.throws('MongoError','DB ERROR')
      req.body = {
        userEmail: expect.userEmail,
        password: expect.password
      }
      await user.authToken(req,res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
	})

})