require('dotenv').config();
console.log('Loaded ENV Variables:', process.env.DB_HOST, process.env.DB_USER);
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var homeRouter = require('./routes/home');
const accountRouter = require('./routes/account');
const leaderboardRouter = require('./routes/leaderboard');
const gameRouter = require('./routes/game');

const db = require('./database/connection'); // ✅ Import the correct database connection file

// ✅ Test MySQL Connection
db.query('SELECT NOW() AS time')
    .then(([rows]) => console.log('✅ Database Test Successful:', rows))
    .catch(err => console.error('❌ Database Query Failed:', err.message));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);
app.use('/account', accountRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/game', gameRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;