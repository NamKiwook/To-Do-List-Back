var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var userController = require('./routes/user')
var boardController = require('./routes/board')

var app = express()
var mongoose = require('mongoose')
//var connectHistory = require('connect-history-api-fallback')

var mongoUrl = 'mongodb://localhost:27017/todo'

mongoose.Promise = global.Promise
mongoose.connect(mongoUrl)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function(){
	console.log('mongodb connection OK.')
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

//app.use(connectHistory());
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(userController.authorizeToken)

//Routing
//Get
app.get('/api/me',userController.getMyInfo)
app.get('/api/board',boardController.loadBoard)
//Post
app.post('/api/user', userController.signUpAccount)
app.post('/api/user/token', userController.login)
app.post('/api/board',boardController.createBoard)

//Put
app.put('/api/board',boardController.modifyBoard)
//Delete
app.delete('/api/board',boardController.deleteBoard)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404))
})

// error handler
app.use(function(err, req, res) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
