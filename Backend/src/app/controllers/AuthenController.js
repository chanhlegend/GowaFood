const User = require("../models/User");
const bcrypt = require("bcrypt");
const mailer = require("../../config/mailer/mailer");
const dotenv = require("dotenv");

// Hàm tạo OTP 6 số
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hàm gửi OTP qua email thực tế
async function sendOtpToEmail(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Mã xác thực OTP GowaFood",
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`
    };
    try {
        await mailer.sendMail(mailOptions);
    } catch (err) {
        console.error("Lỗi gửi email OTP:", err);
    }
}

class AuthenController {
    // Đăng ký tài khoản, gửi OTP
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email đã tồn tại" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const otp = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
            const user = new User({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpires,
            });
            await user.save();
            await sendOtpToEmail(email, otp);
            res.status(201).json({ message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP." });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // Đăng nhập
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Email không tồn tại" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu không đúng" });
            }
            // Nếu có OTP chưa xác thực
            if (user.otp && user.otpExpires > new Date()) {
                return res.status(403).json({ message: "Tài khoản chưa xác thực OTP" });
            }
            // Đăng nhập thành công, trả về user không có password
            const userObj = user.toObject();
            delete userObj.password;
            res.status(200).json({ message: "Đăng nhập thành công", user: userObj });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // Xác thực OTP
    async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Email không tồn tại" });
            }
            if (!user.otp || !user.otpExpires) {
                return res.status(400).json({ message: "Không có OTP để xác thực" });
            }
            if (user.otp !== otp) {
                return res.status(400).json({ message: "OTP không đúng" });
            }
            if (user.otpExpires < new Date()) {
                return res.status(400).json({ message: "OTP đã hết hạn" });
            }
            // Xác thực thành công, xóa OTP
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            res.status(200).json({ message: "Xác thực OTP thành công" });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = new AuthenController();