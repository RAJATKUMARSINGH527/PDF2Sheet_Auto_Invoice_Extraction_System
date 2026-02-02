// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";

// // Pages
// import Dashboard from "./pages/Dashboard";
// import Mapping from "./pages/Mapping";
// import Login from "./pages/Login";
// import SignUp from "./pages/SignUp";
// import ForgotPassword from "./pages/ForgotPassword"; 
// import ResetPassword from "./pages/ResetPassword";

// // Components & Modules
// import Navbar from "./components/Navbar";
// import UploadInvoice from "./components/UploadInvoice";
// import Reports from "./components/Reports";
// import History from "./components/History";
// import Settings from "./components/Settings";

// // Protected Route Wrapper
// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   return token ? children : <Navigate to="/login" replace />;
// };

// export default function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

//   useEffect(() => {
//     const handleStorageChange = () => {
//       setIsAuthenticated(!!localStorage.getItem("token"));
//     };
//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   return (
//     <BrowserRouter>
//       <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        
//         <Navbar />

//         <main className="flex-1">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/dashboard" element={<Dashboard />} />
            
//             <Route 
//               path="/upload" 
//               element={<UploadInvoice />} 
//             />

//             {/* Public Auth Routes */}
//             <Route 
//               path="/login" 
//               element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
//             />
//             <Route 
//               path="/signup" 
//               element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" replace />} 
//             />

//             {/* 2. FORGOT & RESET ROUTES (Public) */}
//             <Route 
//               path="/forgot-password" 
//               element={<ForgotPassword />} 
//             />
//             {/* :token dynamic parameter hai jo email link se aayega */}
//             <Route 
//               path="/reset-password/:token" 
//               element={<ResetPassword />} 
//             />

//             {/* Private Workspace Routes */}
//             <Route 
//               path="/history" 
//               element={<ProtectedRoute><History /></ProtectedRoute>} 
//             />
//             <Route 
//               path="/reports" 
//               element={<ProtectedRoute><Reports /></ProtectedRoute>} 
//             />
//             <Route 
//               path="/settings" 
//               element={<ProtectedRoute><Settings /></ProtectedRoute>} 
//             />
//             <Route 
//               path="/map" 
//               element={<ProtectedRoute><Mapping /></ProtectedRoute>} 
//             />

//             {/* 404 fallback */}
//             <Route 
//               path="*" 
//               element={
//                 <div className="flex flex-col items-center justify-center h-[80vh]">
//                   <h2 className="text-9xl font-black text-indigo-100">404</h2>
//                   <p className="text-xl font-bold text-slate-400 -mt-8">Page Not Found</p>
//                   <button 
//                     onClick={() => window.location.href = "/"}
//                     className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
//                   >
//                     Return to Dashboard
//                   </button>
//                 </div>
//               } 
//             />
//           </Routes>
//         </main>
//       </div>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Pages
import Dashboard from "./pages/Dashboard";
import Mapping from "./pages/Mapping";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword";

// Components & Modules
import Navbar from "./components/Navbar";
import UploadInvoice from "./components/UploadInvoice";
import Reports from "./components/Reports";
import History from "./components/History";
import Settings from "./components/Settings";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  // 1. Initial state mein hi check kar lo (Isse render bach jata hai)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const savedToken = localStorage.getItem("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.dispatchEvent(new Event("userUpdated"));
      return true;
    }
    return !!savedToken;
  });

useEffect(() => {
    // 2. Sirf URL saaf karne ka kaam yahan rakhein
    const params = new URLSearchParams(window.location.search);
    if (params.get("token")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleAuthSync = () => {
      // ✅ Ye state ko refresh karega jab login ya logout hoga
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    // Listeners: storage (doosre tab ke liye) aur userUpdated (logout ke liye)
    window.addEventListener("storage", handleAuthSync);
    window.addEventListener("userUpdated", handleAuthSync); // 👈 YE LINE JAROORI HAI

    return () => {
      window.removeEventListener("storage", handleAuthSync);
      window.removeEventListener("userUpdated", handleAuthSync); // 👈 Clean up
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        
        <Navbar />

        <main className="flex-1">
          <Routes>
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

            {/* 2. FORGOT & RESET ROUTES (Public) */}
            <Route 
              path="/forgot-password" 
              element={<ForgotPassword />} 
            />
            {/* :token dynamic parameter hai jo email link se aayega */}
            <Route 
              path="/reset-password/:token" 
              element={<ResetPassword />} 
            />

            {/* Private Workspace Routes */}
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