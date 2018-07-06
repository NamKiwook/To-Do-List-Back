let express = require('express')
let jwt = require('jsonwebtoken')
let router = express.Router()
let userSchema = require('../models/user')

let signUpAccount = async function(req,res) {
  if(!req.body.userEmail || !req.body.password || !req.body.userName) {
    res.status(400).send({errorMessage : 'Not Filled'})
    return
  }

  try {
    let user = new userSchema({
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      password: req.body.password
    })
    let account = await user.save()
    res.status(200).send({userName: account.userName, userEmail: account.userEmail})
  } catch (err) {
    res.status(400).send({errorMessage: err.message})
  }
}

let authToken = async function(req, res) {
  if(!req.body.userEmail || !req.body.password) {
    res.status(400).send({errorMessage : 'Not Filled'})
    return
  }

	try {
		let user = await userSchema.findOne({userEmail: req.body.userEmail, password: req.body.password})

    if(!user) {
      res.status(400).send({errorMessage : 'Not User'})
      return
    }

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
		res.status(400).send({errorMessage : err.message})
	}
}

router.post('/account', signUpAccount)

router.post('/token', authToken)

module.exports = {
	router : router,
	signUpAccount: signUpAccount,
	authToken: authToken
}
