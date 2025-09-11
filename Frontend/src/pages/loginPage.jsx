import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserService } from "../services/authenService"
import { ROUTE_PATH } from "../constants/routePath"
import { toast } from "sonner"
import "./css/loginPage.css"

const LoginForm = () => {
  const appNavigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("");
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    try {
      const user = await UserService.login({ email, password });
      // Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(user));
  toast.success("Đăng nhập thành công!");
      setTimeout(() => {
        appNavigate(ROUTE_PATH.HOME);
      }, 1500);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    // Handle Google login logic here
    console.log("Google login clicked")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-sm sm:max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-semibold text-green-600 mb-2">Đăng nhập</h1>
          <div className="w-10 sm:w-12 h-0.5 bg-black mx-auto animate-grow"></div>
        </div>

        {/* Form */}
  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <div className="text-red-600 text-center font-medium animate-fade-in mb-2">{error}</div>
          )}
          {/* Email Input */}
          <div className="transition-transform duration-300 hover:scale-105">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-200 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-600 focus:bg-white transition-all duration-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="transition-transform duration-300 hover:scale-105">
            <input
              type="password"
              placeholder="Mật Khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-200 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-600 focus:bg-white transition-all duration-300"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 mt-5 sm:mt-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 active:scale-95 animate-pop disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </button>
        </form>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-3 sm:mt-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          ĐĂNG NHẬP VỚI GOOGLE
        </button>

        {/* Footer Links */}
  <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
          <span className="text-gray-600">Bạn chưa có tài khoản ? </span>
          <button
            type="button"
            className="text-blue-500 hover:text-blue-600 font-medium focus:outline-none bg-transparent border-none p-0"
            onClick={() => appNavigate("/register")}
          >
            Đăng ký ngay
          </button>
          <div className="mt-2">
            <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
              Quên mật khẩu ?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
