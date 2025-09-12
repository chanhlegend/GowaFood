// src/components/Header.jsx

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, User, ShoppingCart, Phone, X } from "lucide-react"
import Logo from "../assets/images/logo.png"

const navigationItems = [
  { name: "Trang chủ", href: "#" },
  { name: "Rau Sạch", href: "#" },
  { name: "Củ quả", href: "#" },
  { name: "Nấm Tươi", href: "#" },
  { name: "Healthy", href: "#" },
  { name: "Farm", href: "#" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // lock scroll khi mở menu mobile
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top contact bar */}
      <div className="bg-green-900 text-primary-foreground py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm md:text-base">
        <div className="container mx-auto flex items-center justify-center gap-1.5 sm:gap-2">
          <Phone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 " />
          <span className="text-balance text-sm sm:text-base md:text-lg font-medium text-center text-amber-500">
            Chuyên cung cấp sỉ trau củ quả sạch an toàn - Hotline: 0349 544 688 - 0379 588 499
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
                {/* User Account */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                    relative hover:bg-muted hover:scale-110 text-green-800 hover:text-green-700
                    transition-all duration-300 ease-in-out
                    focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                  "
                >
                  <User className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                  <span className="sr-only">Tài khoản</span>
                </Button>

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
          ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
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
              <h2 className="text-lg sm:text-xl font-bold text-green-700">GOWA Food</h2>
              <p className="text-sm sm:text-base text-green-800">Thực phẩm sạch</p>
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
        </div>
      </div>
    </header>
  )
}

export default Header
