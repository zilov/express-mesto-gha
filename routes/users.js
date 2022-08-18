const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUser, getCurrentUser, updateUser,
} = require('../controllers/users');
const { UserSchema } = require('../models/user');

router.get('/users', getUsers);
router.get('/users/me', getCurrentUser);
router.get('/users/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  })
}), getUser);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  })
}), updateUser);
router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
  })
}), updateUser);

module.exports = router;
