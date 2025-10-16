"use client"


import Header from "../components/Header"
import Footer from "../components/Footer"
import ChatFloatingButton from "../components/ChatFloatingButton"

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Floating Chat Button */}
      <ChatFloatingButton />

      {/* Footer */}
      <Footer />
    </div>
  )
}
