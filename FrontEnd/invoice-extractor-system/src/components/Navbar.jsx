import { LayoutDashboard, FileSpreadsheet, LogOut, Upload, LogIn, UserPlus, Database } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auth Check
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Guest" };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-indigo-100 text-indigo-700"
      : "text-gray-600 hover:bg-gray-50";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

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

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            
            {/* PUBLIC LINKS: Visible to everyone */}
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/dashboard")}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/upload"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/upload")}`}
            >
              <Upload className="w-4 h-4" />
              Upload Invoice
            </Link>

            <Link
              to="/map"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/map")}`}
            >
              <Database className="w-4 h-4" />
              Vendor Maps
            </Link>

            {/* Visual Divider */}
            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {/* CONDITIONAL SECTION: Login/Signup vs Profile/Logout */}
            {token ? (
              /* LOGGED IN VIEW */
              <div className="flex items-center gap-3 border-l pl-4 border-gray-100">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-gray-700">Hi, <b>{user.name}</b></span>
                  <span className="text-[10px] text-green-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md uppercase">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* GUEST VIEW */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-bold transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}