import { useState } from "react";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PDFViewer from "../components/PDFViewer";
import FieldList from "../components/FieldList";
import ColumnMapper from "../components/ColumnMapper";


export default function Mapping() {
  const [invoice] = useState(() => {
    const savedInvoice = localStorage.getItem("invoice");
    try {
      return savedInvoice ? JSON.parse(savedInvoice) : null;
    } catch (e) {
      console.error("Failed to parse invoice from storage", e);
      return null;
    }
  });

  if (!invoice) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">No Invoice Loaded</h2>
          <p className="text-gray-500 mt-2">Please upload a PDF from the dashboard to start mapping.</p>
          <Link 
            to="/dashboard" 
            className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft size={18} /> Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const safePath = invoice.filePath?.replace(/\\/g, "/"); 
  const fileUrl = `http://localhost:5000/${safePath}`;

  const fields = {
    invoiceNo: invoice.invoiceNo || "N/A",
    date: invoice.date || "N/A",
    total: invoice.total || "0.00",
    vendor: invoice.vendor || invoice.vendorName || "Auto-Detected",
  };

  return (
    // FIX 1: Ensure the container takes exactly the remaining screen height
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col overflow-hidden">
      
      {/* Header - Fixed Height */}
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

      {/* Main Content - Grid with absolute height */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">

        {/* Column 1: Document View (Fixed height, scroll handled inside PDFViewer) */}
        <div className="col-span-7 bg-slate-200 border-r border-gray-200 relative overflow-hidden">
           <PDFViewer fileUrl={fileUrl} />
        </div>

        {/* Column 2: Sidebar (Nested Flexbox for perfect scrolling) */}
        <div className="col-span-5 flex flex-col bg-white overflow-hidden">
          
          {/* AI Extraction - Takes only space needed, but can scroll if too long */}
          <section className="p-8 border-b border-gray-100 shrink-0 max-h-[40%] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">1. AI Extraction</h3>
              <span className="text-[10px] text-gray-400">Values read from PDF</span>
            </div>
            <FieldList fields={fields} />
          </section>

          {/* Integration Mapping - Takes remaining space and enforces its own scroll */}
          <section className="flex-1 flex flex-col p-8 bg-indigo-50/20 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">2. Destination Mapping</h3>
              <span className="text-[10px] text-indigo-400 font-bold">Sheet Link Active</span>
            </div>
            
            {/* Wrapper for the ColumnMapper component */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
              <ColumnMapper fields={fields} email={invoice.senderEmail} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}