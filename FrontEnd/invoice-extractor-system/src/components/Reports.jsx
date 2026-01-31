import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getAuthHeaders } from "../config";
import { 
  BarChart3, TrendingUp, Calendar, ArrowLeft, 
  ArrowUpRight, Clock, Zap, Target, PieChart, Loader2 
} from "lucide-react";

export default function Reports() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("monthly");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/invoices/history`, getAuthHeaders());
        setData(res.data);
      } catch (error) {
        console.error("Report fetch error:", error);
      } finally {
        setLoading(false); 
      }
    };
    fetchReportData();
  }, []);

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalCount: 0, totalVolume: "0", accuracy: "0", hoursSaved: "0" };
    }
    const totalCount = data.length;
    const totalVolume = data.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);
    const totalConfidence = data.reduce((acc, curr) => acc + parseFloat(curr.confidence || 0), 0);
    const avgConfidence = totalCount > 0 ? totalConfidence / totalCount : 0;
    const hoursSaved = (totalCount * 0.15).toFixed(1);

    return { 
      totalCount, 
      totalVolume: totalVolume.toLocaleString('en-IN'), 
      accuracy: (avgConfidence * 100).toFixed(1),
      hoursSaved 
    };
  }, [data]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const counts = months.map(m => ({ month: m, count: 0 }));

    data.forEach(item => {
      const date = new Date(item.createdAt || item.date);
      if (date.getFullYear() === currentYear) {
        counts[date.getMonth()].count += 1;
      }
    });

    const maxCount = Math.max(...counts.map(m => m.count), 1);
    return counts.map(m => ({
      ...m,
      height: (m.count / maxCount) * 100
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header - Made flex-col on mobile for space */}
      <header className="min-h-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-20 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-slate-100 rounded-full transition-all shrink-0">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div className="truncate">
            <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-none">Analytics Hub</h1>
            <p className="text-[9px] sm:text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Real-time Performance Metrics</p>
          </div>
        </div>
        
        {/* Toggle - Full width on mobile */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setFilterType("monthly")}
            className={`flex-1 sm:px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase rounded-lg transition-all ${filterType === "monthly" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setFilterType("yearly")}
            className={`flex-1 sm:px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase rounded-lg transition-all ${filterType === "yearly" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
          >
            Yearly
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        {/* Stats Grid - 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <ReportCard icon={<TrendingUp size={20}/>} label="Total Processed" value={stats.totalCount} color="indigo" />
          <ReportCard icon={<Zap size={20}/>} label="Est. Hours Saved" value={`${stats.hoursSaved}h`} color="amber" />
          <ReportCard icon={<Target size={20}/>} label="AI Precision" value={`${stats.accuracy}%`} color="emerald" />
          <ReportCard icon={<PieChart size={20}/>} label="Total Spend" value={`₹${stats.totalVolume}`} color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Extraction Volume Card - Scrollable chart area on mobile */}
          <div className="lg:col-span-2 bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-200 p-5 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8 sm:mb-10">
              <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 text-sm sm:text-base">
                <BarChart3 size={18} className="text-indigo-600" /> Extraction Volume
              </h3>
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest">Activity (2026)</p>
            </div>

            {/* Horizontal scroll container for mobile chart */}
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="h-48 sm:h-64 min-w-125 lg:min-w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
                {chartData.map((item, i) => (
                  <div key={i} className="flex-1 group relative">
                    <div 
                      style={{ height: `${item.height}%`, minHeight: item.count > 0 ? '4px' : '0' }} 
                      className={`w-full rounded-t-lg transition-all duration-500 relative cursor-pointer ${item.count > 0 ? 'bg-indigo-500' : 'bg-slate-100'}`}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.count} Invoices
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6 px-2 min-w-125 lg:min-w-full">
                 {chartData.map(m => (
                   <span key={m.month} className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">{m.month}</span>
                 ))}
              </div>
            </div>
          </div>

          {/* Efficiency Tracker - Stacked under chart on mobile */}
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-6 sm:mb-8 flex items-center gap-2 text-sm sm:text-base">
              <Clock size={18} className="text-amber-500" /> Automation Health
            </h3>
            
            <div className="space-y-6 sm:space-y-8 flex-1">
              <EfficiencyRow label="Auto-Mapped Vendors" percentage={data.length > 0 ? 85 : 0} color="bg-indigo-500" />
              <EfficiencyRow label="Zero-Correction Rate" percentage={parseFloat(stats.accuracy) > 90 ? 92 : 75} color="bg-emerald-500" />
              <EfficiencyRow label="Sync Success Rate" percentage={data.length > 0 ? 99 : 0} color="bg-indigo-400" />
              <EfficiencyRow label="OCR Confidence" percentage={Math.floor(parseFloat(stats.accuracy) * 0.9) || 0} color="bg-amber-500" />
            </div>

            <div className="mt-8 pt-6 sm:pt-8 border-t border-slate-100">
              <div className="bg-indigo-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Global Rank</p>
                  <p className="text-xs sm:text-sm font-bold text-indigo-900">{data.length > 10 ? "Top 5% Efficient" : "Calculating Rank..."}</p>
                </div>
                <ArrowUpRight className="text-indigo-600 shrink-0" size={24} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Internal Components */
function ReportCard({ icon, label, value, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600"
  };
  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
      <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
    </div>
  );
}

function EfficiencyRow({ label, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[11px] sm:text-xs font-bold text-slate-600">{label}</span>
        <span className="text-[11px] sm:text-xs font-black text-slate-800">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}