const bcrypt = require('bcryptjs');
const Users = require('../models/user');
const jwt = require('jsonwebtoken');

const {
  UnauthorizedError,
  NotFoundError
} = require('../controllers/errors');

const checkToken = (req, res, next) => {
  jwt.verify(req.cookies.jwt, 'secretsecretsecret', (err, decoded) => {
    if (err) {
      next(new UnauthorizedError("Cannot find JWT!"))
    }
    else {
      return Users.findById(decoded, (err, user) => {
        if (err) {
          next(new UnauthorizedError('Error in decoding token'))
        }
        if (!user) {
          next(new NotFoundError('Please sign in! Token is expired, cannot find user!'))
        }
        req.user = decoded;
        next()
      })
    }
  })
}

module.exports = {
  checkToken
}