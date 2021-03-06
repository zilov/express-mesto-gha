const Cards = require('../models/card');
const Users = require('../models/user');
const statusCodes = {
  notFound: 404,
  badRequest: 400,
  InternalServerError: 500,
};

const getCards = (req, res) => {
  Cards.find({})
    .then((cards) => res.send(cards))
    .catch((err) => res.status(statusCodes.InternalServerError).send({ message: err.message }));
};

const createCard = (req, res) => {
  Users.findById(req.user._id)
    .then((user) => {
      req.body.owner = user;
      Cards.create(req.body)
        .then((card) => res.send(card))
        .catch((err) => res.status(statusCodes.badRequest).send({ message: err.message }));
    })
    .catch((err) => res.status(statusCodes.notFound).send({ massage: `Cannot find current user to create card: ${err.message}` }));
};

const deleteCard = (req, res) => {
  Cards.findByIdAndDelete(req.params.id, (err, card) => {
    if (err) {
      return res.status(statusCodes.badRequest).send({ message: err.message });
    }
    if (!card) {
      return res.status(statusCodes.notFound).send({ message: 'Card was already deleted or not exists' });
    }
    return res.send({ message: 'Card was successfully deleted' });
  })
    .catch((err) => res.status(statusCodes.InternalServerError).send({ message: err.message }));
};

const likeCard = (req, res) => {
  Users.findById(req.user._id, (err, user) => {
    if (err) {
      return res.status(statusCodes.notFound).send({ message: `Cannot find user: ${err.message}` });
    }
    Cards.findByIdAndUpdate(
      req.params.id,
      { $push: { likes: user } },
      { new: true },
      (cardsErr, card) => {
        if (cardsErr) {
          return res.status(statusCodes.badRequest).send({ message: cardsErr.message });
        }
        if (!card) {
          return res.status(statusCodes.notFound).send({ message: 'Card ID is not found' });
        }
        return res.send(card);
      },
    );
  })
    .catch((err) => res.status(statusCodes.InternalServerError).send({ message: err.message }));
};

const unlikeCard = (req, res) => {
  Cards.findByIdAndUpdate(
    req.params.id,
    {
      $pull: {
        likes: [{ _id: req.user._id }],
      },
    },
    { new: true },
    (err, card) => {
      if (err) {
        return res.status(statusCodes.badRequest).send({ message: err.message });
      }
      if (!card) {
        return res.status(statusCodes.notFound).send({ message: 'Card ID is not found' });
      }
      return res.send(card);
    },
  )
    .catch((err) => res.status(statusCodes.InternalServerError).send({ message: err.message }));
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard,
};
