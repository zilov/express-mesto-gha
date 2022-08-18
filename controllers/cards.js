const Cards = require('../models/card');
const Users = require('../models/user');

const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  ForbiddenError,
} = require('./errors');

const getCards = (req, res, next) => {
  Cards.find({})
    .then((cards) => res.send(cards))
    .catch((err) => next(new InternalServerError(err.message)));
};

const createCard = (req, res, next) => {
  Users.findById(req.user._id)
    .then((user) => {
      req.body.owner = user;
      Cards.create(req.body)
        .then((card) => res.send(card))
        .catch((err) => next(new BadRequestError(err.message)));
    })
    .catch((err) => next(new NotFoundError(`Cannot find current user to create card: ${err.message}`)));
};

const deleteCard = (req, res, next) => {
  Cards.findById(req.params.id)
    .then((card) => {
      if (req.user._id != card.owner._id) {
        next(new ForbiddenError('Cannot delete card of other users'));
      }
      return Cards.findByIdAndDelete(req.params.id);
    })
    .then(() => res.send({ message: 'Card was successfully deleted' }))
    .catch(() => next(new NotFoundError('Card was already deleted or not exists')));
};

const likeCard = (req, res, next) => {
  Cards.findByIdAndUpdate(
    req.params.id,
    { $push: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Card ID is not found'));
      }
      return res.send(card);
    })
    .catch((err) => next(new InternalServerError(err.message)));
};

const unlikeCard = (req, res, next) => {
  Cards.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Card ID is not found'));
      }
      return res.send(card);
    })
    .catch((err) => next(new InternalServerError(err.message)));
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard,
};
