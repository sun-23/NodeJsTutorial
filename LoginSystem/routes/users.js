// router
var express = require('express');
var router = express.Router();
var User = require('../model/user');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const {
  check,
  validationResult
} = require('express-validator');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register.ejs');
});

router.post('/register', [
  check('email', 'กรุณาป้อนอีเมล').isEmail(),
  check('name', 'กรุณาป้อนชื่อของท่าน').not().isEmpty(),
  check('password', 'กรุณาป้อนรหัสผ่าน').not().isEmpty()
], function(req, res, next) {
  const result = validationResult(req);
  var errors = result.errors;
  //Validation Data
  if (!result.isEmpty()) {
    //Return error to views
    res.render('register', {
      errors: errors
    });
  } else {
    //Insert Data
    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.email;
    var newUser = new User({
      name: name,
      password: password,
      email: email
    });
    User.createUser(newUser, function(err, user) {
      if (err) throw err ;
    });
    res.location('/');
    res.redirect('/');

  }

});

router.get('/login', function(req, res, next) {
  res.render('login.ejs');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/users/login');
});

router.post('/login', passport.authenticate('local',{
  failureRedirect: '/users/login',
    failureFlash: true
}),function(req, res, next) {
  req.flash("success","ลงชื่อเข้าใช็เรียบร้อย");
  res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
                           //same username, password input in login.ejs
passport.use(new LocalStrategy(function(username, password, done) {
  User.getUserByName(username, function(err, user) {
    if (err) throw error;
    if (!user) {
      return done(null, false);
    }else{
      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) return err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }
  });
}));
module.exports = router;
