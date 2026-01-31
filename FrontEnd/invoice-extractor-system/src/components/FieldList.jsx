import { useEffect } from "react";
import {
  Hash,
  Calendar,
  Banknote,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function FieldList({ fields }) {
  useEffect(() => {
    console.log("🔄 [FieldList] Data Reset/Updated:", fields);
  }, [fields]);

  if (!fields || Object.keys(fields).length === 0) {
    return (
      <div className="h-full min-h-50 flex flex-col items-center justify-center bg-slate-50 p-6 text-slate-400">
        <Loader2 className="animate-spin mb-3 text-indigo-500" size={28} />
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
          Awaiting Data...
        </p>
      </div>
    );
  }

  const getIcon = (key) => {
    switch (key.toLowerCase()) {
      case "invoiceno": return <Hash size={16} />;
      case "date": return <Calendar size={16} />;
      case "total": return <Banknote size={16} />;
      case "vendor": return <Building2 size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (

    <div className="h-full flex flex-col bg-slate-50/50 overflow-hidden " >
      
    
      <div className="flex-1 px-5 py-6 sm:px-8 sm:py-8 space-y-4 overflow-y-auto scrollbar-hide">
        {Object.entries(fields).map(([key, value]) => (
          <div
            key={key}
            className="group flex items-center justify-between p-4 rounded-2xl border border-white bg-white shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
          >
            <div className="flex items-center gap-4 overflow-hidden">
          
              <div
                className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                  value ? "bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white" : "bg-rose-50 text-rose-500"
                }`}
              >
                {getIcon(key)}
              </div>

              <div className="overflow-hidden">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>

                <p className={`mt-2 text-xs sm:text-sm font-bold truncate ${value ? "text-slate-800" : "text-rose-500 italic"}`}>
                  {value || "Missing Data"}
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="shrink-0 ml-2">
              {value ? (
                <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
              ) : (
                <AlertCircle size={16} className="text-rose-400 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 sm:p-8 bg-transparent">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-3">
          <div className="shrink-0 p-1 bg-indigo-50 rounded-lg text-indigo-600">
            <CheckCircle2 size={14} />
          </div>
          <p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-500 font-medium">
            Verify AI-extracted data against the PDF. Manual corrections are saved automatically.
          </p>
        </div>
      </div>
    </div>
  );
}