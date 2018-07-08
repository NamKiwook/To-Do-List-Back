let jwt = require('jsonwebtoken')
let httpMocks = require('node-mocks-http')
let chai = require('chai')
let user = require('../routes/user')
let sinon = require('sinon')
let userSchema = require('../models/user')

chai.should()

describe('User', () => {
  let req
  let res
  let expect = {
    userName: 'nam',
    userEmail: 'listenme1@naver.com',
    password: '123'
  }
	beforeEach(() => {
		req = httpMocks.createRequest()
		res = httpMocks.createResponse()
	})

	describe('Post User', () => {
		let save
    beforeEach(() => {
			save = sinon.stub(userSchema.prototype,'save')
    })
		afterEach(() => {
			save.restore()
    })
		it('정상적인 작동',async () => {
      save.resolves(expect)
      req.body = expect
			await user.signUpAccount(req,res)
      res.statusCode.should.equal(200)
			res._getData().should.property('userName').equal(expect.userName)
      res._getData().should.property('userEmail').equal(expect.userEmail)
    })

    it('입력값 부족', async () => {
      save.resolves(expect)
      await user.signUpAccount(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('DB 실패',async () => {
      save.throws('MongoError','DB ERROR')
      req.body = expect
      await user.signUpAccount(req,res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
	})

	describe('Post User\'s Token',  () => {
    let findOne
    beforeEach(() => {
      findOne = sinon.stub(userSchema,'findOne')
    })
    afterEach(() => {
      findOne.restore()
    })

		it('정상적인 작동', async () => {
      findOne.resolves(expect)
      req.body = {
        userEmail: expect.userEmail,
        password: expect.password
      }
      await user.authToken(req,res)
      res.statusCode.should.equal(200)
      res._getData().should.property('token')
    })

    it('검색 실패', async () => {
      findOne.resolves(null)
      req.body = {
        userEmail: expect.userEmail,
        password: expect.password
      }
      await user.authToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not User')
    })

    it('입력값 부족', async () => {
      findOne.resolves(expect)
      await user.authToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Filled')
    })

    it('DB 실패', async () => {
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

  describe('사용자 인증', () => {
    let userToken
    beforeEach(async () => {
      userToken = await jwt.sign(
        {
          userEmail : expect.userEmail
        },
        'NamKiWookBirthday1011',
        {
          expiresIn: '2'

        }
      )
    })
    it('인증된 사용자',  () => {
      req.headers = {token : userToken}
      user.decodeToken(req,res)
      req.decoded.should.property('userEmail')
    })
    it('인증되지 않은 사용자', () => {
      req.headers = {token : '12312312312'}
      user.decodeToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not User')
    })
    it('token 값이 설정되지 않은 사용자', () => {
      user.decodeToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Not Token')
    })

    it('유효기간이 만료된 사용자', async () => {
      await setTimeout(user.decodeToken(req, res), 3000)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage').equal('Token Expired')
    })
  })

})