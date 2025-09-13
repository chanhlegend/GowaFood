
import { useLocation, useNavigate } from "react-router-dom";

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
    path: "/profile/orders",
  },
];

const ProfileSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      {/* Profile Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
          <img src="/red-cartoon-character-avatar.jpg" alt="Avatar" className="w-16 h-16 rounded-full" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Nguyễn Minh</h3>
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
                "px-4 py-3 rounded-lg"
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
  );
};

export default ProfileSidebar;
