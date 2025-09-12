const express = require('express');
const router = express.Router();

const passport = require('../config/passport/passport-config');
const jwt = require('jsonwebtoken');

// Google OAuth: Bắt đầu xác thực
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth: Callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login', session: false }),
    (req, res) => {
        // Tạo JWT cho user
        const user = req.user;
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // Redirect về frontend kèm token (hoặc có thể trả về JSON nếu là API thuần)
        const redirectUrl = `${process.env.FRONTEND_URL}/login?token=${token}`;
        res.redirect(redirectUrl);
    }
);

module.exports = router;
