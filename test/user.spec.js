let httpMocks = require('node-mocks-http')
let chai = require('chai')
let user = require('../routes/users')
let sinon = require('sinon')
let userSchema = require('../models/user')

chai.should()

let req
let res


describe('User', function () {
	beforeEach(function () {
		req = httpMocks.createRequest()
		res = httpMocks.createResponse()
	})

	describe('signUpAccount() Test', function () {
		let save
    beforeEach(function () {
			save = sinon.stub(userSchema.prototype,'save')
    })
		afterEach(function () {
			save.restore()
    })
		it('정상적인 작동',async function () {
      save.resolves({userName: 'nam', userEmail: 'listenme1@naver.com', password: '123'})
			req.body.userName = 'nam'
			req.body.userEmail = 'listenme1@naver.com'
			req.body.password = '123'
			await user.signUpAccount(req,res)
      res.statusCode.should.equal(200)
			res._getData().should.property('userName')
      res._getData().should.property('userEmail')

    })

    it('입력값 부족', async function () {
      save.resolves({userName: 'nam', userEmail: 'listenme1@naver.com', password: '123'})
      await user.signUpAccount(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('DB 실패',async function () {
      save.throws()
      req.body.userName = 'nam'
      req.body.userEmail = 'listenme1@naver.com'
      req.body.password = '123'
      await user.signUpAccount(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage')
    })
	})

	describe('authToken() Test', function () {
    let findOne
    beforeEach(function () {
      findOne = sinon.stub(userSchema,'findOne')
    })
    afterEach(function () {
      findOne.restore()
    })

		it('정상적인 작동', async function () {
      findOne.resolves({userName : 'nam', userEmail : 'listenme1@naver.com', password : '123'})
      req.body.userEmail = 'listenme1@naver.com'
      req.body.password = '123'
      await user.authToken(req,res)
      res.statusCode.should.equal(200)
      res._getData().should.property('token')
    })

    it('검색 실패', async function () {
      findOne.resolves(null)
      req.body.userEmail = 'listenme1@naver.com'
      req.body.password = '123'
      await user.authToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not User')
    })

    it('입력값 부족', async function () {
      findOne.resolves({userName : 'nam', userEmail : 'listenme1@naver.com', password : '123'})
      await user.authToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('DB 실패', async function () {
      findOne.throws()
      req.body.userEmail = 'listenme1@naver.com'
      req.body.password = '123'
      await user.authToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage')
    })
	})

})