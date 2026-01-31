import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import PDFViewer from "../components/PDFViewer";
import FieldList from "../components/FieldList";
import ColumnMapper from "../components/ColumnMapper";
import { API_BASE_URL } from "../config";

export default function Mapping() {
  const [invoice, setInvoice] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedInvoice = localStorage.getItem("invoice");
    if (savedInvoice) {
      try {
        const parsed = JSON.parse(savedInvoice);
        Promise.resolve().then(() => setInvoice(parsed));
      } catch (e) {
        console.error("Failed to parse invoice", e);
      }
    }
    Promise.resolve().then(() => setIsReady(true));
    return () => setInvoice(null);
  }, []);

  if (!isReady) return null;

  if (!invoice) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden px-6">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[100px]" />
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-xl rounded-[2.5rem] p-8 sm:p-12 text-center">
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-8 sm:10 group">
              <div className="absolute inset-0 bg-indigo-100 rounded-3xl sm:rounded-4xl rotate-6 group-hover:rotate-12 transition-transform duration-500 ease-out" />
              <div className="absolute inset-0 bg-indigo-600 rounded-3xl sm:rounded-4xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 p-2 rounded-full border-4 border-white shadow-md">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              Workspace Empty
            </h2>
            <p className="text-slate-500 text-sm sm:text-[15px] mb-8 sm:10 px-2">
              We couldn't find an active invoice in your session. Head back to
              the dashboard to select a document for mapping.
            </p>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg"
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIC ---
  const safePath = invoice.filePath?.replace(/\\/g, "/");
  const fileUrl = `${API_BASE_URL}/${safePath}`;
  const fields = {
    invoiceNo: invoice.invoiceNo || "N/A",
    date: invoice.date || "N/A",
    total: invoice.total || "0.00",
    vendor: invoice.vendor || invoice.vendorName || "Auto-Detected",
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="h-16 sm:h-20 bg-white border-b border-gray-100 px-4 sm:px-8 flex justify-between items-center shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 truncate">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="truncate">
            <h2 className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">
              Workspace / Verification
            </h2>
            <p className="text-xs sm:text-sm font-extrabold text-gray-800 truncate max-w-37.5 sm:max-w-xs">
              {invoice.senderEmail || "Unknown Sender"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.confidence >= 0.75 ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] sm:text-xs font-bold border border-green-100">
              <CheckCircle2 size={12} className="hidden sm:block" /> High
              Confidence
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] sm:text-xs font-bold border border-amber-100">
              <AlertCircle size={12} className="hidden sm:block" /> Needs Review
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        <div className="h-[45vh] lg:h-full lg:col-span-7 bg-slate-200 border-b lg:border-b-0 lg:border-r border-gray-200 relative overflow-hidden shrink-0">
          <PDFViewer key={fileUrl} fileUrl={fileUrl} />
        </div>

        <div className="flex-1 lg:h-full lg:col-span-5 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <section className="p-5 sm:p-8 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
                  1. AI Extraction
                </h3>
                <span className="text-[9px] text-gray-400 font-bold uppercase">
                  Source: OCR
                </span>
              </div>
              <FieldList
                key={`fields-${invoice._id || "temp"}`}
                fields={fields}
              />
            </section>

            <section className="p-5 sm:p-8 bg-indigo-50/20">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-[10px] sm:text-xs font-black text-indigo-400 uppercase tracking-widest">
                  2. Destination Mapping
                </h3>
                <span className="text-[9px] text-indigo-400 font-bold uppercase">
                  Sync Active
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                <ColumnMapper
                  key={`mapper-${invoice._id || "temp"}`}
                  fields={fields}
                  email={invoice.senderEmail}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
