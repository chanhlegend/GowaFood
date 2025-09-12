import { useState } from "react"
import LiquidLoading from "../components/ui/LiquidLoading"
import { useNavigate } from "react-router-dom"
import { UserService } from "../services/authenService"
import "./css/registerPage.css"

export default function SignupForm() {
  const appNavigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      await UserService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      // Chuyển sang trang xác thực OTP, truyền email qua state
      appNavigate("/verify", { state: { email: formData.email } });
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <div className="rounded-[10px] bg-white shadow-[6px_6px_30px_0_rgba(0,0,0,0.25)] p-4 sm:p-8 w-full max-w-sm sm:max-w-md animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-semibold text-green-600 text-center mb-2 animate-fade-in">Tạo tài khoản</h1>
        <div className="w-10 sm:w-12 h-0.5 bg-black mx-auto mb-6 sm:mb-8 animate-grow"></div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <div className="text-red-600 text-center font-medium animate-fade-in mb-2">{error}</div>
          )}
          {/* Full Name Input */}
          <div className="transition-transform duration-300 hover:scale-105">
            <input
              type="text"
              name="fullName"
              placeholder="Họ và Tên"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-md border-0 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-300"
            />
          </div>

          {/* Email Input */}
          <div className="transition-transform duration-300 hover:scale-105">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-md border-0 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-300"
            />
          </div>

          {/* ...existing code... */}

          {/* Password Input */}
          <div className="transition-transform duration-300 hover:scale-105">
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-md border-0 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-300"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="transition-transform duration-300 hover:scale-105">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-md border-0 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 mt-5 sm:mt-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 active:scale-95 animate-pop disabled:opacity-60 text-base sm:text-lg"
            disabled={loading}
          >
            {loading ? <LiquidLoading /> : "ĐĂNG KÝ"}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4 sm:mt-6 animate-fade-in text-xs sm:text-sm">
          <span className="text-gray-600">Bạn đã có tài khoản ? </span>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none bg-transparent border-none p-0"
            onClick={() => appNavigate("/login")}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  )
}
