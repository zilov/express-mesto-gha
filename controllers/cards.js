const Cards = require('../models/card');
const Users = require('../models/user');
const statusCodes = {
  notFound: 404,
  badRequest: 400,
  InternalServerError: 500,
};
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  ForbiddenError
} = require('./errors');

const getCards = (req, res, next) => {
  Cards.find({})
    .then((cards) => res.send(cards))
    .catch(err => next(new InternalServerError(err.message)))
};

const createCard = (req, res, next) => {
  Users.findById(req.user._id)
    .then((user) => {
      req.body.owner = user;
      Cards.create(req.body)
        .then((card) => res.send(card))
        .catch(err => next(new BadRequestError(err.message)));
    })
    .catch(err => next(new NotFoundError(`Cannot find current user to create card: ${err.message}`)));
};

const deleteCard = (req, res, next) => {
  Cards.findByIdAndDelete(req.params.id, (err, card) => {
    if (err) {
      next(new BadRequestError(err.message))
    }
    if (!card) {
      next(new NotFoundError('Card was already deleted or not exists'))
    }
    if (req.user._id === card.owner._id) {
      return card;
    } else {
      next(new ForbiddenError('Cannot delete card of other users'))
    }
  })
    .then(card => {
      res.send({ message: 'Card was successfully deleted' })
    })
    .catch(err => next(new InternalServerError(err.message)))
};

const likeCard = (req, res, next) => {
  Cards.findByIdAndUpdate(
    req.params.id,
    { $push: { likes: req.user._id } },
    { new: true },
    (err, card) => {
      if (err) {
        return next(new BadRequestError(err.message))
      }
      if (!card) {
        return next(new NotFoundError('Card ID is not found'))
      }
      return card
    }
  )
    .then(card => res.send(card))
    .catch(err => next(new InternalServerError(err.message)));
};

const unlikeCard = (req, res, next) => {
  Cards.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
    (err, card) => {
      if (err) {
        return next(new BadRequestError(err.message))
      }
      if (!card) {
        return next(new NotFoundError('Card ID is not found'))
      }
      return card
    }
  )
    .then(card => res.send(card))
    .catch(err => next(new InternalServerError(err.message)))
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard,
};
