// src/components/Header.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  User,
  ShoppingCart,
  Phone,
  X,
  LogOut,
  UserCircle,
  LogIn,
  ClipboardList,
} from "lucide-react";
import Logo from "../assets/images/logo.png";

import { CategoryService } from "../services/categoryService";
import { CartService } from "../services/cartService";

export function Header() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const userDropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getAllCategories();

        // Giả sử API trả { data: [...] }
        const cats = Array.isArray(response) ? response : response || [];
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]); // fallback mảng rỗng
      }
    };

    fetchCategories();
  }, []);

  const navigationItems = [
    { name: "Trang chủ", href: "/" },
    ...(Array.isArray(categories)
      ? categories.map((cat) => ({
          name: cat.name,
          href: `/food-by-category/${cat._id}`,
        }))
      : []),
    { name: "Công thức nấu ăn", href: "/chat-recipe-ai" },
    // { name: "Giới thiệu", href: "/aboutus" },
  ];

  // lock scroll khi mở menu mobile
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Kiểm tra trạng thái đăng nhập từ localStorage
  useEffect(() => {
    const checkAuthStatus = async () => {
      const userData = localStorage.getItem("user_gowa");
      setIsLoggedIn(!!userData);

      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log("user from localStorage:", user._id);

          const itemCount = await CartService.getItemCount(user._id);
          setCartItemCount(itemCount || 0);
        } catch (error) {
          console.error("Failed to parse user data:", error);
        }
      } else {
        // Reset cart count khi đăng xuất
        setCartItemCount(0);
      }
    };

    checkAuthStatus();

    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi từ tab khác
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    // Lắng nghe custom event để cập nhật khi đăng nhập/đăng xuất trong cùng tab
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <header className="sticky top-0 z-1050 w-full">
      {/* Main header */}
      <div
        className={`
          bg-background/95 backdrop-blur-md 
          transition-all duration-300 ease-in-out rounded-b-3xl
          ${isScrolled ? "shadow-lg" : "shadow-sm"}
        `}
      >
        <div className="bg-background/80 backdrop-blur-sm rounded-b-3xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between h-20 sm:h-20 lg:h-20 px-4 sm:px-6 lg:px-10">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 sm:gap-4 group cursor-pointer"
            >
              <div className="relative">
                <div className="absolute inset-0 border border-custom-green rounded-full transition-all duration-300" />
                <div className="relative rounded-full p-1.5 sm:p-2 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={Logo}
                    alt="GOWA Logo"
                    className="h-12 w-12 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-serif sm:text-2xl lg:text-3xl font-extrabold text-custom-green group-hover:text-green-600 transition-colors duration-300 leading-none">
                  GOWA
                </h1>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className="
                      relative px-3 py-2 lg:px-6 lg:py-3
                      text-sm lg:text-[18px] font-semibold text-green-800
                      rounded-lg transition-all duration-300 ease-in-out
                      hover:bg-muted hover:text-green-700 hover:scale-[1.03]
                      focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                      group cursor-pointer
                    "
                >
                  <span className="relative z-10">{item.name}</span>
                  <div
                    className="
                        absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-700/10 
                        rounded-lg opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300 ease-in-out
                      "
                  />
                </button>
              ))}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {isLoggedIn ? (
                <>
                  {/* User Account Dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="
                          relative hover:bg-muted hover:scale-110 text-green-800 hover:text-green-700
                          transition-all duration-300 ease-in-out cursor-pointer
                          focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                        "
                    >
                      <User className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                      <span className="sr-only">Tài khoản</span>
                    </Button>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <div
                        className="
                          absolute right-0 top-full mt-2 w-48
                          bg-white border border-gray-200 rounded-lg shadow-lg
                          py-2 z-50
                          animate-in slide-in-from-top-2 duration-200
                        "
                      >
                        <button
                          className="
                              w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700
                              hover:bg-gray-50 hover:text-green-700
                              transition-colors duration-200
                            "
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            navigate("/profile");
                          }}
                        >
                          <UserCircle className="h-4 w-4" />
                          Hồ sơ cá nhân
                        </button>
                        <button
                          className="
                           w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700
                           hover:bg-gray-50 hover:text-green-700
                            transition-colors duration-200  "
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            navigate("/orders");
                          }}
                        >
                          <ClipboardList className="h-4 w-4" />
                          Theo dõi đơn hàng
                        </button>
                        <button
                          className="
                              w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700
                              hover:bg-gray-50 hover:text-red-600
                              transition-colors duration-200
                            "
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            // Xóa dữ liệu user khỏi localStorage
                            localStorage.removeItem("user_gowa");
                            localStorage.removeItem("token_gowa");
                            // Trigger custom event để cập nhật UI
                            window.dispatchEvent(new Event("authChange"));
                            // Cập nhật trạng thái đăng nhập
                            setIsLoggedIn(false);
                            setCartItemCount(0);
                            // Chuyển hướng về trang home
                            navigate("/");
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => navigate("/orders")}
                    variant="ghost"
                    size="icon"
                    className="
    relative hover:bg-muted hover:scale-110 text-green-800 hover:text-green-700
    transition-all duration-300 ease-in-out cursor-pointer
    focus:ring-2 focus:ring-green-600 focus:ring-offset-2
  "
                    title="Theo dõi đơn hàng"
                  >
                    <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    <span className="sr-only">Theo dõi đơn hàng</span>
                  </Button>
                  {/* Shopping Cart */}
                  <Button
                    onClick={() => navigate("/cart")}
                    variant="ghost"
                    size="icon"
                    className="
                        relative hover:bg-muted hover:scale-110 text-green-800 hover:text-green-700
                        transition-all duration-300 ease-in-out cursor-pointer
                        focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                      "
                  >
                    <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    <div
                      className="
                          absolute -top-2 -right-2 bg-green-700 text-white
                          text-[10px] sm:text-xs rounded-full
                          h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center
                          animate-pulse
                        "
                    >
                      {cartItemCount}
                    </div>
                    <span className="sr-only">Giỏ hàng</span>
                  </Button>
                </>
              ) : (
                /* Login Icon */
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                      relative hover:bg-muted hover:scale-110 text-green-800 hover:text-green-700
                      transition-all duration-300 ease-in-out
                      focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                    "
                  onClick={() => navigate("/login")}
                >
                  <span className="mr-15 px-3 py-2 bg-custom-green/20 rounded-xl hover:bg-custom-green/30  cursor-pointer text-center ">Đăng nhập</span>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden hover:bg-muted hover:scale-110 text-green-800 hover:text-green-700 transition-all duration-300 ease-in-out"
                aria-label="Mở menu"
              >
                <Menu className="h-7 w-7 sm:h-8 sm:w-8" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu (slide-in) */}
      <div
        className={`
          fixed inset-0 z-50 transition-opacity duration-300
          ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`
            absolute top-0 right-0 h-full
            w-72 sm:w-80 md:w-96
            bg-white shadow-xl p-5 sm:p-6
            transition-transform duration-300 will-change-transform
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-black"
            aria-label="Đóng menu"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Logo & Title */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={Logo}
              alt="GOWA Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-green-700">
                GOWA Food
              </h2>
              <p className="text-sm sm:text-base text-green-800">
                Thực phẩm sạch
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 sm:gap-3">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(item.href);
                }}
                className="
                  w-full text-left px-4 py-3 text-base sm:text-lg lg:text-xl font-semibold text-green-800
                  rounded-lg transition-all duration-300 ease-in-out
                  hover:bg-muted hover:text-green-700 hover:translate-x-2
                "
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Actions for Mobile */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="
                    w-full flex items-center gap-3 px-4 py-3 text-base font-semibold text-green-800
                    rounded-lg transition-all duration-300 ease-in-out
                    hover:bg-muted hover:text-green-700 hover:translate-x-2
                  "
                >
                  <UserCircle className="h-5 w-5" />
                  Hồ sơ cá nhân
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/orders");
                  }}
                  className="
    w-full flex items-center gap-3 px-4 py-3 text-base font-semibold text-green-800
    rounded-lg transition-all duration-300 ease-in-out
    hover:bg-muted hover:text-green-700 hover:translate-x-2
  "
                >
                  <ClipboardList className="h-5 w-5" />
                  Theo dõi đơn hàng
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    // Xóa dữ liệu user khỏi localStorage
                    localStorage.removeItem("user_gowa");
                    localStorage.removeItem("token_gowa");
                    // Trigger custom event để cập nhật UI
                    window.dispatchEvent(new Event("authChange"));
                    // Cập nhật trạng thái đăng nhập
                    setIsLoggedIn(false);
                    setCartItemCount(0);
                    // Chuyển hướng về trang home
                    navigate("/");
                  }}
                  className="
                    w-full flex items-center gap-3 px-4 py-3 text-base font-semibold text-red-600
                    rounded-lg transition-all duration-300 ease-in-out
                    hover:bg-red-50 hover:translate-x-2
                  "
                >
                  <LogOut className="h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="
                  w-full flex items-center gap-3 px-4 py-3 text-base font-semibold text-green-800
                  rounded-lg transition-all duration-300 ease-in-out
                  hover:bg-muted hover:text-green-700 hover:translate-x-2
                "
              >
                <LogIn className="h-5 w-5" />
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
