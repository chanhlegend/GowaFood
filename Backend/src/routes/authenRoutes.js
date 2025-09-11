const express = require('express');
const router = express.Router();
const AuthenController = require('../app/controllers/AuthenController');

// Đăng ký
router.post('/register', AuthenController.register);

// Đăng nhập
router.post('/login', AuthenController.login);

// Xác thực OTP
router.post('/verify-otp', AuthenController.verifyOtp);

module.exports = router;
