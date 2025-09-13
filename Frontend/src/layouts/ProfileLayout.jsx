"use client"

import Header from "../components/Header"
import Footer from "../components/Footer"
import ProfileSidebar from "../components/ProfileSidebar"

export default function ProfileLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main content with sidebar */}
      <main className="flex-1 container mx-auto px-4 py-8 flex">
        {/* Sidebar */}
        <ProfileSidebar />
        {/* Page Content */}
        <div className="flex-1 p-4">{children}</div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
