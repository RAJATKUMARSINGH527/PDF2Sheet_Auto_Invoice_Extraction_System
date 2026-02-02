// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { API_BASE_URL, getAuthHeaders } from "../config";
// import {
//   Search,
//   FileText,
//   Download,
//   ExternalLink,
//   ArrowLeft,
//   Filter,
//   ChevronRight,
//   Calendar,
//   Loader2,
// } from "lucide-react";

// export default function History() {
//   const navigate = useNavigate();
//   const [invoices, setInvoices] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAllHistory = async () => {
//       try {
//         const res = await axios.get(
//           `${API_BASE_URL}/invoices/history`,
//           getAuthHeaders(),
//         );
//         setInvoices(res.data);
//       } catch (error) {
//         console.error("History fetch error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAllHistory();
//   }, []);

//   const filtered = invoices.filter(
//     (inv) =>
//       inv.vendor?.toLowerCase().includes(search.toLowerCase()) ||
//       inv.invoiceNo?.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">
//       <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:px-8 sm:py-5">
//         <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => navigate("/dashboard")}
//               className="p-2 hover:bg-slate-100 rounded-full shrink-0"
//             >
//               <ArrowLeft size={20} className="text-slate-600" />
//             </button>
//             <h1 className="text-xl font-black text-slate-900 tracking-tight">
//               Archive
//             </h1>
//           </div>

//           <div className="relative w-full md:w-80 lg:w-96">
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//               size={16}
//             />
//             <input
//               type="text"
//               placeholder="Search vendor or invoice..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             />
//           </div>
//         </div>
//       </header>

//       <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
//         {/* --- CONTROLS BAR --- */}
//         <div className="mb-6 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-indigo-50 rounded-lg">
//               <Calendar size={14} className="text-indigo-600" />
//             </div>
//             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
//               Historical Data
//             </span>
//           </div>
//           <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
//             <Filter size={14} /> Filter
//           </button>
//         </div>

//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-20 gap-3">
//             <Loader2 className="animate-spin text-indigo-500" size={32} />
//             <p className="text-slate-400 font-bold">Synchronizing Archive...</p>
//           </div>
//         ) : (
//           <>
//             {/* --- TABLE VIEW: Hidden on Mobile (< 640px) --- */}
//             <div className="hidden sm:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
//               <table className="w-full text-left">
//                 <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
//                   <tr>
//                     <th className="px-8 py-5">Date</th>
//                     <th className="px-8 py-5">Vendor</th>
//                     <th className="px-8 py-5 hidden lg:table-cell">
//                       Invoice #
//                     </th>
//                     <th className="px-8 py-5">Total</th>
//                     <th className="px-8 py-5 text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {filtered.map((inv) => (
//                     <tr
//                       key={inv._id}
//                       className="hover:bg-slate-50/50 transition-colors group"
//                     >
//                       <td className="px-8 py-5 text-sm text-slate-500">
//                         {inv.date}
//                       </td>
//                       <td className="px-8 py-5">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-[10px]">
//                             {inv.vendor?.charAt(0)}
//                           </div>
//                           <span className="text-sm font-bold text-slate-800">
//                             {inv.vendor}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-8 py-5 text-xs font-mono text-slate-400 hidden lg:table-cell">
//                         {inv.invoiceNo}
//                       </td>
//                       <td className="px-8 py-5 text-sm font-black text-slate-900">
//                         ₹{inv.total}
//                       </td>
//                       <td className="px-8 py-5 text-right">
//                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <button className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg">
//                             <Download size={16} />
//                           </button>
//                           <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg">
//                             <ExternalLink size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* --- MOBILE CARD VIEW: Visible only on Mobile (< 640px) --- */}
//             <div className="sm:hidden space-y-4">
//               {filtered.map((inv) => (
//                 <div
//                   key={inv._id}
//                   className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.98] transition-transform"
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
//                         {inv.vendor?.charAt(0)}
//                       </div>
//                       <div>
//                         <h3 className="font-bold text-slate-900 leading-none mb-1">
//                           {inv.vendor}
//                         </h3>
//                         <p className="text-[11px] text-slate-400 font-mono uppercase">
//                           {inv.invoiceNo}
//                         </p>
//                       </div>
//                     </div>
//                     <p className="text-sm font-black text-slate-900">
//                       ₹{inv.total}
//                     </p>
//                   </div>

