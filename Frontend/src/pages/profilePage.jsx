import { useState, useEffect } from "react"
import { Edit2, Save, X } from "lucide-react"
import { UserService } from "../services/userService"
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
    <div className="p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                THÔNG TIN TÀI KHOẢN
              </h1>
            </div>

            {/* Account Information Form */}
            <div className="space-y-6 max-w-2xl">
              {/* Full Name */}
              <div className="flex items-center">
                <label className="w-32 text-gray-700 font-medium">Họ tên:</label>
                <div className="flex-1 flex items-center justify-between">
                  {isEditingName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded"
                      />
                      <button
                        onClick={handleSaveName}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-800">
                        {User?.name || "Loading..."}
                      </span>
                      <Edit2
                        className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                        onClick={handleEditName}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center">
                <label className="w-32 text-gray-700 font-medium">Email:</label>
                <span className="text-gray-800">{User?.email || "Loading..."}</span>
              </div>

              {/* Password */}
              <div className="flex items-center">
                <label className="w-32 text-gray-700 font-medium">Mật khẩu:</label>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-gray-800">•••••••</span>
                  <Edit2
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={handleEditPassword}
                  />
                </div>
              </div>

              {/* Expandable Password Change Form */}
              <AnimatePresence>
                {isModalOpen && (
                  <motion.div
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Đổi mật khẩu</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập mật khẩu mới"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Xác nhận mật khẩu mới"
                        />
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={handleCloseModal}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSavePassword}
                          className="px-4 py-2 text-white rounded-md transition-colors duration-200"
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
