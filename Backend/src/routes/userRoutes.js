const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');

// Lấy tất cả người dùng (phải đặt trước route /:id để tránh bị đè)
router.get('/getAllUsers', UserController.getAllUsers);

// Lấy thông tin người dùng
router.get('/:id', UserController.getUserInfo);

// Cập nhật thông tin người dùng
router.put('/:id', UserController.updateUserInfo);

// Đổi mật khẩu
router.put('/:id/change-password', UserController.changePassword);

// ===== ADDRESS MANAGEMENT ROUTES =====

// Thêm địa chỉ mới
router.post('/:id/addresses', UserController.addAddress);

// Cập nhật địa chỉ
router.put('/:id/addresses/:addressId', UserController.updateAddress);

// Xóa địa chỉ
router.delete('/:id/addresses/:addressId', UserController.deleteAddress);

// Đặt địa chỉ mặc định
router.put('/:id/addresses/:addressId/default', UserController.setDefaultAddress);

// Thay đổi điểm thưởng
router.put('/:id/reward-points', UserController.updateRewardPoints);

module.exports = router;
