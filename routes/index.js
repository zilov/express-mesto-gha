const router = require('express').Router();
const userRouter = require('./users');
const cardsRouter = require('./cards');
const mongoose = require('mongoose');

router.get('/', (req, res) => {
  res.send(`Main page. DB status: ${mongoose.connection.readyState}`);
});

router.use('/', userRouter);
router.use('/', cardsRouter);

router.get((req, res) => {
  res.status(404).send({ message : '404: Page not found!'})
})

module.exports = router;