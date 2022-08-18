const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minLength: 2,
    maxLength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь океанов',
    minLength: 2,
    maxLength: 30,
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Email is not valid'],
    minLength: 2,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
});

module.exports = mongoose.model('user', userSchema);
