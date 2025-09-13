const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');

// Lấy thông tin người dùng
router.get('/:id', UserController.getUserInfo);

// Cập nhật thông tin người dùng
router.put('/:id', UserController.updateUserInfo);

// Đổi mật khẩu
router.put('/:id/change-password', UserController.changePassword);

module.exports = router;
