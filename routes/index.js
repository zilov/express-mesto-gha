const router = require('express').Router();
const mongoose = require('mongoose');
const userRouter = require('./users');
const cardsRouter = require('./cards');

router.get('/', (req, res) => {
  res.send(`Main page. DB status: ${mongoose.connection.readyState}`);
});

router.use('/', userRouter);
router.use('/', cardsRouter);

router.use((req, res) => {
  res.status(404).send({ message: '404: Page not found!' });
});

module.exports = { router };
