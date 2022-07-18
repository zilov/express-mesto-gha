const router = require('express').Router();
const { getCards, createCard, deleteCard, likeCard, unlikeCard } = require('../controllers/cards');

router.get('/cards', getCards);
router.post('/cards', createCard);
router.delete('/cards/:id', deleteCard);
router.put('/cards/:id/likes', likeCard);
router.delete('/cards/:id/likes', unlikeCard);

module.exports = router;