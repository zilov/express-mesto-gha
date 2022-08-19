const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {
  celebrate, Joi, errors, isCelebrateError
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
    email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ru'] } }),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ minDomainSegments: 2 }),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(checkToken);

app.use(router);

app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    return res.status(400).send({message : err.message})
  }
  res.status(err.statusCode).send({ message: err.message });

});

app.listen(3000, () => {
  console.log('Server started!');
});
