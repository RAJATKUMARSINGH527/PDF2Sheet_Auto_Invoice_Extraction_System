import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getAuthHeaders } from "../config";
import {
  UploadCloud,
  FileText,
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  BarChart3,
  Loader2,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [systemStatus, setSystemStatus] = useState({
    database: "Checking...",
    sheets: "Checking...",
    api: "Online",
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : { name: "User Account", email: "" };
  });

  useEffect(() => {
    const syncUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(updatedUser);
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/invoices/history`, getAuthHeaders());
        setHistory(res.data);
        setSystemStatus((prev) => ({ ...prev, database: "Live" }));
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setSystemStatus((prev) => ({ ...prev, database: "Offline" }));
      }
      const sId = localStorage.getItem("spreadsheet_id");
      setSystemStatus((prev) => ({ ...prev, sheets: sId ? "Live" : "Not Linked" }));
    };
    fetchHistory();
  }, [navigate]);

  const analytics = useMemo(() => {
    const totalCount = history.length;
    const totalSpendVal = history.reduce((a, b) => a + (parseFloat(b.total) || 0), 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentInvoices = history.filter((inv) => new Date(inv.createdAt) > thirtyDaysAgo).length;

    return {
      count: totalCount,
      totalSpend: totalSpendVal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      monthlyGrowth: recentInvoices > 0 ? `+${recentInvoices} new` : "Stable",
      avgConfidence: history.length > 0 ? ((history.reduce((a, b) => a + (parseFloat(b.confidence) || 0), 0) / history.length) * 100).toFixed(1) : "98.2",
    };
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter(
      (inv) =>
        inv.invoiceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file || file.type !== "application/pdf") return;
    setLoading(true);
    const form = new FormData();
    form.append("pdf", file);
    form.append("email", currentUser.email);
    try {
      const res = await axios.post(`${API_BASE_URL}/upload/`, form, {
        headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        localStorage.setItem("invoice", JSON.stringify(res.data.invoice));
        navigate("/map");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Extraction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 transform 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <span className="text-white font-black text-xl">P</span>
            </div>
            <span className="font-black text-lg tracking-tight">PDF2Sheet</span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <SidebarLink icon={<LayoutDashboard size={20}/>} label="Dashboard" active onClick={() => navigate("/dashboard")} />
          <SidebarLink icon={<History size={20}/>} label="History" onClick={() => navigate("/history")} />
          <SidebarLink icon={<BarChart3 size={20}/>} label="Reports" onClick={() => navigate("/reports")} />
          <SidebarLink icon={<Settings size={20}/>} label="Settings" onClick={() => navigate("/settings")} />
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="flex items-center gap-3 text-slate-500 hover:text-rose-600 font-bold text-sm transition-colors w-full p-2 rounded-lg hover:bg-rose-50">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* HEADER - Updated Username Fix */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600"><Menu size={20} /></button>
          </div>
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search invoices or vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Username Section: Now responsive and visible */}
            <div className="text-right">
              <p className="text-xs sm:text-sm font-bold truncate max-w-20 sm:max-w-37.5 text-slate-800">
                {currentUser.name}
              </p>
              <p className="text-[9px] sm:text-[10px] text-indigo-500 font-black uppercase tracking-widest leading-none">Pro Member</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase shrink-0 border-2 border-slate-50">
              {currentUser.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCard icon={<FileText className="text-indigo-600" />} label="Total Invoices" value={history.length} trend={analytics.monthlyGrowth} />
            <StatCard icon={<DollarSign className="text-emerald-600" />} label="Total Spend" value={`₹${analytics.totalSpend}`} trend="Sheets Synced" />
            <StatCard icon={<TrendingUp className="text-amber-600" />} label="AI Accuracy" value={`${analytics.avgConfidence}%`} trend="High Precision" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e); }}
                className={`relative border-2 border-dashed rounded-4xl sm:rounded-[2.5rem] p-8 sm:p-12 text-center transition-all ${isDragging ? "border-indigo-600 bg-indigo-50 scale-[1.01]" : "border-slate-200 bg-white hover:border-indigo-400 shadow-sm"}`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UploadCloud className={`w-8 h-8 sm:w-10 sm:h-10 transition-all ${loading ? "text-slate-300" : "text-indigo-600"}`} />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Drop Document</h2>
                <p className="text-slate-500 mb-6 sm:mb-8 text-xs sm:text-sm">Upload PDF for AI extraction</p>
                <input type="file" id="fileInput" hidden onChange={handleUpload} />
                <button onClick={() => document.getElementById("fileInput").click()} disabled={loading}
                  className="bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  {loading ? "Analysing..." : "Select File"}
                </button>
              </div>

              {/* ✅ RESPONSIVE RECENT ACTIVITY SECTION */}
              <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <History size={14} className="text-indigo-500" /> Recent Activity
                  </h3>
                  <button onClick={() => navigate("/history")} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">
                    View All
                  </button>
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left min-w-125">
                    <thead className="bg-white text-slate-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                      <tr>
                        <th className="px-6 py-4">Invoice</th>
                        <th className="px-6 py-4">Vendor</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHistory.slice(0, 5).map((inv) => (
                        <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 text-xs sm:text-sm font-bold text-slate-700">{inv.invoiceNo}</td>
                          <td className="px-6 py-4 text-xs sm:text-sm text-slate-500 font-medium">{inv.vendor || "N/A"}</td>
                          <td className="px-6 py-4 text-xs sm:text-sm font-black text-slate-900">₹{(parseFloat(inv.total) || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { localStorage.setItem("invoice", JSON.stringify(inv)); navigate("/map"); }} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg">
                              <FileText size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y divide-slate-50">
                  {filteredHistory.slice(0, 5).map((inv) => (
                    <div key={inv._id} onClick={() => { localStorage.setItem("invoice", JSON.stringify(inv)); navigate("/map"); }}
                      className="p-4 flex flex-col gap-3 active:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0">
                            {inv.vendor?.charAt(0) || "V"}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-black text-slate-800 leading-none truncate max-w-35 uppercase">
                              {inv.vendor || "Unknown Vendor"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-tighter">#{inv.invoiceNo}</p>
                          </div>
                        </div>
                        <p className="text-xs font-black text-slate-900 shrink-0">₹{(parseFloat(inv.total) || 0).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Success</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase">
                          Verify <ChevronRight size={12} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-600 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl shadow-indigo-200">
                <TrendingUp className="mb-4 opacity-50" size={32} />
                <h4 className="font-black text-lg mb-2 text-white">Google Sheets</h4>
                <p className="text-indigo-100 text-xs font-medium mb-6">Auto-sync is currently active for your linked workspace.</p>
                <button onClick={() => { const id = localStorage.getItem("spreadsheet_id"); if (id) window.open(`https://docs.google.com/spreadsheets/d/${id}`, "_blank"); else alert("Set ID in Settings."); }}
                  className="w-full bg-white text-indigo-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform">
                  Open Sheet
                </button>
              </div>

              <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Status Monitor</h4>
                <div className="space-y-6">
                  <StatusLine label="MongoDB" status={systemStatus.database} isLive={systemStatus.database === "Live"} />
                  <StatusLine label="Sheets API" status={systemStatus.sheets} isLive={systemStatus.sheets === "Live"} />
                  <StatusLine label="AI Extractor" status={systemStatus.api} isLive={systemStatus.api === "Online"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// SHARED MINI-COMPONENTS
function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-100"}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between transition-transform hover:scale-[1.02]">
      <div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4">{icon}</div>
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">{value}</h3>
      </div>
      <p className="text-emerald-500 text-[9px] sm:text-[10px] font-bold mt-4 flex items-center gap-1">
        <TrendingUp size={10} /> {trend}
      </p>
    </div>
  );
}

function StatusLine({ label, status, isLive }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] sm:text-xs font-bold text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLive ? "bg-emerald-500" : "bg-rose-500"}`}></div>
        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isLive ? "text-emerald-500" : "text-rose-500"}`}>
          {status}
        </span>
      </div>
    </div>
  );
}