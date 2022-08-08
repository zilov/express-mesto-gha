const Users = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const statusCodes = {
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  alreadyExists: 409,
  InternalServerError: 500,
};

const login = (req, res) => {
  const {email, password} = req.body
  if (!email || !password) {
    return res.status(statusCodes.badRequest).send({ message: 'Request does not contain email or password!'});
  }
  Users.findOne({email}).select('+password')
    .then((user) => {
      if (!user) {
        return res.status(statusCodes.unauthorized).send({ message: 'Wrong email or password' });
      }
      return bcrypt.compare(password, user.password)
        .then(matched => {
          // если все ок - генерим и сохраняем jwt, если нет - кидаем ошибку
          if (!matched) {
            return res.status(statusCodes.unauthorized).send({ message: 'Wrong email or password' });
          }
          const token = jwt.sign({_id: user._id}, 'secretsecretsecret', {expiresIn: '7d'}) // перенести сикрет в отдельный файл

          res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true });
          req.user = {_id: user._id}
          return res.send({token});
        })
    })
    .catch(err => res.status(statusCodes.InternalServerError).send({message : err.message}))
}

const getUsers = (req, res) => {
  Users.find({})
    .then((users) => res.send(users))
    .catch((err) => res.status(statusCodes.badRequest).send({ message: err.message }));
};

const getUser = (req, res) => {
  const { id } = req.params;
  Users.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(statusCodes.notFound).send({ message: 'User not found!' });
      }
      return res.send(user);
    })
    .catch((err) => res.status(statusCodes.badRequest).send({ message: `Incorrect ID: ${err.message}` }));
};

const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(statusCodes.unauthorized).send({ message: 'Cannot find current user' });
  }
  Users.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return res.status(statusCodes.notFound).send({ message: 'User not found!' });
      }
      return res.send(user);
    })
    .catch((err) => res.status(statusCodes.badRequest).send({ message: `Incorrect ID: ${err.message}` }));;
}

const createUser = (req, res) => {
  const { email, password } = req.body

  Users.findOne({email}, (err, user) => {
    if (err) {
      return res.status(statusCodes.badRequest).send({ message: err.message });
    }
    if (!user) {
      return bcrypt.hash(password, 10, (err, hash) => {
        req.body.password = hash;
        Users.create(req.body)
          .then((user) => res.send({message : "User successfully created!"}))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              return res.status(statusCodes.badRequest).send({ message: err.message });
            }
            return res.status(statusCodes.InternalServerError).send({ message: err.message });
          });
      })
    }
    return res.status(statusCodes.alreadyExists).send({ message: 'User is already exists! Please sign in!' });
  })
    .catch(err => res.status(statusCodes.InternalServerError).send({message: err.message}))
};

const updateUser = (req, res) => {
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
        return res.status(statusCodes.badRequest).send({ message: 'Cannot update user!' });
      }
      return res.send(user);
    },
  )
    .catch((err) => res.status(statusCodes.InternalServerError).send({ message: err.message }));
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  login,
  getCurrentUser
};
