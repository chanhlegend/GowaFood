
import { useLocation, useNavigate } from "react-router-dom";
import { X, Camera, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { uploadImageToCloudinary } from "../lib/cloudinary";
import { UserService } from "../services/userService";

const menuItems = [
  {
    label: "• Thông tin tài khoản",
    path: "/profile",
  },
  {
    label: "• Danh sách địa chỉ",
    path: "/address-manage",
  },
  {
    label: "• Đơn hàng của bạn",
    path: "/orders",
  },
];

const ProfileSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const getUserData = () => {
      const userData = localStorage.getItem('user_gowa');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    getUserData();
  }, []);

  const handleItemClick = (path) => {
    navigate(path);
    // Đóng sidebar trên mobile sau khi chọn menu
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleAvatarClick = () => {
    setShowUploadModal(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      
      // Update user avatar in backend
      await UserService.updateUserInfo(user._id, { avatar: imageUrl });
      
      // Update localStorage
      const updatedUser = { ...user, avatar: imageUrl };
      localStorage.setItem('user_gowa', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Cập nhật avatar thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar (drawer style like Header) */}
      <div
        className={`
          fixed inset-0 z-50 transition-opacity duration-300 md:hidden
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden={!isOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Drawer */}
        <div
          className={`
            absolute top-0 left-0 h-full
            w-72 sm:w-80
            bg-white shadow-xl p-5 sm:p-6
            transition-transform duration-300 will-change-transform
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-black"
            aria-label="Đóng menu"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Profile Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-green-500 flex items-center justify-center relative cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" 
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg sm:text-xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              {/* Camera overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              {user?.name || 'Loading...'}
            </h3>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col gap-2 sm:gap-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.path}
                  className={
                    (isActive
                      ? "bg-green-100 text-green-700 font-medium "
                      : "text-gray-600 hover:bg-gray-50 cursor-pointer ") +
                    "px-4 py-3 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 ease-in-out hover:translate-x-2"
                  }
                  onClick={() => !isActive && handleItemClick(item.path)}
                  style={{ userSelect: "none" }}
                >
                  {item.label}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r border-gray-200 p-6">
        {/* Profile Section */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center relative cursor-pointer group"
            onClick={handleAvatarClick}
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full object-cover" 
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            {/* Camera overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {user?.name || 'Loading...'}
          </h3>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                className={
                  (isActive
                    ? "bg-green-100 text-green-700 font-medium "
                    : "text-gray-600 hover:bg-gray-50 cursor-pointer ") +
                  "px-4 py-3 rounded-lg transition-colors duration-200"
                }
                onClick={() => !isActive && navigate(item.path)}
                style={{ userSelect: "none" }}
              >
                {item.label}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Upload Avatar Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 transition-opacity duration-300">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={() => setShowUploadModal(false)}
          />
          
          {/* Modal */}
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Cập nhật ảnh đại diện
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Chọn ảnh để cập nhật ảnh đại diện của bạn
                </p>
                
                {/* File Input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="avatar-upload" 
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploading ? (
                      <>
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-600">Đang tải lên...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-2">Nhấp để chọn ảnh</p>
                        <p className="text-sm text-gray-500">JPG, PNG, GIF (tối đa 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[48px]"
                  disabled={uploading}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSidebar;
