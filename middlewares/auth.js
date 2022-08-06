const bcrypt = require('bcryptjs');
const Users = require('../models/user');
const jwt = require('jsonwebtoken');

const statusCodes = {
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  InternalServerError: 500,
};

const checkToken = (req, res, next) => {
  jwt.verify(req.cookies.jwt, 'secretsecretsecret', (err, decoded) => {
    if (err) {
      return res.status(statusCodes.badRequest).send({message : "Cannot find JWT!"})
    }
    return Users.findById(decoded, (err, user) => {
      if (err) {
        return res.status(statusCodes.unauthorized).send({ message: 'Error in decoding token' });
      }
      if (!user) {
        return res.status(statusCodes.notFound).send({ message: 'Please sign in! Token is expired, cannot find user!' });
      }
      req.user = decoded;
      next()
    })
  })
}

module.exports = {
  checkToken
}