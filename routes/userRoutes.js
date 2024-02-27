const express = require('express');
const router = express.Router();
const {
  userRegister,
  userLogin,
  confirmedCode,
  forgotPassword,
  resetPassword,
  resendCode,
} = require('../controllers/userController');

router.post('/register', userRegister);
router.post('/auth/confirmed', confirmedCode);
router.post('/login', userLogin);
router.post('/forgotpassword', forgotPassword);
router.post('/resendcode', resendCode);
router.post('/resetpassword/token=:token', resetPassword);

module.exports = router;
