import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("https://pdf2sheet-auto-invoice-extraction-system.onrender.com/auth/login", form);
      
      // 1. Save core auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // 2. CRITICAL FIX: Ensure spreadsheet_id is always set (even if empty)
      // This prevents the Dashboard from using a "leftover" ID from a previous user
      const sId = res.data.user.spreadsheetId || "";
      localStorage.setItem("spreadsheet_id", sId);
      
      console.log("🔑 [LOGIN] Session initialized. Spreadsheet ID:", sId);

      // 3. Smooth transition to dashboard
      navigate("/dashboard");
      
      // Optional: Instead of reload, consider using a Context provider for state
      // but window.location.reload() works to hard-reset the app state
      window.location.reload(); 
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Modern Header Section */}
        <div className="bg-white p-10 text-center">
          <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <LockKeyhole className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 font-medium mt-2">Access your automated invoice hub.</p>
        </div>

        {/* Inline Error Message */}
        {error && (
          <div className="mx-8 mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-10 pt-2 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
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
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              <a href="#" className="text-[10px] font-black text-indigo-500 uppercase hover:underline">Forgot?</a>
            </div>
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
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign Into Workspace"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Footer Section */}
        <div className="px-10 pb-10 text-center">
          <p className="text-sm text-slate-500 font-bold">
            New to the platform?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}