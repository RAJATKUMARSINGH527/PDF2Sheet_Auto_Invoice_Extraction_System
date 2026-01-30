import { useState, useEffect } from "react"; 
import {
  LayoutDashboard, FileSpreadsheet, LogOut, Upload,
  LogIn, UserPlus, Database, Menu, X 
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- 1. SYNC STATE LOGIC ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : { name: "Guest" };
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const syncUser = () => {
      const updated = JSON.parse(localStorage.getItem("user") || '{"name":"Guest"}');
      setUser(updated);
    };

    // Listen for same-tab updates (from Settings) and cross-tab updates
    window.addEventListener("userUpdated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("userUpdated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-indigo-100 text-indigo-700"
      : "text-gray-600 hover:bg-gray-50";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <FileSpreadsheet className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PDF2Sheet Auto
            </span>
          </div>

          {/* DESKTOP Navigation */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/dashboard")}`}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/upload" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/upload")}`}>
              <Upload className="w-4 h-4" /> Upload Invoice
            </Link>
            <Link to="/map" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/map")}`}>
              <Database className="w-4 h-4" /> Vendor Maps
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {token ? (
              <div className="flex items-center gap-3 border-l pl-4 border-gray-100">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-gray-700">Hi, <b>{user?.name || "User"}</b></span>
                  <span className="text-[10px] text-green-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span> Connected
                  </span>
                </div>
                {/* --- 2. SAFETY FIX FOR charAt --- */}
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md uppercase">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-bold">Login</Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-black">Sign Up</Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="flex items-center sm:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU CONTENT */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link to="/dashboard" onClick={closeMenu} className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/dashboard")}`}>Dashboard</Link>
            <Link to="/upload" onClick={closeMenu} className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/upload")}`}>Upload Invoice</Link>
            <Link to="/map" onClick={closeMenu} className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/map")}`}>Vendor Maps</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 px-4">
            {token ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-800">{user?.name}</div>
                    <div className="text-sm font-medium text-gray-500">Connected</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded-md">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" onClick={closeMenu} className="text-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-bold">Login</Link>
                <Link to="/signup" onClick={closeMenu} className="text-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}