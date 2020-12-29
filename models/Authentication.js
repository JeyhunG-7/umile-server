var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local');
const { v4: uuidv4 } = require('uuid');
const { findAdminByEmail } = require('./Admin');
const { findClientByEmail } = require('./Client');
const Password = require('./../helpers/Password');
const { addTokenId, findTokenId, removeTokenId, createToken } = require('../helpers/Token');
const jwt_secret = process.env.JWT_SECRET;

const { Log } = require('./../helpers/Logger'),
        logger = new Log('Authentication');
const ResponseBuilder = require('./../helpers/ResponseBuilder');

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwt_secret,
    ignoreExpiration: true
}

passport.use('jwt', new JwtStrategy(opts, async function (jwt_payload, done) {
    // check token expiration
    if (Date.now() >= jwt_payload.exp * 1000) {
        await logout(jwt_payload.id);
        logger.info('Requested Authentication but found expired token');
        return done(null, false);
    }

    try {
        var result = await findTokenId(jwt_payload.id);
        if (result.length !== 1) {
            return done(null, false);
        }
    } catch (e) {
        logger.error('Authentication failed via JWT Token');
    }
    return done(null, jwt_payload);
}));

passport.use('admin-local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    async function (username, password, done) {
        try {
            let result = await findAdminByEmail(username);
            if (result.length !== 1) {
                return done(null, false);
            }

            var admin = result[0];
            if (!(await Password.compareAsync(password, admin.pwd_hash))) {
                return done(null, false)
            }
        } catch (e) {
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
            if (results.rowCount != 1) {
                logger.error("Couldn't add auth token id to database");
            }
        } catch (e) {
            logger.error(`Error while adding auth token id to database: ${JSON.stringify(e)}`);
        }

        return done(null, {
            token: token
        });
    }));

passport.use('client-local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    async function (username, password, done) {
        try {
            let result = await findClientByEmail(username);
            if (result.length !== 1) {
                return done(null, false);
            }

            var client = result[0];
            if (!(await Password.compareAsync(password, client.pwd_hash))) {
                return done(null, false)
            }
        } catch (e) {
            return done(null, false);
        }
        var id = uuidv4();
        var payload = {
            account: client,
            id: id
        }

        var token = createToken(payload);

        try {
            var results = await addTokenId(id);
            if (results.rowCount != 1) {
                logger.error("Couldn't add auth token id to database");
            }
        } catch (e) {
            logger.error(`Error while adding auth token id to database: ${JSON.stringify(e)}`);
        }

        return done(null, {
            token: token
        });
    }));

const logout = async function (token_id) {
    await removeTokenId(token_id);
}

const authenticationWith = function(authMethod, opts){
    if (!opts){
        opts = { session: false }
    }
    return function(req, res, next) {
        return passport.authenticate(authMethod, opts, (err, user, info) => {
            if (err){
                logger.error(`Auth error => ${JSON.stringify(err)}`);
                return ResponseBuilder.sendError(req, res, "Authentication error");
            }

            if (!user){
                return ResponseBuilder.sendError(req, res, "UNAUTHORIZED_USER");
            }

            req.user = user;
            next();
        })(req, res, next);
    }
}

module.exports = { passport, logout, authenticationWith };