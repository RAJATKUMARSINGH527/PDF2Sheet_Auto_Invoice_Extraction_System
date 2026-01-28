import React, { useState, useRef } from "react";
import axios from "axios";
import { 
  UploadCloud, FileText, CheckCircle2, 
  AlertCircle, Loader2, X, ArrowRight,
  ShieldCheck, Zap
} from "lucide-react";

export default function UploadInvoice() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, uploading, success, error
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      setStatus("idle");
      setMessage("");
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
    formData.append("email", "user@example.com"); // sender email, can be dynamic

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-auth-token": localStorage.getItem("token"), // backend expects token
        },
      });

      if (res.data.success) {
        setStatus("success");
        setMessage(`Invoice ${res.data.invoice.invoiceNo || 'Processed'} uploaded successfully! ✅ Check your email.`);
        setFile(null);
      } else {
        setStatus("error");
        setMessage(res.data.error || "Upload failed 😢");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Upload failed 😢");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600 -z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }}></div>

      <div className="w-full max-w-2xl bg-white rounded-4xl shadow-2xl shadow-indigo-200/50 border border-slate-100 overflow-hidden">
        
        {/* Top Branding Section */}
        <div className="p-10 pb-6 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Invoice AI</h2>
            <p className="text-slate-500 font-medium mt-1">Upload your PDF to sync with Google Sheets</p>
          </div>
          <div className="flex gap-2">
            <span className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheck size={20}/></span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Zap size={20}/></span>
          </div>
        </div>

        <div className="px-10 pb-10">
          {/* Dynamic Upload Zone */}
          {!file ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              className="group cursor-pointer border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center transition-all hover:border-indigo-500 hover:bg-indigo-50/50"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud size={32} />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-700">Drop your invoice here</h3>
              <p className="text-slate-400 text-sm mt-1">Only PDF files are supported</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Card */}
              <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600"><FileText size={24} /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-62.5">{file.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Status Indicator */}
              {status === "success" && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 size={20} />
                  <p className="text-sm font-bold">{message}</p>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-bottom-2">
                  <AlertCircle size={20} />
                  <p className="text-sm font-bold">{message}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleUpload}
                disabled={status === "uploading"}
                className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                  status === "uploading"
                    ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-95"
                }`}
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Extracting Data...
                  </>
                ) : (
                  <>
                    Proceed to Sync
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure AI Processing • Google Sheets v4 API</p>
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useRef } from "react";
// import axios from "axios";
// import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X, ArrowRight } from "lucide-react";

// export default function UploadInvoice() {
//   const [file, setFile] = useState(null);
//   const [email, setEmail] = useState(""); // dynamic email input
//   const [status, setStatus] = useState("idle"); // idle, uploading, success, error
//   const [message, setMessage] = useState("");
//   const fileInputRef = useRef(null);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile?.type === "application/pdf") {
//       setFile(selectedFile);
//       setStatus("idle");
//       setMessage("");
//     }
//   };

//   const handleUpload = async () => {
//     if (!file || !email) {
//       setStatus("error");
//       setMessage("Please select a PDF and enter your email.");
//       return;
//     }

//     setStatus("uploading");
//     setMessage("");

//     const formData = new FormData();
//     formData.append("pdf", file);
//     formData.append("email", email);

//     try {
//       const res = await axios.post("http://localhost:5000/upload", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           "x-auth-token": localStorage.getItem("token"),
//         },
//       });

//       if (res.data.success) {
//         setStatus("success");
//         setMessage(`Invoice ${res.data.invoice.invoiceNo || "Processed"} uploaded! ✅ Check your email.`);
//         setFile(null);
//       } else {
//         setStatus("error");
//         setMessage(res.data.error || "Upload failed 😢");
//       }
//     } catch (err) {
//       setStatus("error");
//       setMessage(err.response?.data?.error || "Upload failed 😢");
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-lg flex flex-col gap-6">
//       <h2 className="text-2xl font-bold text-gray-800">Upload Invoice PDF</h2>

//       <input
//         type="email"
//         placeholder="Enter your email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className="border px-4 py-2 rounded-lg w-full"
//       />

//       <div
//         onClick={() => fileInputRef.current.click()}
//         onDragOver={(e) => e.preventDefault()}
//         className="cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl p-16 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition"
//       >
//         <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
//           <UploadCloud size={32} />
//         </div>
//         <p className="mt-4 text-gray-500">Drop your PDF here or click to select</p>
//         <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
//       </div>

//       {file && (
//         <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
//           <div className="flex items-center gap-4">
//             <FileText size={24} className="text-indigo-600" />
//             <div>
//               <p className="font-bold text-gray-800 truncate">{file.name}</p>
//               <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
//             </div>
//           </div>
//           <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
//         </div>
//       )}

//       {status === "uploading" && (
//         <div className="flex items-center gap-2 text-indigo-600 font-semibold">
//           <Loader2 className="animate-spin" />
//           Extracting Data...
//         </div>
//       )}

//       {status === "success" && (
//         <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100">
//           <CheckCircle2 />
//           {message}
//         </div>
//       )}

//       {status === "error" && (
//         <div className="flex items-center gap-2 bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100">
//           <AlertCircle />
//           {message}
//         </div>
//       )}

//       <button
//         onClick={handleUpload}
//         disabled={status === "uploading"}
//         className={`w-full py-3 rounded-xl font-bold uppercase flex items-center justify-center gap-2 ${
//           status === "uploading" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"
//         }`}
//       >
//         Proceed to Sync <ArrowRight size={20} />
//       </button>
//     </div>
//   );
// }
