import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  UserPlus,
  Mail,
  LockKeyhole,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- 1. OAUTH REDIRECT HANDLER ---
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ name: "Google User" }));

      console.log("🚀 [OAUTH] Account initialized via Google");
      navigate("/dashboard");
      window.location.reload();
    }
  }, [searchParams, navigate]);

  // --- 2. GOOGLE SIGNUP HANDLER ---
  const handleGoogleSignup = () => {
    const backendBase =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://pdf2sheet-auto-invoice-extraction-system.onrender.com";

    // Redirects to the same OAuth flow (User is created if they don't exist)
    window.location.href = `${backendBase}/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "https://pdf2sheet-auto-invoice-extraction-system.onrender.com/auth/register",
        form,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

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

  return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col w-full max-w-md overflow-hidden border border-slate-200 my-8">
        <div className="bg-white p-8 pb-4 text-center">
          <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
            <UserPlus className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Create Account
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Start automating your invoices today.
          </p>
        </div>

        {error && (
          <div className="mx-8 mb-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold text-center">
            {error}
          </div>
        )}

        <div className="px-10 space-y-4">
          {/* --- GOOGLE SIGNUP BUTTON --- */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700"
          >
            <img
              src="https://static.vecteezy.com/system/resources/previews/022/613/027/non_2x/google-icon-logo-symbol-free-png.png"
              className="w-5 h-5"
              alt="G"
            />
            Sign Up with Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-slate-100"></div>
            <span className="shrink mx-4 text-[10px] font-black text-slate-300 uppercase">
              OR
            </span>
            <div className="grow border-t border-slate-100"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 pt-2 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Username"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Create Workspace"
            )}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="px-10 pb-8 text-center">
          <p className="text-xs text-slate-500 font-bold">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}