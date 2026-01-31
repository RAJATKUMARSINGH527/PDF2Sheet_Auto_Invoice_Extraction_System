import { useState} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { LockKeyhole, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      return setError("Passwords do not match!");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    setError("");

    try {
      // Backend API call: Humne App.js mein path /reset-password/:token rakha tha
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password/${token}`, { 
        password 
      });

      console.log("Success:", res.data.message);
      setSuccess(true);
      // 3 seconds baad login page par bhej dein
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Link expired or invalid. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[100px]" />

      <div className="bg-white rounded-4xl sm:rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col w-full max-w-md overflow-hidden border border-slate-200 relative z-10 transition-all">
        <div className="p-8 sm:p-10 text-center">
          <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <LockKeyhole className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            New Password
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            Secure your workspace with a fresh password.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="px-8 pb-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 mb-6">
              <CheckCircle2 className="mx-auto text-green-600 mb-3" size={40} />
              <p className="text-green-700 font-bold">Password Reset Successfully!</p>
              <p className="text-xs text-green-600 mt-2">Redirecting to login workspace...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 sm:px-10 pb-10 space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                New Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Update Password <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}