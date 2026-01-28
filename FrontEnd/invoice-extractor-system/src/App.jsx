import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Pages
import Dashboard from "./pages/Dashboard";
import Mapping from "./pages/Mapping";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";


// Components
import Navbar from "./components/Navbar";
import UploadInvoice from "./components/UploadInvoice";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // Sync auth state across tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar only if authenticated */}
        {isAuthenticated && <Navbar />}

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/signup" 
              element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" replace />} 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/map" 
              element={
                <ProtectedRoute>
                  <Mapping />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadInvoice />
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
            />

            {/* 404 fallback */}
            <Route 
              path="*" 
              element={
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <h2 className="text-6xl font-bold text-indigo-200">404</h2>
                  <p className="text-xl font-semibold text-gray-500 mt-4">Page Not Found</p>
                  <button 
                    onClick={() => window.location.href = "/"}
                    className="mt-6 text-indigo-600 hover:underline font-medium"
                  >
                    Go Home
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
