import { useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from "react-router-dom";
import ChatFloatingButton from '../components/ChatFloatingButton';
import {
    LogOut,
} from "lucide-react";
// Simple sidebar placeholder (could be expanded later)
function AdminSidebar() {
    const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);


    return (
        <aside className="w-64   bg-indigo-50 text-green-800 p-4 space-y-4 hidden lg:flex flex-col">
            <h2 className="text-lg font-bold">Quản trị</h2>
            <nav className="flex flex-col gap-2 text-sm">
                <a href="/admin-dashboard" className="hover:text-green-300 transition-colors">Phân tích</a>
                <a href="/create-product" className="hover:text-green-300 transition-colors">Tạo sản phẩm</a>
                <button
                    className="
                              w-full flex items-center gap-2 xs:gap-3 px-3 py-2 xs:px-4 xs:py-3 text-xs xs:text-sm text-gray-700
                              hover:bg-gray-50 hover:text-red-600
                              transition-colors duration-200
                            "
                    onClick={() => {
                        localStorage.removeItem("user_gowa");
                        localStorage.removeItem("token_gowa");
                        
                        window.dispatchEvent(new Event("authChange"));
                        setIsLoggedIn(false);
                        setCartItemCount(0);
                        navigate("/");
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                </button>
            </nav>
            <div className="mt-auto text-xs opacity-60">Gowa Admin</div>
        </aside>
    );
}

export default function AdminLayout({ children }) {
    const currentUser = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user_gowa')); } catch { return null; }
    }, []);
    const isAdmin = useMemo(() => {
        const roleLike = currentUser?.role ?? currentUser?.roles ?? currentUser?.isAdmin;
        if (typeof roleLike === 'string') return roleLike.toLowerCase() === 'admin';
        if (typeof roleLike === 'boolean') return roleLike === true;
        return false;
    }, [currentUser]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto text-center">
                        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-6">
                            <h1 className="text-xl font-semibold mb-2">Không có quyền truy cập</h1>
                            <p className="text-sm mb-4">Bạn cần tài khoản quản trị để xem nội dung này.</p>
                            <a href="/" className="inline-block bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm">Về trang chủ</a>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            
            <div className="flex flex-1 w-full">
                <AdminSidebar />
                <main className="flex-1 px-4 py-6 lg:py-8 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200">
                        {children}
                    </div>
                </main>
            </div>
            <ChatFloatingButton />
        
        </div>
    );
}
