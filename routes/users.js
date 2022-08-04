const router = require('express').Router();
const {
  getUsers, getUser, getCurrentUser, updateUser,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getCurrentUser);
router.get('/users/:id', getUser);
router.patch('/users/me', updateUser);
router.patch('/users/me/avatar', updateUser);

module.exports = router;
