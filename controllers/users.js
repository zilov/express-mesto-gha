const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Users = require('../models/user');

const {
  BadRequestError,
  UnauthorizedError,
  AlreadyExistsError,
  NotFoundError,
  InternalServerError,
} = require('./errors');

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new BadRequestError('Request does not contain email or password!'));
  }
  return Users.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Wrong email or password'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          // если все ок - генерим и сохраняем jwt, если нет - кидаем ошибку
          if (!matched) {
            return next(new UnauthorizedError('Wrong email or password'));
          }
          const token = jwt.sign({ _id: user._id }, 'secretsecretsecret', { expiresIn: '7d' }); // перенести сикрет в отдельный файл
          res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true });
          req.user = { _id: user._id };
          return res.send({ token });
        });
    })
    .catch((err) => { next(new InternalServerError(`Cannot get access to server for login: ${err.message}`)); });
};

const getUsers = (req, res, next) => {
  Users.find({})
    .then((users) => {
      if (!users) {
        return next(new BadRequestError('Cannot find users'));
      }
      return res.send(users);
    })
    .catch((err) => next(new InternalServerError(err.message)));
};

const getUser = (req, res, next) => {
  const { id } = req.params;
  return Users.findById(id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('User with provided ID is not exists!'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Validation error: ${err.message}`));
      }
      return next(new InternalServerError(err.message));
    });
};

const getCurrentUser = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Cannot find current user'));
  }
  return Users.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('User not found!'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Validation error: ${err.message}`));
      }
      return next(new InternalServerError(err.message));
    });
};

const createUser = (req, res, next) => {
  const { email, password } = req.body;

  return Users.findOne({ email })
    .then((user) => {
      if (!user) {
        return bcrypt.hash(password, 10, (error, hash) => {
          req.body.password = hash;
          Users.create(req.body)
            .then(() => res.send({ message: 'User successfully created!' }))
            .catch((err) => {
              if (err.name === 'ValidationError') {
                return next(new BadRequestError(`Validation error: ${err.message}`));
              }
              return next(new InternalServerError(err.message));
            });
        });
      }
      return next(new AlreadyExistsError('User is already exists! Please sign in!'));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Validation error: ${err.message}`));
      }
      return next(new InternalServerError(err.message));
    });
};

const updateUser = (req, res, next) => {
  const id = req.user._id;
  return Users.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  )
    .then(
      (user) => {
        if (!user) {
          return next(new BadRequestError('Cannot update user!'));
        }
        return res.send(user);
      },
    )
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Validation error: ${err.message}`));
      }
      return next(new InternalServerError(err.message));
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  login,
  getCurrentUser,
};
