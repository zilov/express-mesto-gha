const Users = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  BadRequestError,
  UnauthorizedError,
  AlreadyExistsError,
  NotFoundError,
  InternalServerError
} = require('./errors');

const login = (req, res, next) => {
  const {email, password} = req.body
  if (!email || !password) {
    next(new BadRequestError('Request does not contain email or password!'))
  }
  Users.findOne({email}).select('+password')
    .then((user) => {
      if (!user) {
        next(new UnauthorizedError('Wrong email or password'))
      }
      return bcrypt.compare(password, user.password)
        .then(matched => {
          // если все ок - генерим и сохраняем jwt, если нет - кидаем ошибку
          if (!matched) {
            next(new UnauthorizedError('Wrong email or password'))
          }
          const token = jwt.sign({_id: user._id}, 'secretsecretsecret', {expiresIn: '7d'}) // перенести сикрет в отдельный файл
          res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true });
          req.user = {_id: user._id}
          return res.send({token});
        })
    })
    .catch((err) => {next(new InternalServerError(`Cannot get access to server for login: ${err.message}`))})
}

const getUsers = (req, res, next) => {
  Users.find({})
    .then((users) => res.send(users))
    .catch((err) => {next(new BadRequestError(`Cannot find users: ${err.message}`))});
};

const getUser = (req, res, next) => {
  const { id } = req.params;
  Users.findById(id, (err, user) => {
    if (!user) {
      next(new NotFoundError(`User with provided ID is not exists!`))
    }
    return user
  })
    .then((user) => {
      res.send(user);
    })
    .catch(err => next(new BadRequestError(`Incorrect ID: ${err.message}`)))
};

const getCurrentUser = (req, res, next) => {
  if (!req.user) {
    next(new UnauthorizedError('Cannot find current user'))
  }
  Users.findById(req.user._id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('User not found!'))
      }
      return res.send(user);
    })
    .catch(err => next(new BadRequestError(`Incorrect ID: ${err.message}`)));
}

const createUser = (req, res, next) => {
  const { email, password } = req.body

  Users.findOne({email}, (err, user) => {
    if (err) {
      next(new BadRequestError(`Error in checking for existing user: ${err.message}`))
    }
    if (!user) {
      return bcrypt.hash(password, 10, (err, hash) => {
        req.body.password = hash;
        Users.create(req.body)
          .then((user) => res.send({message : "User successfully created!"}))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              next(new BadRequestError(`Validation error: ${err.message}`))
            }
            next(new InternalServerError(err.message))
          });
      })
    }
    next(new AlreadyExistsError('User is already exists! Please sign in!'))
  })
    .catch(err => next(new InternalServerError(err.message)))
};

const updateUser = (req, res, next) => {
  const id = req.user._id;
  Users.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
    (err, user) => {
      if (!user) {
        next(new BadRequestError('Cannot update user!'))
      }
      return res.send(user);
    },
  )
    .catch(err => next(new InternalServerError(err.message)))
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  login,
  getCurrentUser
};
