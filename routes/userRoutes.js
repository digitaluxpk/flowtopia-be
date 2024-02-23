const express = require('express');
const router = express.Router();
const {
  userRegister,
  userLogin,
  confirmedCode,
} = require('../controllers/userController');

router.post('/register', userRegister);
router.post('/auth/confirmed', confirmedCode);
router.post('/login', userLogin);

module.exports = router;
