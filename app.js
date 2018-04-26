
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , methodOverride = require('method-override')
  , serveStatic = require('serve-static')
  , errorhandler = require('errorhandler')
  , favicon = require('serve-favicon')
  , morgan = require('morgan')
  , bodyParser = require('body-parser')
  , multer = require('multer') // v1.0.5
  , upload = multer() // for parsing multipart/form-data
  , session = require("express-session")
  ;
  
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// // you can use ejs view engine while keeping your view files as .html
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(morgan());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(methodOverride('X-HTTP-Method-Override'));
//app.use(app.router);
app.use(serveStatic(__dirname + '/public'));
app.use(serveStatic(__dirname + '/semantic'));

// development only 
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

/*
 *  express-session 모듈 사용
 */
app.use(session({
  secret : 'keyboard cat',
  resave : false,
  saveUninitialized : true
}));

/*
 * db connect pool
 */
var mysql = require('mysql');
var connectionPool;

// 원격DB(AWS)
connectionPool = mysql.createPool({
    user : 'admin',
    password : 'sktngm12!',
    database : 'mobig',
    host : 'mobig.czi2danpmvxm.us-east-2.rds.amazonaws.com',
    port : '3306',
    connectionLimit : 20,
    waitForConnections : false
});

// local DB
// user : process.env.C9_USER,
// password : '',
// database : 'c9',
// host : process.env.IP,
// port : '3306',
// connectionLimit : 20,
// waitForConnections : false


// routes
var index = require('./routes/index')(app, connectionPool);
var mvnodata = require('./routes/mvnodata')(app, connectionPool);
var myaccount = require('./routes/myaccount')(app, connectionPool);
var mydata = require('./routes/mydata')(app, connectionPool);
var progress = require('./routes/progress')(app, connectionPool);
var result = require('./routes/result')(app, connectionPool);

//sample routes
var sample = require('./routes/sample')(app, connectionPool);


var server = http.createServer(app)

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + ' : '+app.get('port'));
  console.log('https://' + process.env.C9_HOSTNAME);
});

module.exports = app;