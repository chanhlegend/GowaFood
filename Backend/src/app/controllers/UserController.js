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

    // Thêm địa chỉ mới
    async addAddress(req, res) {
        try {
            const userId = req.params.id;
            const addressData = req.body;
            
            console.log('Adding address for user:', userId);
            console.log('Address data:', addressData);
            
            // Validate dữ liệu đầu vào
            const { name, phone, address, ward, city } = addressData;
            if (!name || !phone || !address || !ward || !city) {
                return res.status(400).json({ 
                    message: 'Vui lòng nhập đầy đủ thông tin địa chỉ' 
                });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            // Nếu đây là địa chỉ đầu tiên hoặc được đặt làm mặc định, 
            // thì đặt làm mặc định và bỏ mặc định của các địa chỉ khác
            if (addressData.isDefault || user.addresses.length === 0) {
                // Bỏ mặc định của tất cả địa chỉ hiện tại
                user.addresses.forEach(addr => {
                    addr.isDefault = false;
                });
                addressData.isDefault = true;
            } else {
                // Đảm bảo isDefault là false nếu không được đặt
                addressData.isDefault = false;
            }

            // Thêm địa chỉ mới
            user.addresses.push(addressData);
            await user.save();

            console.log('Address added successfully. New address:', user.addresses[user.addresses.length - 1]);

            res.status(201).json({ 
                message: 'Thêm địa chỉ thành công',
                address: user.addresses[user.addresses.length - 1]
            });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    // Cập nhật địa chỉ
    async updateAddress(req, res) {
        try {
            const userId = req.params.id;
            const addressId = req.params.addressId;
            const updateData = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            // Tìm địa chỉ cần cập nhật
            const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
            if (addressIndex === -1) {
                return res.status(404).json({ message: 'Địa chỉ không tồn tại' });
            }

            // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
            if (updateData.isDefault) {
                user.addresses.forEach((addr, index) => {
                    if (index !== addressIndex) {
                        addr.isDefault = false;
                    }
                });
            }

            // Cập nhật địa chỉ
            Object.assign(user.addresses[addressIndex], updateData);
            await user.save();

            res.status(200).json({ 
                message: 'Cập nhật địa chỉ thành công',
                address: user.addresses[addressIndex]
            });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    // Xóa địa chỉ
    async deleteAddress(req, res) {
        try {
            const userId = req.params.id;
            const addressId = req.params.addressId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            // Tìm địa chỉ cần xóa
            const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
            if (addressIndex === -1) {
                return res.status(404).json({ message: 'Địa chỉ không tồn tại' });
            }

            const deletedAddress = user.addresses[addressIndex];
            const wasDefault = deletedAddress.isDefault;

            // Xóa địa chỉ
            user.addresses.splice(addressIndex, 1);

            // Nếu địa chỉ bị xóa là mặc định và còn địa chỉ khác, 
            // đặt địa chỉ đầu tiên làm mặc định
            if (wasDefault && user.addresses.length > 0) {
                user.addresses[0].isDefault = true;
            }

            await user.save();

            res.status(200).json({ 
                message: 'Xóa địa chỉ thành công',
                addresses: user.addresses
            });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    // Đặt địa chỉ mặc định
    async setDefaultAddress(req, res) {
        try {
            const userId = req.params.id;
            const addressId = req.params.addressId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            // Tìm địa chỉ cần đặt làm mặc định
            const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
            if (addressIndex === -1) {
                return res.status(404).json({ message: 'Địa chỉ không tồn tại' });
            }

            // Bỏ mặc định của tất cả địa chỉ
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });

            // Đặt địa chỉ được chọn làm mặc định
            user.addresses[addressIndex].isDefault = true;
            await user.save();

            res.status(200).json({ 
                message: 'Đặt địa chỉ mặc định thành công',
                address: user.addresses[addressIndex]
            });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }
}
module.exports = new UserController();