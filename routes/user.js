let jwt = require('jsonwebtoken')
let userSchema = require('../models/user')

let signUpAccount = async (req,res) => {
  try {
    if (!req.body.userEmail || !req.body.password || !req.body.userName) throw new Error('Not Filled')
    let user = new userSchema({
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      password: req.body.password
    })
    let account = await user.save()
    res.status(200).send({userName: account.userName, userEmail: account.userEmail})
  } catch (err) {
    if (err.name === 'MongoError') res.status(503).send({errorMessage: err.message})
    else res.status(400).send({errorMessage: err.message})
  }
}

let login = async (req, res) => {
	try {
    if(!req.body.userEmail || !req.body.password) throw new Error('Not Filled')

		let user = await userSchema.findOne({userEmail: req.body.userEmail, password: req.body.password})
    if(!user) throw new Error('Not User')

    let userToken = await jwt.sign(
			{
				userEmail : user.userEmail
			},
			'NamKiWookBirthday1011',
			{
				expiresIn: '1d'
			}
		)
		res.status(200).send({token: userToken})
	} catch(err) {
    if (err.name === 'MongoError') res.status(503).send({errorMessage: err.message})
    else res.status(400).send({errorMessage: err.message})	}
}

let authorizeToken = async (req, res, next) => {
  try {
    if(req.originalUrl === '/api/user' || req.originalUrl === '/api/user/token') return next()
    const token = req.headers['token']
    if (!token) throw new Error('Not Token')
    let decodeToken = await jwt.verify(token, 'NamKiWookBirthday1011')
    req.decoded = decodeToken
    next()
  } catch (err) {
    if (err.name === 'MongoError') res.status(503).send({errorMessage: err.message})
    else res.status(400).send({errorMessage: err.message})
  }
}

module.exports = {signUpAccount, login, authorizeToken}