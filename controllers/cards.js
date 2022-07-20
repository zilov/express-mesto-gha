const Cards = require('../models/card');
const Users = require('../models/user');

const getCards = (req, res) => {
  Cards.find({})
  .then(cards => res.send(cards))
  .catch((err) => res.send({ message : err.message }))
}

const createCard = (req, res) => {
  Users.findById(req.user._id)
    .then(user => {
      req.body.owner = user
      Cards.create(req.body)
        .then(card => res.send(card))
        .catch((err) => res.status(400).send({ message : err.message }))
    })
    .catch(err => res.send({ massage : `Cannot find current user to create card: ${err.message}` }))
}

const deleteCard = (req, res) => {
  Cards.findByIdAndDelete(req.params.id, (err, card) => {
    if (!card) {
      return res.status(404).send({message : `Card was already deleted or not exists`})
    }
    res.send(card)
  })
    .catch(err => res.status(500).send({ message : err.message }))
}

const likeCard = (req, res) => {
  Users.findById(req.user._id, (err, user) => {
    if (err) {
      return res.status(404).send({message : `Cannot find user: ${err.message}`})
    }
    Cards.findByIdAndUpdate(
      req.params.id,
      {$push : {likes: user}},
      {new: true},
      (err, card) => {
        if (err) {
          return res.status(404).send( { message : err.message })
        }
        if (!card) {
          return res.status(404).send( { message : `Card ID is not found` })
        }
        res.send(card)
      }
    )
  })
    .catch(err => res.status(500).send({ message : err.message }))
}

const unlikeCard = (req, res) => {
  Cards.findByIdAndUpdate(
    req.params.id,
    { $pullAll : {
       likes : [ { _id : req.user._id } ]
      }
    },
    { new : true },
    (err, card) => {
      if (err) {
        return res.status(400).send({ message : err.message })
      }
      res.send(card)
    })
    .catch(err => res.status(500).send({ message : err.message }))
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard
};