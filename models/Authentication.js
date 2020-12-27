var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local');
const {v4: uuidv4 } = require('uuid');
const { findAdminByEmail } = require('./Admin');
const { addTokenId, findTokenId, removeTokenId, createToken } = require('./Token');
const jwt_secret = process.env.JWT_SECRET;

var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwt_secret,
  ignoreExpiration: true
}

passport.use('admin-jwt', new JwtStrategy(opts, async function(jwt_payload, done){
  // check token expiration
  if (Date.now() >= jwt_payload.exp * 1000) {
    await logout(jwt_payload.id);
    return done(null, false);
  }

  try {
    var result = await findTokenId(jwt_payload.id);
    if (result.length !== 1){
      return done(null, false);
    }
  } catch(e){
    //TODO: log error
  }
  return done(null, jwt_payload);
}));

passport.use('admin-local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  async function(username, password, done){
    try{
      let result = await findAdminByEmail(username);
      if (result.length !== 1){
        return done(null, false);
      }

      var admin = result[0];
      if (admin.pwd_hash !== password){
        return done(null, false)
      }
    } catch(e) {
      return done(null, false);
    }
    var id = uuidv4();
    var payload = {
      account: admin,
      id: id
    }

    var token = createToken(payload);
    
    try {
      var results = await addTokenId(id);
      if (results.rowCount != 1){
        //TODO: log error
      }
    } catch(e){
      //TODO: log error
    }

    return done(null, {
      token: token
    });
  }));

  const logout = async function(token_id){
    await removeTokenId(token_id);
  }

  module.exports = { passport, logout };