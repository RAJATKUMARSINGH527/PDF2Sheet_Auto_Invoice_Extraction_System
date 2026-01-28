import { Hash, Calendar, Banknote, Building2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function FieldList({ fields }) {
  // Map icons to field keys for a more intuitive UI
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
    <div className="h-full flex flex-col bg-white">
      {/* Scrollable Data Area */}
      <div className="flex-1 p-1 space-y-3 overflow-y-auto">
        {Object.entries(fields).map(([key, value]) => (
          <div
            key={key}
            className="group relative flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              {/* Icon Container */}
              <div className={`p-2 rounded-lg ${value ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-500'}`}>
                {getIcon(key)}
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className={`mt-0.5 text-sm font-bold ${value ? "text-gray-800" : "text-red-500 italic"}`}>
                  {value || "Missing Data"}
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center">
              {value ? (
                <CheckCircle2 size={16} className="text-green-500 opacity-40 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="animate-pulse">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modern Footer Note */}
      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-indigo-100 rounded text-indigo-600">
            <CheckCircle2 size={12} />
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Verify the values above against the PDF preview. If any field is incorrect, you can manually override it during mapping.
          </p>
        </div>
      </div>
    </div>
  );
}