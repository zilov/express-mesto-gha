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
  InternalServerError
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
    return res.send({ message: 'Card was successfully deleted' });
  })
    .catch(err => next(new InternalServerError(err.message)))
};

const likeCard = (req, res, next) => {
  Users.findById(req.user._id, (err, user) => {
    if (err) {
      next(new NotFoundError(`Cannot find user: ${err.message}`))
    }
    Cards.findByIdAndUpdate(
      req.params.id,
      { $push: { likes: user } },
      { new: true },
      (cardsErr, card) => {
        if (cardsErr) {
          next(new BadRequestError(cardsErr.message))
        }
        if (!card) {
          next(new NotFoundError('Card ID is not found'))
        }
        return res.send(card);
      },
    );
  })
    .catch(err => next(new InternalServerError(err.message)));
};

const unlikeCard = (req, res, next) => {
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
        next(new BadRequestError(cardsErr.message))
      }
      if (!card) {
        next(new NotFoundError('Card ID is not found'))
      }
      return res.send(card);
    },
  )
    .catch(err => next(new InternalServerError(err.message)))
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard,
};
