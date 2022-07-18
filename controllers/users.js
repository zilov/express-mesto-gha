const Users = require('../models/user');

const getUsers = (req, res) => {
  Users.find({})
    .then(users => res.send(users))
    .catch((err) => res.status(400).send({ message : err.message }))
}

const getUser = (req, res) => {
  const {id} = req.params
  Users.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({message: "User not found!"})
      }
      res.send(user)
    })
    .catch((err) => res.status(400).send({message: `Incorrect ID: ${err.message}`}))
}

const createUser = (req, res) => {
  Users.create(req.body)
    .then(user => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({message: err.message})
      }
      res.status(500).send({ message : err.message })
    })
}

const updateUser = (req, res) => {
  const id =  req.user._id
  Users.findOneAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true
    },
    (err, user) => {
      if (!user) {
        return res.status(404).send({ message : err.message })
      }
      if (err) {
        if (err.name === 'ValidationError') {
          return res.status(400).send({ message : err.message })
        }
      }
      return res.send(user)
    })
    .catch((err) => res.status(500).send({ message : err.message }))
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser
}