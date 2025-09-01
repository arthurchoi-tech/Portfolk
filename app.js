var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var portfoliosRouter = require('./routes/portfolios');
var categoriesRouter = require('./routes/categories');

// export libraries
var configs = require('./config/globals')
var mongoose = require('mongoose');
var hbs = require('hbs'); 

var passport = require('passport');
var githubStrategy = require('passport-github2').Strategy
var session = require('express-session');
var User = require('./models/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// AUTHENTICATION MECHANISM
// configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-fallback', // used for encryption/ protecting cookie
  resave: false, // forces the session to be saved back to the store even when not modified
  saveUninitialized: false
}));
// configure passport
app.use(passport.initialize());
app.use(passport.session());
// configure passport strategy
passport.use(User.createStrategy());
// configure github oauth strategy
passport.use(new githubStrategy(
{
  clientID: configs.github.clientId,
  clientSecret: configs.github.clientSecret,
  callbackURL: configs.github.callbackUrl
}, 
  async (accessToken, refreshToken, profile, done) => {
    const user = await User.findOne({ oauthId: profile.id })
    if (user) {
      return done(null, user)
    }
    else {
      const newUser = new User({
        username: profile.username, 
        oauthId: profile.id, 
        oauthProvider: "Github", 
        created: Date.now()
      });
      const savedUser = await newUser.save();
      return done(null, savedUser);
    }
  }
))
// set passport to write/read user data to/from session object
passport.serializeUser(User.serializeUser()); // User.serializerUser() comes from plm
passport.deserializeUser(User.deserializeUser());

// ROUTING MECHANISM
app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/portfolios', portfoliosRouter);
app.use('/categories', categoriesRouter);

// configure mongoose
mongoose
  .connect(configs.db, { useNewUrlParser: true, useUnifiedTopology: true}) //connect
  .then((message) => {
    console.log('Connected successfully')
  })
  .catch((err) => {
    console.log('error while connecting! ' + err)
  })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Add HBS helper methods for formatting dates and selecting values from dropdowns
hbs.registerHelper('createOption', (currentValue, selectedValue) => {
  // initialize selected property
  var selectedProperty = '';
  // if values are equal, set the selected property
  if (currentValue == selectedValue) {
    selectedProperty = 'selected';
  }
  // generate html code for the option element with the selected property
  return new hbs.SafeString('<option ' + selectedProperty + '>' + currentValue + '</option>'); // <option>VALUE</option>
})

// Add HBS helper methods for checking if user is admin (REDACTED)
hbs.registerHelper('isAdmin', function(username, options) {
  return (username === REDACTED) ? options.fn(this) : options.inverse(this);
});

// Add HBS helper methods for checking if user is the author of the portfolio
hbs.registerHelper('isAuthor', function(username, author, options) {
  return (username === author) ? options.fn(this) : options.inverse(this);
});

// Add HBS helper methods for base64 conversion 
hbs.registerHelper('base64Image', function(picture) {
  if (picture && picture.data && picture.contentType) {
    return new hbs.SafeString(
      `<img src="data:${picture.contentType};base64,${picture.data.toString('base64')}" alt="Portfolio Picture" style="max-width: 100px;">`
    );
  }
  return '';
});

hbs.registerHelper('toShortDate', (longDateValue) => {
  if (!longDateValue) {
    return '';
  }
  return new hbs.SafeString(longDateValue.toLocaleDateString('en-Ca'));
})

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
