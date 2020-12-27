var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local');
const {v4: uuidv4 } = require('uuid');

const jwt_secret = process.env.JWT_SECRET;

var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwt_secret,
}

passport.use(new JwtStrategy(opts, function(jwt_payload, done){
  // check token not expired
  // check that has id is in the db
  return done(null, true);
}));

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done){
    // find user from db
    var id = uuidv4();
    var payload = {
      id: id
    }
    var token = jwt.sign(payload, jwt_secret, 
      {
        algorithm: 'HS256',
        expiresIn: "2h"
      });
    
    //save token to db

    return done(null, {
      token: token
    });
  }));

  exports.passport = passport;