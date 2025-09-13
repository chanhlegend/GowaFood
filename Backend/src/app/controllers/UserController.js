const User = require('../models/User');
const bcrypt = require('bcrypt');

class UserController {
    // Lấy thông tin người dùng
    async getUserInfo(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
}

    // Cập nhật thông tin người dùng
    async updateUserInfo(req, res) {
        try {
            const userId = req.params.id;
            const updates = req.body;
            const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    // Đổi mật khẩu
    async changePassword(req, res) {
        try {
            const userId = req.params.id;
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' });
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            // Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
            }
            // Băm mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
            await user.save();
            res.status(200).json({ message: 'Đổi mật khẩu thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }
}
module.exports = new UserController();