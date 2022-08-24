const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {
  celebrate, Joi, isCelebrateError,
} = require('celebrate');
const { router } = require('./routes/index');
const { login, createUser } = require('./controllers/users');
const { checkToken } = require('./middlewares/auth');

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ minDomainSegments: 2 }),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ minDomainSegments: 2 }),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(/https?:\/\/(www\.)?[-a-zA-Z0-9:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/), // eslint-disable-line
  }),
}), createUser);

app.use(checkToken);

app.use(router);

// eslint ругается на next который н используется в миддлвере, игнорирую
// eslint-disable-next-line
app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    // https://github.com/arb/celebrate/issues/224 - иначе месседж пустой
    let message = '';
    // тут игнорирую генератор, без него сообщение не составить
    // eslint-disable-next-line
    for (const value of err.details.values()) {
      message += `${value.message}; `;
    }
    return res.status(400).send({ message });
  }
  return res.status(err.statusCode).send({ message: err.message });
});

app.listen(3000, () => {
  console.log('Server started!');
});
