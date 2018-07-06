let express = require('express')
let jwt = require('jsonwebtoken')
let router = express.Router()
let userSchema = require('../models/user')

let signUpAccount = function(req,res,next) {
  let user = new userSchema({
		username : req.body.username,
		userEmail : req.body.userEmail,
		password : req.body.password
	})

	user.save().then(() => {
		console.log('saved')
		res.status(200).send()
	}).catch((err) => {
		console.log(err)
		res.status(400).send({errorMessage : err})
	})

  next()
}

let authToken = async function(req, res) {
	try {
		let user = await userSchema.findOne({userEmail: req.body.userEmail, password: req.body.password})
		let userToken = await jwt.sign(
			{
				userEmail : user.userEmail
			},
			'NamKiWookBirthday1011',
			{
				expiresIn: '7d'
			}
		)
		res.status(200).send({token: userToken})
	} catch(err) {
		console.log(err)
		res.status(400).send({errorMessage : err})
	}
}

router.post('/account', signUpAccount)

router.post('/token', authToken)

module.exports = {
	router : router,
	signUpAccount: signUpAccount,
	authToken: authToken
}
