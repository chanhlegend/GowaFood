// src/components/Header.jsx

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import Logo from "../assets/images/logo.png";

import { CategoryService } from "../services/categoryService";
import { href } from "react-router-dom";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userDropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getAllCategories();
        console.log("Fetched categories:", response);

        // Giả sử API trả { data: [...] }
        const cats = Array.isArray(response)
          ? response
          : response || [];
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
    { name: "Công thức AI", href: "/chat-recipe-ai" },
    { name: "Giới thiệu", href: "/aboutus" },
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
    const checkAuthStatus = () => {
      const userData = localStorage.getItem("user_gowa");
      setIsLoggedIn(!!userData);
    };

    checkAuthStatus();

    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
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
    <header className="sticky top-0 z-50 w-full">
      {/* Top contact bar */}
      <div className="bg-green-900 text-primary-foreground py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm md:text-base">
        <div className="container mx-auto flex items-center justify-center gap-1.5 sm:gap-2">
          <Phone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 " />
          <span className="text-balance text-sm sm:text-base md:text-lg font-medium text-center text-amber-500">
            Chuyên cung cấp sỉ trau củ quả sạch an toàn - Hotline: 0349 544 688
            - 0379 588 499
          </span>
        </div>
      </div>

      {/* Main header */}
      <div
        className={`
          bg-background/95 backdrop-blur-md border-b border-border
          transition-all duration-300 ease-in-out
          ${isScrolled ? "shadow-lg" : "shadow-sm"}
        `}
      >
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-5">
          <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between h-20 sm:h-24 lg:h-28 px-4 sm:px-6 lg:px-10">
              {/* Logo */}
              <a href="/" className="flex items-center gap-3 sm:gap-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
                  <div className="relative bg-green-900 rounded-full p-1.5 sm:p-2 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={Logo}
                      alt="GOWA Logo"
                      className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-green-700 group-hover:text-green-600 transition-colors duration-300 leading-none">
                    GOWA
                  </h1>
                  <span className="text-base sm:text-lg lg:text-xl text-green-800 -mt-0.5 sm:-mt-1">
                    Food
                  </span>
                </div>
              </a>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="
                      relative px-3 py-2 lg:px-6 lg:py-3
                      text-sm lg:text-lg font-semibold text-green-800
                      rounded-lg transition-all duration-300 ease-in-out
                      hover:bg-muted hover:text-green-700 hover:scale-[1.03]
                      focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                      group
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
                  </a>
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
                        onClick={() =>
                          setIsUserDropdownOpen(!isUserDropdownOpen)
                        }
                        className="
                          relative hover:bg-muted hover:scale-110 text-green-800 hover:text-green-700
                          transition-all duration-300 ease-in-out
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
                          <a
                            href="/profile"
                            className="
                              flex items-center gap-3 px-4 py-3 text-sm text-gray-700
                              hover:bg-gray-50 hover:text-green-700
                              transition-colors duration-200
                            "
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <UserCircle className="h-4 w-4" />
                            Hồ sơ cá nhân
                          </a>
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
                              // Cập nhật trạng thái đăng nhập
                              setIsLoggedIn(false);
                              // Chuyển hướng về trang home
                              window.location.href = '/'
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Shopping Cart */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="
                        relative hover:bg-muted hover:scale-110 text-green-800 hover:text-green-700
                        transition-all duration-300 ease-in-out
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
                        0
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
                    onClick={() => {
                      // Chuyển đến trang login
                      window.location.href = "/login";
                    }}
                  >
                    <LogIn className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    <span className="sr-only">Đăng nhập</span>
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
      </div>

      {/* Mobile Menu (slide-in) */}
      <div
        className={`
          fixed inset-0 z-50 transition-opacity duration-300
          ${isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }
        `}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"
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
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  px-4 py-3 text-base sm:text-lg lg:text-xl font-semibold text-green-800
                  rounded-lg transition-all duration-300 ease-in-out
                  hover:bg-muted hover:text-green-700 hover:translate-x-2
                "
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* User Actions for Mobile */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <a
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="
                    flex items-center gap-3 px-4 py-3 text-base font-semibold text-green-800
                    rounded-lg transition-all duration-300 ease-in-out
                    hover:bg-muted hover:text-green-700 hover:translate-x-2
                  "
                >
                  <UserCircle className="h-5 w-5" />
                  Hồ sơ cá nhân
                </a>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    // Xóa dữ liệu user khỏi localStorage
                    localStorage.removeItem('user_gowa')
                    // Cập nhật trạng thái đăng nhập
                    setIsLoggedIn(false)
                    // Chuyển hướng về trang home
                    window.location.href = '/'
                  }}
                  className="
                    flex items-center gap-3 px-4 py-3 text-base font-semibold text-red-600
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
                  setIsMobileMenuOpen(false)
                  window.location.href = '/login'
                }}
                className="
                  flex items-center gap-3 px-4 py-3 text-base font-semibold text-green-800
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
