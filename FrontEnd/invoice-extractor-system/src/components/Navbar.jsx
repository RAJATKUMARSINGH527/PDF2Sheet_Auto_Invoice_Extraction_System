import { LayoutDashboard, Database, Settings, FileSpreadsheet, LogOut, Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Guest" };

  // Highlight active link
  const isActive = (path) =>
    location.pathname === path
      ? "bg-indigo-100 text-indigo-700"
      : "text-gray-600 hover:bg-gray-50";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <FileSpreadsheet className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PDF2Sheet Auto
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/dashboard")}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/map"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/map")}`}
            >
              <Database className="w-4 h-4" />
              Vendor Maps
            </Link>

            {/* NEW: Upload Invoice Link */}
            <Link
              to="/upload"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/upload")}`}
            >
              <Upload className="w-4 h-4" />
              Upload Invoice
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* User Profile / Status */}
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-3">
              <span className="text-xs font-semibold text-gray-700">
                Hi, <b>{user.name}</b>
              </span>
              <span className="text-[10px] text-green-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
              {user.name.charAt(0)}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
