import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  LogOut,
  Upload,
  LogIn,
  UserPlus,
  Database,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- SYNC STATE LOGIC ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : { name: "Guest" };
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const syncUser = () => {
      const updated = JSON.parse(
        localStorage.getItem("user") || '{"name":"Guest"}',
      );
      setUser(updated);
    };

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => {
              navigate("/");
              closeMenu();
            }}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <FileSpreadsheet className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PDF2Sheet Auto
            </span>
          </div>

          {/* DESKTOP Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1 xl:gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/dashboard")}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link
              to="/upload"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/upload")}`}
            >
              <Upload className="w-4 h-4" /> Upload Invoice
            </Link>
            <Link
              to="/map"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/map")}`}
            >
              <Database className="w-4 h-4" /> Vendor Maps
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {token ? (
              <div className="flex items-center gap-3 border-l pl-4 border-gray-100">
                <div className="hidden xl:flex flex-col items-end">
                  <span className="text-xs font-semibold text-gray-700 truncate max-w-25">
                    Hi, {user?.name?.split(" ")[0] || "User"}
                  </span>
                  <span className="text-[10px] text-green-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>{" "}
                    Active
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase shrink-0">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-bold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-black shadow-md hover:bg-indigo-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE/TABLET MENU BUTTON  */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU CONTENT */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="pt-4 pb-6 space-y-2 px-4">
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive("/dashboard")}`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <Link
              to="/upload"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive("/upload")}`}
            >
              <Upload className="w-5 h-5" /> Upload Invoice
            </Link>
            <Link
              to="/map"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive("/map")}`}
            >
              <Database className="w-5 h-5" /> Vendor Maps
            </Link>

            <div className="border-t border-gray-100 my-4 pt-4">
              {token ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 px-2">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-100">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900">
                        {user?.name}
                      </div>
                      <div className="text-xs font-semibold text-green-500 flex items-center gap-1.5">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                        Workspace Connected
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3.5 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                  >
                    <LogOut className="w-5 h-5" /> Sign out of Workspace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 px-2">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="w-full text-center px-4 py-3 border border-indigo-600 text-indigo-600 rounded-xl font-bold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="w-full text-center px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
