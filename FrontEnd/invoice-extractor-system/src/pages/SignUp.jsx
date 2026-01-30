import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, LockKeyhole, User, ArrowRight, Loader2 } from "lucide-react";
import { API_BASE_URL} from "../config";

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
      // ✅ Use the centralized API_BASE_URL
      const res = await axios.post(`${API_BASE_URL}/auth/register`, form);
      
      // 1. Save core auth data (matching Login logic)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // 2. Initialize spreadsheet_id (crucial for Dashboard)
      const sId = res.data.user.spreadsheetId || "";
      localStorage.setItem("spreadsheet_id", sId);
      
      console.log("✅ [SIGNUP] Account created. Spreadsheet ID initialized:", sId);

      // 3. Navigate and force a reload to sync Navbar/Auth states
      navigate("/dashboard");
      window.location.reload(); 
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Google Signup Trigger (Same as Login)
  const handleGoogleSignup = () => {
    // ✅ Use centralized URL for Google Auth redirect
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col w-full max-w-md overflow-hidden border border-slate-200">
        
        <div className="bg-white p-10 pb-6 text-center">
          <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium mt-2">Start automating your invoices today.</p>
        </div>

        {error && (
          <div className="mx-8 mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-10 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Username"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Workspace"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* --- OR Divider --- */}
        <div className="relative flex py-6 items-center px-10">
          <div className="grow border-t border-slate-100"></div>
          <span className="shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
          <div className="grow border-t border-slate-100"></div>
        </div>

        {/* --- Google Signup Button --- */}
        <div className="px-10 pb-4">
          <button
            onClick={handleGoogleSignup}
            type="button"
            className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5"
            />
            Sign up with Google
          </button>
        </div>

        <div className="px-10 pb-10 text-center">
          <p className="text-sm text-slate-500 font-bold">
            Already a member?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}