//                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
//                     <span className="text-[11px] text-slate-400 font-bold">
//                       {inv.date}
//                     </span>
//                     <div className="flex items-center gap-2">
//                       <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold">
//                         <Download size={14} /> PDF
//                       </button>
//                       <button className="p-1.5 text-slate-400 hover:text-slate-600">
//                         <ExternalLink size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {filtered.length === 0 && (
//               <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
//                 <p className="text-slate-400 font-medium italic">
//                   No results found for "{search}"
//                 </p>
//               </div>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getAuthHeaders } from "../config";
import {
  Search,
  Download,
  ExternalLink,
  ArrowLeft,
  Filter,
  Calendar,
  Loader2,
  Trash2,
  RefreshCcw,
} from "lucide-react";

export default function History() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllHistory();
  }, []);

  const fetchAllHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/invoices/history`, getAuthHeaders());
      // Newest first sorting
      const sortedData = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInvoices(sortedData);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESYNC LOGIC
  const handleResync = (inv) => {
    localStorage.setItem("invoice", JSON.stringify(inv));
    navigate("/map");
  };

  // ✅ DELETE LOGIC
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/invoices/${id}`, getAuthHeaders());
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete the record.");
    }
  };

  const handleViewFile = (filePath) => {
    if (!filePath) return alert("File path not found");
    const safePath = filePath.replace(/\\/g, "/");
    window.open(`${API_BASE_URL}/${safePath}`, "_blank");
  };

  const handleDownload = async (filePath, invoiceNo) => {
    try {
      const safePath = filePath.replace(/\\/g, "/");
      const response = await fetch(`${API_BASE_URL}/${safePath}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${invoiceNo || "Download"}.pdf`;
      link.click();
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed.");
    }
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.vendor?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 sm:px-8 sm:py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-slate-100 rounded-full shrink-0 transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Archive</h1>
          </div>

          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search vendor or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Calendar size={14} className="text-indigo-600" />
            </div>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Historical Data</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
            <Filter size={14} /> Filter
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-slate-400 font-bold">Synchronizing Archive...</p>
          </div>
        ) : (
          <>
            {/* --- TABLE VIEW (Desktop) --- */}
            <div className="hidden sm:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Vendor</th>
                    <th className="px-8 py-5 hidden lg:table-cell">Invoice #</th>
                    <th className="px-8 py-5">Total</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                        {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-[10px] uppercase">
                            {inv.vendor?.charAt(0) || "V"}
                          </div>
                          {inv.vendor}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-xs font-mono text-slate-400 hidden lg:table-cell">#{inv.invoiceNo}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900">₹{inv.total}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleResync(inv)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg" title="Resync">
                            <RefreshCcw size={16} />
                          </button>
                          <button onClick={() => handleDownload(inv.filePath, inv.invoiceNo)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg" title="Download">
                            <Download size={16} />
                          </button>
                          <button onClick={() => handleViewFile(inv.filePath)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg" title="View">
                            <ExternalLink size={16} />
                          </button>
                          <button onClick={() => handleDelete(inv._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE CARD VIEW --- */}
            <div className="sm:hidden space-y-4">
              {filtered.map((inv) => (
                <div key={inv._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold uppercase shrink-0 shadow-lg shadow-indigo-100">
                        {inv.vendor?.charAt(0) || "V"}
                      </div>
                      <div className="truncate">
                        <h3 className="font-black text-slate-900 leading-none mb-1 uppercase text-sm truncate max-w-35">{inv.vendor}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">#{inv.invoiceNo}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-slate-900">₹{inv.total}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleResync(inv)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl" title="Resync">
                        <RefreshCcw size={14} />
                      </button>
                      <button onClick={() => handleDownload(inv.filePath, inv.invoiceNo)} className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                        <Download size={14} />
                      </button>
                      <button onClick={() => handleDelete(inv._id)} className="p-2 bg-red-50 text-red-500 rounded-xl">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-slate-100 border-dashed">
                <p className="text-slate-400 font-bold italic">No results found for "{search}"</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}