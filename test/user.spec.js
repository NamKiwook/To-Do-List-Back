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

	describe('signupAccount() Test', function () {
		it('should return the statusCode 200', function (done) {
      sinon.stub(userSchema.prototype,'save').resolves()
			user.signUpAccount(req,res,done)
      res.statusCode.should.be.equal(200)
		})
	})


	describe('authToken() Test', function () {
		it('should return the statusCode 200', function () {
      sinon.stub(userSchema,'findOne').resolves({username : 'nam', userEmail : 'listenme1@naver.com', password : '123'})
      user.authToken(req,res)
      res.statusCode.should.be.equal(200)
    })
	})
})