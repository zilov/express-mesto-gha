const mongoose = require('mongoose');
const Cards = require('../models/card');
const Users = require('../models/user');

const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  ForbiddenError,
} = require('./errors');

const getCards = (req, res, next) => Cards.find({})
  .then((cards) => {
    if (!cards) {
      next(new BadRequestError('Cannot get cards list!'));
    }
    return res.send(cards);
  })
  .catch((err) => next(new InternalServerError(err.message)));

const createCard = (req, res, next) => Users.findById(req.user._id)
  .then((user) => {
    if (!user) {
      next(new NotFoundError('Cannot find current user to create card'));
    }
    req.body.owner = user;
    return Cards.create(req.body)
      .then((card) => res.send(card))
      .catch((err) => next(new BadRequestError(err.message)));
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError(`Validation error: ${err.message}`));
    }
    next(new InternalServerError(err.message));
  });

const deleteCard = (req, res, next) => Cards.findById(req.params.id)
  .then((card) => {
    if (!card) {
      next(new NotFoundError('Card was already deleted or not exists'));
    }
    if (req.user._id !== card.owner._id) {
      next(new ForbiddenError('Cannot delete card of other users'));
    }
    return Cards.findByIdAndDelete(req.params.id);
  })
  .then(() => res.send({ message: 'Card was successfully deleted' }))
  .catch((err) => {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError(`Validation error: ${err.message}`));
    }
    next(new InternalServerError(err.message));
  });

const likeCard = (req, res, next) => Cards.findByIdAndUpdate(
  req.params.id,
  { $push: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      next(new NotFoundError('Card ID is not found'));
    }
    return res.send(card);
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError(`Validation error: ${err.message}`));
    }
    next(new InternalServerError(err.message));
  });

const unlikeCard = (req, res, next) => Cards.findByIdAndUpdate(
  req.params.id,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      next(new NotFoundError('Card ID is not found'));
    }
    return res.send(card);
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError(`Validation error: ${err.message}`));
    }
    next(new InternalServerError(err.message));
  });

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard,
};
