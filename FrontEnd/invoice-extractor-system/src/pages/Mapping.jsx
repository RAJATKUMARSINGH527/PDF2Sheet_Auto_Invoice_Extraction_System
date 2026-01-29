import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { Link} from "react-router-dom";
import PDFViewer from "../components/PDFViewer";
import FieldList from "../components/FieldList";
import ColumnMapper from "../components/ColumnMapper";

export default function Mapping() {
  const [invoice, setInvoice] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // 1. FRESH LOAD LOGIC: Ensure we pull the latest invoice on every mount
  useEffect(() => {
    const savedInvoice = localStorage.getItem("invoice");
    if (savedInvoice) {
      try {
        const parsed = JSON.parse(savedInvoice);
        Promise.resolve().then(() => setInvoice(parsed));
        console.log("📄 [MAPPING] Loaded Invoice:", parsed.vendor);
      } catch (e) {
        console.error("Failed to parse invoice", e);
      }
    }
    Promise.resolve().then(() => setIsReady(true));

    // CLEANUP: Optional - clear invoice from state when leaving to prevent ghosting
    return () => setInvoice(null);
  }, []);

  if (!isReady) return null; // Prevent flicker

if (!invoice) {
  return (
    <div className="relative h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden px-6">
      {/* Soft Background Blobs for Modern Depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-12 text-center">
          
          {/* Animated Icon Container */}
          <div className="relative mx-auto w-24 h-24 mb-10 group">
            <div className="absolute inset-0 bg-indigo-100 rounded-4xl rotate-6 group-hover:rotate-12 transition-transform duration-500 ease-out" />
            <div className="absolute inset-0 bg-indigo-600 rounded-4xl flex items-center justify-center shadow-xl shadow-indigo-200 group-hover:scale-105 transition-transform duration-500">
              <Loader2 className="w-10 h-10 text-white animate-[spin_3s_linear_infinite]" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 p-2 rounded-full border-4 border-white shadow-md">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Typography */}
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
            Workspace Empty
          </h2>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-10 px-2">
            We couldn't find an active invoice in your session. Head back to the dashboard to select a document for mapping.
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Link 
              to="/dashboard" 
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300 active:scale-95 shadow-lg shadow-slate-200"
            >
              <ArrowLeft size={18} strokeWidth={3} />
              Back to Dashboard
            </Link>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Awaiting Document Input
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


const safePath = invoice.filePath?.replace(/\\/g, "/");  

const fileUrl = `http://localhost:5000/${safePath}`;


// 1. Sanitize the path
// const safePath = invoice.filePath?.replace(/\\/g, "/"); 

// 2. Determine the Base URL
// Checks if the app is running on localhost; otherwise, uses the Render URL
// const isLocal = window.location.hostname === "localhost";
// const baseUrl = isLocal 
//   ? "http://localhost:5000" 
//   : "https://pdf2sheet-auto-invoice-extraction-system.onrender.com";

// 3. Construct the final URL
// const fileUrl = `${baseUrl}/${safePath}`;

  // Prepare fields object for child components
  const fields = {
    invoiceNo: invoice.invoiceNo || "N/A",
    date: invoice.date || "N/A",
    total: invoice.total || "0.00",
    vendor: invoice.vendor || invoice.vendorName || "Auto-Detected",
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="h-16 bg-white border-b px-8 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-indigo-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Workspace / Verification</h2>
            <p className="text-lg font-extrabold text-gray-800 truncate max-w-xs">{invoice.senderEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {invoice.confidence >= 0.75 ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <CheckCircle2 size={14} /> High Confidence
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
              <AlertCircle size={14} /> Verification Needed
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">

        {/* Column 1: Document View */}
        <div className="col-span-7 bg-slate-200 border-r border-gray-200 relative overflow-hidden">
           {/* Added key to PDFViewer to force reload when file changes */}
           <PDFViewer key={fileUrl} fileUrl={fileUrl} />
        </div>

        {/* Column 2: Sidebar */}
        <div className="col-span-5 flex flex-col bg-white overflow-hidden">
          
          {/* Section 1: AI Extraction */}
          <section className="p-8 border-b border-gray-100 shrink-0 max-h-[40%] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">1. AI Extraction</h3>
              <span className="text-[10px] text-gray-400">Values read from PDF</span>
            </div>
            {/* Added key to FieldList to force reset on new invoice */}
            <FieldList key={`fields-${invoice._id}`} fields={fields} />
          </section>

          {/* Section 2: Destination Mapping */}
          <section className="flex-1 flex flex-col p-8 bg-indigo-50/20 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">2. Destination Mapping</h3>
              <span className="text-[10px] text-indigo-400 font-bold">Sheet Link Active</span>
            </div>
            
            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
              {/* Added key to ColumnMapper to force reset on new invoice */}
              <ColumnMapper 
                key={`mapper-${invoice._id}`} 
                fields={fields} 
                email={invoice.senderEmail} 
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}