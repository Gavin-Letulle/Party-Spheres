require('dotenv').config();
console.log('Loaded ENV Variables:', process.env.DB_HOST, process.env.DB_USER);
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

var homeRouter = require('./routes/home');
const myAccountRouter = require('./routes/myAccount')
const editRouter = require('./routes/edit')
const leaderboardRouter = require('./routes/leaderboard');
const gameRouter = require('./routes/game');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const signupRouter = require('./routes/signup');
const charactersRouter = require('./routes/characters');
const characterRouter = require('./routes/character');
const profileRouter = require('./routes/profile');
const playersRouter = require('./routes/players');
const adminRouter = require('./routes/admin');

const db = require('./database/connection'); 

db.query('SELECT NOW() AS time')
    .then(([rows]) => console.log('✅ Database Test Successful:', rows))
    .catch(err => console.error('❌ Database Query Failed:', err.message));

var app = express();

const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 } // 1 hour session
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routers
app.use('/', homeRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/game', gameRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/myAccount', myAccountRouter);
app.use('/characters', charactersRouter);
app.use('/character', characterRouter);
app.use('/profile', profileRouter);
app.use('/logout', logoutRouter);
app.use('/edit', editRouter);
app.use('/players', playersRouter);
app.use('/admin', adminRouter);

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