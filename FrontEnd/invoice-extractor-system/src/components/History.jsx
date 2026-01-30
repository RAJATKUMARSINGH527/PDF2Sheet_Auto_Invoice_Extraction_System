import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getAuthHeaders } from "../config";
import { 
  Search, FileText, Download, ExternalLink, 
  ArrowLeft, Filter, ChevronRight, Calendar
} from "lucide-react";

export default function History() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/invoices/history`, getAuthHeaders());
        setInvoices(res.data);
      } catch (error) {
        console.error("History fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHistory();
  }, []);

  const filtered = invoices.filter(inv => 
    inv.vendor?.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Document Archive</h1>
        </div>
        
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
          <input 
            type="text" 
            placeholder="Search by vendor or invoice #..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-2xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
               <Calendar size={16} className="text-indigo-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Records</span>
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600">
               <Filter size={14} /> Sort & Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Vendor</th>
                  <th className="px-8 py-5">Invoice No</th>
                  <th className="px-8 py-5">Total</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-20 text-center text-slate-400 font-bold">Loading Archive...</td></tr>
                ) : filtered.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">{inv.date}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                          {inv.vendor?.charAt(0) || "V"}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{inv.vendor}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono text-slate-400">{inv.invoiceNo}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">₹{inv.total}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">Processed</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg"><Download size={16}/></button>
                         <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg"><ExternalLink size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}