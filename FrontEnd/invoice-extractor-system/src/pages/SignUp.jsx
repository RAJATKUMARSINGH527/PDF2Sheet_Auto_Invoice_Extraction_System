import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserPlus, Mail, LockKeyhole, User, ArrowRight } from "lucide-react";

export default function SignUp() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Signup Error:", err);
      alert(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-md overflow-hidden">
        
        {/* Top Decorative Section */}
        <div className="bg-indigo-50 p-8 text-center border-b border-indigo-100">
          <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <UserPlus className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Start automating your invoices in minutes</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                required
                placeholder="Name Surname" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required
                placeholder="name@company.com" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Creating Account..." : "Join Now"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}