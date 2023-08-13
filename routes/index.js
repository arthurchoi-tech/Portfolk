var express = require('express');
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Portfolk connects you with the rest of the world!', user: req.user, body: 'So what are you waiting for? Click <a href="/register">here</a> to register and post your portfolio. <br>If you are logged in, click <a href="/portfolios">here</a> to upload your portfolio</a>' });
});

// GET handler for /login
router.get("/login", (req, res, next) => {
  // retrieve the messages
  let messages = req.session.messages || [];
  // clear messages from session
  req.session.messages = [];
  // send messages to view
  res.render("login", {title: "Login to your Account", messages: messages});
});
// POST handler for /login
router.post("/login", passport.authenticate(
  "local", // name of strategy
  {
    successRedirect: "/portfolios",
    failureRedirect: "/login",
    failureMessage: "Invalid Credentials" // avoid being too specific with this error
  }
))

// GET handler for /register
router.get("/register", (req, res, next) => {
  res.render("register", { title: "Create a new Account"});
})
// POST handler for /register
router.post("/register", (req, res, next) => {
  User.register({
    username: req.body.username,
  }, req.body.password, (err, newUser) => {
    if (err) {
      console.log(err);
      return res.redirect("/register");
    } else {
      req.login(newUser, (err) => {
        res.redirect("portfolios");
      })
    }
  })
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    res.redirect("/login");
  })
});

// GET handler for /github
// user gets sent to Github.com to enter their credentials
router.get("/github", passport.authenticate("github", { scope: ["user.email"]}));

// GET handler for /github/callback
// user is sent back from github.com after authenticating
router.get("/github/callback",
  passport.authenticate("github", { failureRedirect: "/login"}),
  (req, res, next) => {
    res.redirect("/portfolios");
  }
)

module.exports = router;
