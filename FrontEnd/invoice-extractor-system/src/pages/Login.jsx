import { useState, useEffect } from "react"; // Added useEffect
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom"; // Added useSearchParams
import { LockKeyhole, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook to read URL ?token=
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- 1. CATCH GOOGLE TOKEN FROM URL ---
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // We set a temporary user object; your App should fetch the real profile
      // in a top-level useEffect using this token.
      localStorage.setItem("user", JSON.stringify({ name: "Google User" }));

      console.log("🔑 [OAUTH] Google Session Initialized");
      navigate("/dashboard");
      window.location.reload();
    }
  }, [searchParams, navigate]);

  // --- 2. GOOGLE LOGIN HANDLER ---
  const handleGoogleLogin = () => {
    const backendBase =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://pdf2sheet-auto-invoice-extraction-system.onrender.com";

    // Redirect browser to the backend OAuth route
    window.location.href = `${backendBase}/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "https://pdf2sheet-auto-invoice-extraction-system.onrender.com/auth/login",
        form,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const sId = res.data.user.spreadsheetId || "";
      localStorage.setItem("spreadsheet_id", sId);

      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col w-full max-w-md overflow-hidden border border-slate-200">
        <div className="bg-white p-8 pb-4 text-center">
          <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
            <LockKeyhole className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Access your automated invoice hub.
          </p>
        </div>

        {error && (
          <div className="mx-8 mb-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold text-center">
            {error}
          </div>
        )}

        <div className="px-10 space-y-4">
          {/* --- GOOGLE BUTTON --- */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700"
          >
            <img
              src="https://static.vecteezy.com/system/resources/previews/022/613/027/non_2x/google-icon-logo-symbol-free-png.png"
              className="w-5 h-5"
              alt="G"
            />
            Continue with Google
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
              Email Address
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
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <a
                href="#"
                className="text-[10px] font-black text-indigo-500 uppercase hover:underline"
              >
                Forgot?
              </a>
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Footer Section */}
        <div className="px-10 pb-10 text-center">
          <p className="text-sm text-slate-500 font-bold">
            New to the platform?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
