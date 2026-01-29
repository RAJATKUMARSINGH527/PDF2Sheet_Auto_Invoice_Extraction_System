import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  UploadCloud, FileText, LayoutDashboard, History, Settings, LogOut, 
  Plus, Search, TrendingUp, DollarSign, BarChart3, Loader2 
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. FIX: Initialize state directly to avoid "Variable used before declaration"
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : { name: "User Account", email: "" };
  });

  // 2. LIVE SYNC: Listen for changes from the Settings page
  useEffect(() => {
    const syncUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(updatedUser);
    };

    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // 3. Fetch History from Backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/invoices/history", {
          headers: { "x-auth-token": token }
        });
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
  }, []);

const analytics = useMemo(() => {
  // Use history.length directly to get the count of all fetched items
  const totalCount = history.length; 
  
  const totalSpendVal = history.reduce((a, b) => a + (parseFloat(b.total) || 0), 0);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentInvoices = history.filter(inv => new Date(inv.createdAt) > thirtyDaysAgo).length;
  
  return {
    count: totalCount, // Added this
    totalSpend: totalSpendVal.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
    monthlyGrowth: recentInvoices > 0 ? `+${recentInvoices} new this month` : "Stable volume",
    avgConfidence: history.length > 0 
      ? (history.reduce((a, b) => a + (parseFloat(b.confidence) || 0), 0) / history.length * 100).toFixed(1) 
      : "98.2"
  };
}, [history]); // This ensures it recalculates whenever history updates

  const filteredHistory = useMemo(() => {
    return history.filter(inv => 
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
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/upload/", form, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "x-auth-token": token 
        }
      });

      if (res.data.success) {
        localStorage.setItem("invoice", JSON.stringify(res.data.invoice));
        navigate("/map"); 
      }
    } catch (error) {
      alert(error.response?.data?.error || "Session expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-xl">P</span>
          </div>
          <span className="font-black text-lg tracking-tight">PDF2Sheet</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-100 transition-all">
            <LayoutDashboard size={20}/> Dashboard
          </button>
          <button onClick={() => navigate("/history")} className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">
            <History size={20}/> History
          </button>
          <button onClick={() => navigate("/reports")} className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">
            <BarChart3 size={20}/> Reports
          </button>
          <button onClick={() => navigate("/settings")} className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">
            <Settings size={20}/> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="flex items-center gap-3 text-slate-500 hover:text-rose-600 font-bold text-sm transition-colors w-full p-2 rounded-lg hover:bg-rose-50">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input 
              type="text" 
              placeholder="Search invoices or vendors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-bold">{currentUser.name}</p>
                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Workspace Member</p>
             </div>
             <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase">
                {currentUser.name?.charAt(0)}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={<FileText className="text-indigo-600"/>} 
              label="Total Invoices" 
              value={history.length} 
              trend={analytics.monthlyGrowth} 
            />
            <StatCard 
              icon={<DollarSign className="text-emerald-600"/>} 
              label="Total Spend" 
              value={`₹${analytics.totalSpend}`} 
              trend="Synced to Sheets" 
            />
            <StatCard 
              icon={<TrendingUp className="text-amber-600"/>} 
              label="AI Confidence" 
              value={`${analytics.avgConfidence}%`} 
              trend="High Accuracy" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e); }}
                className={`relative border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all ${
                  isDragging ? 'border-indigo-600 bg-indigo-50 scale-[1.01]' : 'border-slate-200 bg-white hover:border-indigo-400 shadow-sm'
                }`}
              >
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UploadCloud className={`w-10 h-10 transition-all ${loading ? 'text-slate-300' : 'text-indigo-600'}`} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Drop Document</h2>
                <p className="text-slate-500 mb-8 text-sm">Upload Invoice PDF for AI extraction</p>
                <input type="file" id="fileInput" hidden onChange={handleUpload} />
                <button 
                  onClick={() => document.getElementById('fileInput').click()}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18}/>}
                  {loading ? "Analysing..." : "Select File"}
                </button>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Invoice No</th>
                        <th className="px-6 py-4">Vendor</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHistory.map((inv) => (
                        <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">{inv.invoiceNo}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">{inv.vendor || "N/A"}</td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900">₹{(parseFloat(inv.total) || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                             <button 
                               onClick={() => {
                                 localStorage.setItem("invoice", JSON.stringify(inv));
                                 navigate("/map");
                               }}
                               className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                             >
                                <FileText size={16} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
                  <TrendingUp className="mb-4 opacity-50" size={32} />
                  <h4 className="font-black text-lg leading-tight mb-2 text-white">Google Sheets</h4>
                  <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">Auto-sync is currently active for your linked workspace.</p>
                  <button onClick={() => {
                    const id = localStorage.getItem('spreadsheet_id');
                    if (id) window.open(`https://docs.google.com/spreadsheets/d/${id}`, '_blank');
                    else alert("Spreadsheet ID not set in Settings.");
                  }} className="w-full bg-white text-indigo-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Open Sheet</button>
               </div>
               
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Status Monitor</h4>
                  <div className="space-y-6">
                     <StatusLine label="MongoDB Atlas" status="Live" />
                     <StatusLine label="Sheets API v4" status="Live" />
                     <StatusLine label="AI Extractor" status="Online" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// HELPER COMPONENTS
function StatCard({ icon, label, value, trend }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
      </div>
      {trend && (
        <p className="text-emerald-500 text-[10px] font-bold mt-4 flex items-center gap-1">
          <TrendingUp size={10} trend={trend} /> {trend}
        </p>
      )}
    </div>
  );
}

function StatusLine({ label, status }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-xs font-bold text-slate-600">{label}</span>
       <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{status}</span>
       </div>
    </div>
  );
}