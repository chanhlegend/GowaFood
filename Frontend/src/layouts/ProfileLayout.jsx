import { useState, useEffect } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import ProfileSidebar from "../components/ProfileSidebar"
import { Menu } from "lucide-react"

export default function ProfileLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Lock scroll khi mở sidebar mobile (giống Header)
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [sidebarOpen])

  // Đóng sidebar khi resize về desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={toggleSidebar}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
        >
          <Menu className="w-6 h-6" />
          <span className="font-medium">Menu</span>
        </button>
      </div>

      {/* Main content with sidebar */}
      <main className="flex-1 container mx-auto px-4 py-8 flex">
        {/* Sidebar */}
        <ProfileSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        {/* Page Content */}
        <div className="flex-1 p-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
