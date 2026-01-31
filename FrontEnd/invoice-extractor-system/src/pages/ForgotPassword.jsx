import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Backend API call (Aapko backend pe ye endpoint banana hoga)
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setMessage("Password reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 w-full max-w-md p-8 sm:p-10 border border-slate-200">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Mail className="text-indigo-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Reset Password</h2>
          <p className="text-sm text-slate-500 mt-2">Enter your email to receive a reset link.</p>
        </div>

        {message ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3 text-green-600 font-bold text-sm mb-6">
              <CheckCircle2 className="shrink-0" /> {message}
            </div>
            <Link to="/login" className="text-indigo-600 font-bold flex items-center justify-center gap-2 hover:underline">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold text-center border border-rose-100">{error}</div>}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-slate-400 text-xs font-bold hover:text-slate-600 flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}