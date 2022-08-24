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

const login = (req, res, next) => Users.findOne({ email: req.body.email }).select('+password')
  .then((user) => {
    if (!user) {
      throw new UnauthorizedError('Wrong email or password');
    }
    return bcrypt.compare(req.body.password, user.password)
      .then((matched) => {
        // если все ок - генерим и сохраняем jwt, если нет - кидаем ошибку
        if (!matched) {
          throw new UnauthorizedError('Wrong email or password');
        }
        const token = jwt.sign({ _id: user._id }, 'secretsecretsecret', { expiresIn: '7d' }); // перенести сикрет в отдельный файл
        res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true });
        req.user = { _id: user._id };
        return res.send({ token });
      })
      .catch((err) => next(err));
  })
  .catch((err) => {
    if (err instanceof UnauthorizedError) {
      return next(err);
    }
    return next(new InternalServerError(`Cannot get access to server for login: ${err.message}`));
  });

const getUsers = (req, res, next) => Users.find({})
  .then((users) => res.send(users))
  .catch((err) => next(new InternalServerError(err.message)));

const getUser = (req, res, next) => Users.findById(req.params.id)
  .then((user) => {
    if (!user) {
      throw new NotFoundError('User with provided ID is not exists!');
    }
    return res.send(user);
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.CastError) {
      return next(new BadRequestError(`ID is not valid: ${err.message}`));
    } if (err instanceof NotFoundError) {
      return next(err);
    }
    return next(new InternalServerError(err.message));
  });

const getCurrentUser = (req, res, next) => Users.findById(req.user._id)
  .then((user) => {
    if (!user) {
      throw new NotFoundError('User not found!');
    }
    return res.send(user);
  })
  .catch((err) => {
    if (err instanceof NotFoundError) {
      return next(err);
    }
    return next(new InternalServerError(err.message));
  });

const createUser = (req, res, next) => {
  const { email, password } = req.body;
  return Users.findOne({ email })
    .then((user) => {
      if (user) {
        throw new AlreadyExistsError('User is already exists! Please sign in!');
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => {
      req.body.password = hash;
      return Users.create(req.body);
    })
    .then(() => res.send({ message: 'User successfully created!' }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Validation error: ${err.message}`));
      } if (err instanceof AlreadyExistsError) {
        return next(err);
      }
      return next(new InternalServerError(err.message));
    });
};

const updateUserInfo = (req, res, next) => {
  Users.findByIdAndUpdate(
    req.user._id,
    { $set: { name: req.body.name, about: req.body.about } },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new BadRequestError(`Cannot update user info! ${req.user._id}`);
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Validation error: ${err.message}`));
      } if (err instanceof BadRequestError) {
        return next(err);
      }
      return next(new InternalServerError(err.message));
    });
};

const updateUserAvatar = (req, res, next) => {
  Users.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: req.body.avatar } },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new BadRequestError(`Cannot update user avatar! ${req.user._id}`);
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Validation error: ${err.message}`));
      } if (err instanceof BadRequestError) {
        return next(err);
      }
      return next(new InternalServerError(err.message));
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login,
  getCurrentUser,
};
