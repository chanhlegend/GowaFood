import { useState, useRef } from "react"
import LiquidLoading from "../components/ui/LiquidLoading"
import { useLocation, useNavigate } from "react-router-dom"
import { UserService } from "../services/authenService"
import "./css/verifyOTPPage.css"

const EmailVerification = () => {
  const [codes, setCodes] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef([])
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || "";

  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCodes = [...codes]
      newCodes[index] = value
      setCodes(newCodes)

      // Auto focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    setError("");
    setSuccess("");
    const verificationCode = codes.join("");
    if (!email) {
      setError("Không tìm thấy email để xác thực. Vui lòng đăng ký lại.");
      return;
    }
    if (verificationCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }
    setLoading(true);
    try {
      await UserService.verifyOtp({ email, otp: verificationCode });
      setSuccess("Xác thực thành công! Bạn có thể đăng nhập.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoBack = () => {
    navigate(-1);
  }

  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <div className="rounded-[10px] bg-white shadow-[6px_6px_30px_0_rgba(0,0,0,0.25)] p-4 sm:p-8 w-full max-w-sm sm:max-w-md animate-fade-in-up">
        {error && (
          <div className="text-red-600 text-center font-medium animate-fade-in mb-2">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-center font-medium animate-fade-in mb-2">{success}</div>
        )}
        {/* Title */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-semibold text-green-600 mb-2">Xác thực email</h1>
          <div className="w-10 sm:w-12 h-0.5 bg-gray-800 mx-auto animate-grow"></div>
          <p className="mt-3 sm:mt-4 text-gray-700 text-xs sm:text-sm">Chúng tôi đã gửi mã OTP đến email của bạn, mã có hiệu lực trong vòng 10p.</p>
        </div>

        {/* Code Input Boxes */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {codes.map((code, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={code}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg text-center text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors animate-pop"
              maxLength={1}
            />
          ))}
        </div>

        {/* Verify Button */}
        <div className="text-center mb-4 sm:mb-6">
          <button
            onClick={handleVerify}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 animate-pop disabled:opacity-60 text-base sm:text-lg flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <LiquidLoading /> : "XÁC THỰC"}
          </button>
        </div>

        {/* Go Back Link */}
        <div className="text-center animate-fade-in">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <span>←</span>
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
