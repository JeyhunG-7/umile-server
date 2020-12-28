const router = require('express').Router();
const Logger = require('../models/Logger');

const Validator = require('../models/Validator');
const { decodeToken } = require('../models/Token');
const Password = require('../helpers/Password');
const { addClientAsync } = require('../models/Client');


router.post('/signup', async function (req, res) {
  const validateError = Validator.verifyParams(req.body, { 
    email:          'email',
    first_name:     'string',
    last_name:      'string',
    company_name:   'string',
    phone:          'string',
    token:          'string',
    password:       'string'
  });
  if (validateError) return Logger.sendError(req, res, 'Request is missing params!', validateError);    

  const { email, first_name, last_name, company_name, phone, token, password } = req.body;

  let token_payload = isTokenValid(token);
  if (!token_payload){
    return Logger.sendError(req, res, "Not a valid token");
  }

  if (token_payload.email !== email){
    return Logger.sendError(req, res, "Not match email");
  }

  var passwordHash = await Password.createHashAsync(password);
  if (!passwordHash){
    return Logger.sendError(req, res, "Something went wrong while creating account");
  }

  try{
    await addClientAsync(email, first_name, last_name, company_name, phone, passwordHash);
  } catch(e){
    if (e.message.includes('duplicate key')){
      return Logger.sendError(req, res, "Record already exists");  
    }
    return Logger.sendError(req, res, "Something went wrong while creating account");
  }

  return Logger.sendSuccess(req, res, "Account was successfully created");
});

router.post('/validate', function (req, res) {
  const validateError = Validator.verifyParams(req.body, { token: 'string' });
  if (validateError) return Logger.sendError(req, res, 'Request is missing params!', validateError);    

  return isTokenValid(req.body.token) ? Logger.sendSuccess(req, res) : Logger.sendError(req, res);
});

function isTokenValid(token){
  var payload = decodeToken(token);
  return payload;
}

module.exports = router;