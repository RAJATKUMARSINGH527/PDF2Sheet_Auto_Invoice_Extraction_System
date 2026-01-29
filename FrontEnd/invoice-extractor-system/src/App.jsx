import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Pages
import Dashboard from "./pages/Dashboard";
import Mapping from "./pages/Mapping";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Components & Modules
import Navbar from "./components/Navbar";
import UploadInvoice from "./components/UploadInvoice";
import Reports from "./components/Reports";
import History from "./components/History";
import Settings from "./components/Settings";

// Protected Route Wrapper (Sirf private data ke liye use karein)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // Auth state ko sync rakhein
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        
        {/* FIX 1: Navbar hamesha dikhao taaki Login/Signup buttons nazar aayein */}
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* FIX 2: Dashboard aur Upload ko Public banao (ProtectedRoute hata diya) */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route 
              path="/upload" 
              element={<UploadInvoice />} 
            />

            {/* Public Auth Routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/signup" 
              element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" replace />} 
            />

            {/* Private Workspace Routes (Sirf login ke baad) */}
            <Route 
              path="/history" 
              element={<ProtectedRoute><History /></ProtectedRoute>} 
            />
            <Route 
              path="/reports" 
              element={<ProtectedRoute><Reports /></ProtectedRoute>} 
            />
            <Route 
              path="/settings" 
              element={<ProtectedRoute><Settings /></ProtectedRoute>} 
            />
            <Route 
              path="/map" 
              element={<ProtectedRoute><Mapping /></ProtectedRoute>} 
            />

            {/* 404 fallback */}
            <Route 
              path="*" 
              element={
                <div className="flex flex-col items-center justify-center h-[80vh]">
                  <h2 className="text-9xl font-black text-indigo-100">404</h2>
                  <p className="text-xl font-bold text-slate-400 -mt-8">Page Not Found</p>
                  <button 
                    onClick={() => window.location.href = "/"}
                    className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
                  >
                    Return to Dashboard
                  </button>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}