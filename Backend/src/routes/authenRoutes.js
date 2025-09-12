const express = require('express');
const router = express.Router();
const AuthenController = require('../app/controllers/AuthenController');

const jwt = require('jsonwebtoken');
const User = require('../app/models/User');

// Middleware xác thực JWT
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return res.sendStatus(401);
	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}

// Đăng ký
router.post('/register', AuthenController.register);

// Đăng nhập
router.post('/login', AuthenController.login);

// Xác thực OTP
router.post('/verify-otp', AuthenController.verifyOtp);

// Lấy thông tin user từ token (dùng cho Google OAuth và các luồng khác)
router.get('/me', authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json({ user });
	} catch (err) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;
