const Users = require('../models/user');
const { statusCodes } = require('../routes/index');

const getUsers = (req, res) => {
  Users.find({})
    .then((users) => res.send(users))
    .catch((err) => res.status(statusCodes.bedRequest).send({ message: err.message }));
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
    .catch((err) => res.status(statusCodes.bedRequest).send({ message: `Incorrect ID: ${err.message}` }));
};

const createUser = (req, res) => {
  Users.create(req.body)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(statusCodes.bedRequest).send({ message: err.message });
      }
      return res.status(statusCodes.InternalServerError).send({ message: err.message });
    });
};

const updateUser = (req, res) => {
  const id = req.user._id;
  Users.findOneAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
    (err, user) => {
      if (!user) {
        return res.status(statusCodes.bedRequest).send({ message: err.message });
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
};
