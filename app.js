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
const recoverRouter = require('./routes/recover');
const instructionsRouter = require('./routes/instructions');

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
//make certain user login state and username is available 

app.use(async (req, res, next) => {
  //bool flag in res.local for user logged
  res.locals.loggedIn = !!req.session.userId;
//if user logged get from database
  if (req.session.userId) {
    try {
      const [rows] = await db.execute(
        "SELECT username FROM users WHERE user_id = ?",
        [req.session.userId]
      );
      
      //if fund store in res.local for ejs to display
      res.locals.username = rows.length ? rows[0].username : null;
    } catch (err) {
      console.error("Error fetching username for views:", err);
      res.locals.username = null;
    }
  } else { //not logged able to have null
    res.locals.username = null;
  }

  next(); //needed for ejs to look at next requests
});

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
app.use('/recover', recoverRouter);
app.use('/instructions', instructionsRouter);


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