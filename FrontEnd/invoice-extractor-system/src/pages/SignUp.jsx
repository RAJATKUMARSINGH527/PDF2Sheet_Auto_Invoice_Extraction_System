import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Mail,
  LockKeyhole,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "../config";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const sId = res.data.user.spreadsheetId || "";
      localStorage.setItem("spreadsheet_id", sId);

      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-4xl sm:rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col w-full max-w-105 overflow-hidden border border-slate-200 transition-all">
        <div className="bg-white p-6 sm:p-10 pb-4 sm:pb-6 text-center">
          <div className="bg-indigo-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-indigo-200">
            <UserPlus className="text-white w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Create Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            Start automating your invoices today.
          </p>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mb-4 p-3 sm:p-4 bg-rose-50 border border-rose-100 rounded-xl sm:rounded-2xl text-rose-600 text-[10px] sm:text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="px-6 sm:px-10 space-y-3 sm:space-y-4"
        >
          {/* Full Name Input */}
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Username"
                className="w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Work Email
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

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Password
            </label>
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

          {/* Submit Button */}
          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:bg-slate-300"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              "Create Workspace"
            )}
            {!loading && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative flex py-5 sm:py-6 items-center px-6 sm:px-10">
          <div className="grow border-t border-slate-100"></div>
          <span className="shrink mx-4 text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">
            OR
          </span>
          <div className="grow border-t border-slate-100"></div>
        </div>

        {/* Google Signup */}
        <div className="px-6 sm:px-10 pb-4">
          <button
            onClick={handleGoogleSignup}
            type="button"
            className="w-full bg-white border border-slate-200 text-slate-600 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 sm:gap-3"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            Sign up with Google
          </button>
        </div>

        {/* Footer Link */}
        <div className="px-6 sm:px-10 pb-8 sm:pb-10 text-center">
          <p className="text-xs sm:text-sm text-slate-500 font-bold">
            Already a member?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
