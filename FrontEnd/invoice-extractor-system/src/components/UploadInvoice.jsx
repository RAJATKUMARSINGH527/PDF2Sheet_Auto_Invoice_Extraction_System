import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getAuthHeaders } from "../config";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function UploadInvoice() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setStatus("error");
        setMessage("File is too large. Maximum size is 10MB.");
        return;
      }
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setStatus("idle");
        setMessage("");
      } else {
        setStatus("error");
        setMessage("Please select a valid PDF file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }
    setStatus("uploading");
    setMessage("");

    const formData = new FormData();
    formData.append("pdf", file);
    const user = JSON.parse(localStorage.getItem("user"));
    formData.append("email", user?.email || "");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("error");
        setMessage("Please Login/Signup to Upload PDF.");
        return;
      }

      const res = await axios.post(`${API_BASE_URL}/upload/`, formData, {
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setStatus("success");
        setMessage(
          `Invoice ${res.data.invoice.invoiceNo || "Processed"} extracted!`,
        );
        localStorage.setItem("invoice", JSON.stringify(res.data.invoice));
        setTimeout(() => navigate("/map"), 1500);
      } else {
        setStatus("error");
        setMessage(res.data.error || "Extraction failed.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Server connection error 😢");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-48 sm:h-64 bg-indigo-600 -z-10"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 100%)" }}
      ></div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white rounded-4xl sm:rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-slate-100 overflow-hidden">
        {/* Top Branding Section*/}
        <div className="p-6 sm:p-10 pb-4 sm:pb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Invoice AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Upload PDF to sync with Google Sheets
            </p>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <span className="p-1.5 sm:p-2 bg-green-50 text-green-600 rounded-lg">
              <ShieldCheck size={18} />
            </span>
            <span className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Zap size={18} />
            </span>
          </div>
        </div>

        <div className="px-6 sm:px-10 pb-8 sm:pb-10">
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              className="group cursor-pointer border-2 border-dashed border-slate-200 rounded-3xl sm:rounded-4xl p-8 sm:p-16 flex flex-col items-center justify-center transition-all hover:border-indigo-500 hover:bg-indigo-50/50"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud size={28} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="mt-4 sm:mt-6 text-base sm:text-lg font-bold text-slate-700 text-center">
                Drop your invoice here
              </h3>
              <p className="text-slate-400 text-[11px] sm:text-sm mt-1 font-medium">
                Only PDF files supported
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Card - Responsive layout */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  <div className="p-2 sm:p-3 bg-white rounded-xl shadow-sm text-indigo-600 shrink-0">
                    <FileText size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-37.5 sm:max-w-60">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setStatus("idle");
                  }}
                  className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                  disabled={status === "uploading"}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Success/Error Alerts */}
              {status === "success" && (
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <p className="text-[11px] sm:text-sm font-bold">{message}</p>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-[11px] sm:text-sm font-bold">{message}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleUpload}
                disabled={status === "uploading"}
                className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 shadow-xl ${
                  status === "uploading"
                    ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-95"
                }`}
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Extracting...
                  </>
                ) : (
                  <>
                    Proceed to Sync
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer*/}
        <div className="bg-slate-50 p-4 sm:p-6 text-center border-t border-slate-100">
          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Secure AI Processing • Google Sheets API
          </p>
        </div>
      </div>
    </div>
  );
}
