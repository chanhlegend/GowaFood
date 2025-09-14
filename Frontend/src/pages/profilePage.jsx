import { useState, useEffect } from "react"
import { Edit2, Save, X } from "lucide-react"
import { UserService } from "../services/userService"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const UserProfile = () => {
  const [User, setUser] = useState(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const userId = JSON.parse(localStorage.getItem("user_gowa"))?._id

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await UserService.getUserInfo(userId)
        setUser(userData)
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }
    fetchUser()
  }, [userId])

  const handleEditName = () => {
    setIsEditingName(true)
    setNewName(User?.name || "")
  }

  const handleSaveName = async () => {
    try {
      await UserService.updateUserInfo(userId, { name: newName })
      setUser({ ...User, name: newName })
      // cập nhật localStorage
      const currentUser = JSON.parse(localStorage.getItem("user_gowa")) || {}
      currentUser.name = newName
      localStorage.setItem("user_gowa", JSON.stringify(currentUser))
      setIsEditingName(false)
    } catch (error) {
      console.error("Failed to update name:", error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
  }

  const handleEditPassword = () => {
    setIsModalOpen(true)
  }

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp!")
      return
    }
    try {
      await UserService.changePassword(userId, {
        oldPassword: currentPassword,
        newPassword
      })
      toast.success("Đổi mật khẩu thành công!")
      setIsModalOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Failed to change password:", error)
      toast.error("Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.")
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="bg-gray-50 px-3 py-4 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                THÔNG TIN TÀI KHOẢN
              </h1>
            </div>

            {/* Account Information Form */}
            <div className="space-y-6 sm:space-y-6 w-full max-w-2xl">
              {/* Full Name */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
                <label className="w-full sm:w-32 text-gray-700 font-medium text-base sm:text-base">Họ tên:</label>
                <div className="flex-1 flex items-center justify-between">
                  {isEditingName ? (
                    <div className="flex items-center space-x-3 w-full">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập họ tên"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="text-green-600 hover:text-green-800 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-800 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-800 text-base flex-1">
                        {User?.name || "Loading..."}
                      </span>
                      <button
                        onClick={handleEditName}
                        className="text-gray-400 hover:text-gray-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
                <label className="w-full sm:w-32 text-gray-700 font-medium text-base sm:text-base">Email:</label>
                <span className="text-gray-800 text-base break-all">{User?.email || "Loading..."}</span>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
                <label className="w-full sm:w-32 text-gray-700 font-medium text-base sm:text-base">Mật khẩu:</label>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-gray-800 text-base">•••••••</span>
                  <button
                    onClick={handleEditPassword}
                    className="text-gray-400 hover:text-gray-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Expandable Password Change Form */}
              <AnimatePresence>
                {isModalOpen && (
                  <motion.div
                    className="bg-gray-50 rounded-lg p-5 sm:p-6 border border-gray-200"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Đổi mật khẩu</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập mật khẩu hiện tại"
                          autoComplete="current-password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập mật khẩu mới"
                          autoComplete="new-password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Xác nhận mật khẩu mới"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-end sm:gap-3">
                        <button
                          onClick={handleCloseModal}
                          className="px-6 py-3 text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 min-h-[48px] order-2 sm:order-1"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSavePassword}
                          className="px-6 py-3 text-base text-white rounded-lg transition-colors duration-200 min-h-[48px] order-1 sm:order-2"
                          style={{ backgroundColor: '#228B22' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#1e7e1e'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#228B22'}
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
