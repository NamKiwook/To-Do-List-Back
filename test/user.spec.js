let jwt = require('jsonwebtoken')
let httpMocks = require('node-mocks-http')
let chai = require('chai')
let user = require('../routes/user')
let sinon = require('sinon')
let userSchema = require('../models/user')
let util = require('util')


chai.should()

describe('User', () => {
  let req
  let res
  let expect = {
    userName: 'nam',
    userEmail: 'listenme1@naver.com',
    password: '123',
    boards:[{name: 'board1', card: [{name: 'card1', list: [{name: 'list1'},{name: 'list2'},{name: 'list3'}]},{name: 'card2', list: [{name: 'list1'},{name: 'list2'},{name: 'list3'}]}]},
      {name: 'board4', card: [{name: 'card3', list: [{name: 'list4'},{name: 'list5'},{name: 'list6'}]},{name: 'card4', list: [{name: 'list4'},{name: 'list5'},{name: 'list6'}]}]}]
  }
	beforeEach(() => {
		req = httpMocks.createRequest()
		res = httpMocks.createResponse()
	})
  describe('Get MyInfo', () => {
    let findOne
    beforeEach(async () => {
      findOne = sinon.stub(userSchema, 'findOne')
      req.decoded = {userEamil : expect.userEmail}
    })
    afterEach(() => {
      findOne.restore()
    })

    it('정상적인 작동', async () => {
      findOne.returns({
        populate: () => {
          let expectRes = new userSchema(expect)
          expectRes._doc.boards = [{_id: 1, name: expect.boards[0].name}, {_id: 2, name: expect.boards[1].name}]
          return expectRes
        }
      })
      await user.getMyInfo(req,res)
      res.statusCode.should.equal(200)
      res._getData().should.property('userName',expect.userName)
      res._getData().should.property('userEmail',expect.userEmail)
      res._getData().should.not.property('password')
      res._getData().should.deep.property('boards',[{_id: 1, name: expect.boards[0].name}, {_id: 2, name: expect.boards[1].name}]).to.be.a('array')

    })
    it('회원탈퇴 후 유효한 Token만 남은 경우', async () => {
      findOne.returns({
        populate: () => null
      })
      await user.getMyInfo(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage','Not User')
    })
    it('DB에러', async () => {
      findOne.throws('MongoError','DB ERROR')
      await user.getMyInfo(req,res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
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
      save.resolves(new userSchema(expect))
      req.body = expect
			await user.signUpAccount(req,res)
      res.statusCode.should.equal(204)
    })

    it('입력값 부족', async () => {
      save.resolves(new userSchema(expect))
      await user.signUpAccount(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage','Not Filled')
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
      findOne.resolves(new userSchema(expect))
      req.body = {
        userEmail: expect.userEmail,
        password: expect.password
      }
      await user.login(req,res)
      res.statusCode.should.equal(200)
      res._getData().should.property('token').a('string')
    })

    it('검색 실패', async () => {
      findOne.resolves(null)
      req.body = {
        userEmail: expect.userEmail,
        password: expect.password
      }
      await user.login(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage','Not User')
    })

    it('입력값 부족', async () => {
      findOne.resolves(new userSchema(expect))
      await user.login(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage','Not Filled')
    })

    it('DB 실패', async () => {
      findOne.throws('MongoError','DB ERROR')
      req.body = {
        userEmail: expect.userEmail,
        password: expect.password
      }
      await user.login(req,res)
      res.statusCode.should.equal(503)
      res._getData().should.property('errorMessage')
    })
	})

  describe('Authorize Token', () => {
    let userToken
    beforeEach(async () => {
      userToken = await jwt.sign(
        {
          userEmail : expect.userEmail
        },
        'NamKiWookBirthday1011',
        {
          expiresIn: '1000'

        }
      )
    })
    it('인증된 사용자', async () => {
      req.headers = {token : userToken}
      await user.authorizeToken(req,res)
      req.decoded.should.property('userEmail')
    })
    it('인증되지 않은 사용자', () => {
      req.headers = {token : '12312312312'}
      user.authorizeToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage','jwt malformed')
    })
    it('token 값이 설정되지 않은 사용자', () => {
      user.authorizeToken(req,res)
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage','Not Token')
    })

    it('유효기간이 만료된 사용자', async () => {
      let setTimeoutPromise = util.promisify(setTimeout)
      req.headers = {token : userToken}
      await setTimeoutPromise(1500).then(() => {
        user.authorizeToken(req, res)
      })
      res.statusCode.should.equal(400)
      res._getData().should.property('errorMessage','jwt expired')
    })
  })

})