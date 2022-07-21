const router = require('express').Router();
const {
  getUsers, getUser, createUser, updateUser,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.post('/users', createUser);
router.patch('/users/me', updateUser);
router.patch('/users/me/avatar', updateUser);

module.exports = router;
