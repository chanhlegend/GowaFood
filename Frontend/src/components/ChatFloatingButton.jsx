import { useState, useRef, useEffect } from "react";
import { MessageCircle, ChefHat, HeartPulse, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatFloatingButton() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Check admin role from localStorage
  let isAdmin = false;
  try {
    const user = JSON.parse(localStorage.getItem("user_gowa"));
    const roleLike = user?.role ?? user?.roles ?? user?.isAdmin;
    if (typeof roleLike === "string") isAdmin = roleLike.toLowerCase() === "admin";
    else if (typeof roleLike === "boolean") isAdmin = roleLike;
  } catch (e) {
    // ignore error
  }

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (isAdmin) return null;

  return (
    <div className="fixed z-[9999] right-4 bottom-24 sm:right-8 sm:bottom-22 flex flex-col items-end gap-2">
      {/* Menu */}
      {open && (
        <div
          ref={menuRef}
          className="mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 px-3 flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200 min-w-[180px]"
        >
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-green-800 font-semibold transition-colors"
            onClick={() => {
              setOpen(false);
              navigate("/chat-recipe-ai");
            }}
          >
            <ChefHat className="w-5 h-5 text-green-600" />
            Trợ lý nấu ăn
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-green-800 font-semibold transition-colors"
            onClick={() => {
              setOpen(false);
              navigate("/healthy-chat-ai");
            }}
          >
            <HeartPulse className="w-5 h-5 text-green-600" />
            Trợ lý dinh dưỡng
          </button>
          <button
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
            style={{top: 4, right: 4, position: 'absolute'}}
            onClick={() => setOpen(false)}
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Floating Button */}
      <button
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-600 shadow-lg hover:bg-green-700 text-white text-2xl transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat trợ lý"
        style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.18)" }}
      >
        <MessageCircle className="w-8 h-8" />
      </button>
    </div>
  );
}
