import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ArrowRight, Loader2 } from "lucide-react";
import { API_BASE_URL, getAuthHeaders } from "../config";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- GOOGLE TOKEN CATCHER ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      const finalizeLogin = async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/auth/profile`,
            getAuthHeaders(),
          );

          localStorage.setItem("user", JSON.stringify(res.data));
          localStorage.setItem("spreadsheet_id", res.data.spreadsheetId || "");

          window.history.replaceState({}, document.title, "/dashboard");
          window.location.reload();
        } catch (err) {
          console.error("Profile sync failed:", err);
        }
      };
      finalizeLogin();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const sId = res.data.user.spreadsheetId || "";
      localStorage.setItem("spreadsheet_id", sId);

      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Invalid credentials. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-4xl sm:rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col w-full max-w-105 overflow-hidden border border-slate-200 transition-all">
        <div className="bg-white p-6 sm:p-10 pb-4 sm:pb-6 text-center">
          <div className="bg-indigo-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-indigo-200">
            <LockKeyhole className="text-white w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            Access your automated invoice hub.
          </p>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mb-4 p-3 sm:p-4 bg-rose-50 border border-rose-100 rounded-xl sm:rounded-2xl text-rose-600 text-[10px] sm:text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 sm:px-10 space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:bg-slate-300"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              "Sign Into Workspace"
            )}
            {!loading && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </form>

        <div className="relative flex py-5 sm:py-6 items-center px-6 sm:px-10">
          <div className="grow border-t border-slate-100"></div>
          <span className="shrink mx-4 text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">
            OR
          </span>
          <div className="grow border-t border-slate-100"></div>
        </div>

        <div className="px-6 sm:px-10 pb-4">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-white border border-slate-200 text-slate-600 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 sm:gap-3"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            Continue with Google
          </button>
        </div>

        <div className="px-6 sm:px-10 pb-8 sm:pb-10 text-center">
          <p className="text-xs sm:text-sm text-slate-500 font-bold">
            New to the platform?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:underline underline-offset-4"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
