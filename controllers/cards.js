const mongoose = require('mongoose');
const Cards = require('../models/card');

const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  ForbiddenError,
} = require('./errors');

const getCards = (req, res, next) => Cards.find({})
  .then((cards) => res.send(cards))
  .catch((err) => next(new InternalServerError(err.message)));

const createCard = (req, res, next) => {
  req.body.owner = req.user._id;
  return Cards.create(req.body)
    .then((card) => res.send(card))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(`Validation error: ${err.message}`));
      }
      return next(new InternalServerError(err.message));
    });
};

const deleteCard = (req, res, next) => Cards.findById(req.params.id)
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Card was already deleted or not exists');
    }
    // eslint-disable-next-line
    if (req.user._id != card.owner._id) {
      throw new ForbiddenError('Cannot delete card of other users');
    }
    return Cards.findByIdAndDelete(req.params.id);
  })
  .then(() => res.send({ message: 'Card was successfully deleted' }))
  .catch((err) => {
    if (err instanceof mongoose.Error.CastError) {
      return next(new BadRequestError(`Id is not valid ${err.message}`));
    } if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return next(err);
    }
    return next(new InternalServerError(err.message));
  });

const likeCard = (req, res, next) => Cards.findByIdAndUpdate(
  req.params.id,
  { $push: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Card ID is not found');
    }
    return res.send(card);
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.CastError) {
      return next(new BadRequestError(`ID is not valid: ${err.message}`));
    } if (err instanceof NotFoundError) {
      return next(err);
    }
    return next(new InternalServerError(err.message));
  });

const unlikeCard = (req, res, next) => Cards.findByIdAndUpdate(
  req.params.id,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Card ID is not found');
    }
    return res.send(card);
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.CastError) {
      return next(new BadRequestError(`ID is not valid: ${err.message}`));
    } if (err instanceof NotFoundError) {
      return next(err);
    }
    return next(new InternalServerError(err.message));
  });

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard,
};
