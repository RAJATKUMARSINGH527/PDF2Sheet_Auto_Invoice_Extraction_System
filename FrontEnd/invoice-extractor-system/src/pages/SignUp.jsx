import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Use useNavigate for better React practice
import { UserPlus, Mail, LockKeyhole, User, ArrowRight, Loader2 } from "lucide-react";

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
      const res = await axios.post("http://localhost:5000/auth/register", form);
      
      // Store token and the full user object (including spreadsheetId if returned)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Navigate to dashboard using the router instead of window.location
      navigate("/dashboard");
      window.location.reload(); // Ensure Navbar/ProtectedRoutes pick up the new auth state
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Modern Header */}
        <div className="bg-white p-10 text-center">
          <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium mt-2">Start automating your invoices today.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-5">
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
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6 disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Workspace"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

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