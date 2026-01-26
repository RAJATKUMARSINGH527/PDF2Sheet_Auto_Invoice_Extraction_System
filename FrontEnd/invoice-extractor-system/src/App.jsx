import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Mapping from "./pages/Mapping";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>

          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Main dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Vendor field mapping */}
          <Route path="/map" element={<Mapping />} />

          {/* Fallback */}
          <Route path="*" element={
            <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600">
              404 | Page Not Found
            </div>
          }/>

        </Routes>
      </div>
    </BrowserRouter>
  );
}
