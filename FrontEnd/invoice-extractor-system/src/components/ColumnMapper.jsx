import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, getAuthHeaders } from "../config";
import {
  Link2,
  Save,
  ArrowRightLeft,
  Database,
  Edit3,
  Loader2,
} from "lucide-react";

export default function ColumnMapper({ fields, email }) {
  const [mapping, setMapping] = useState({});
  const [saving, setSaving] = useState(false);
  const [customVendorName, setCustomVendorName] = useState("");

  useEffect(() => {
    console.log("🔄 [MAPPER] Fields changed, resetting internal state...");

    if (fields && fields.vendor) {
      setCustomVendorName(fields.vendor);
    } else {
      setCustomVendorName("New Vendor");
    }

    setMapping({});
  }, [fields]);

  const handleChange = (field, col) => {
    setMapping((prev) => ({ ...prev, [field]: col }));
  };

  const saveMapping = async () => {
    if (Object.keys(mapping).length === 0) {
      alert("Please map at least one field to a column.");
      return;
    }

    try {
      setSaving(true);
      const finalVendorName = customVendorName?.trim() || "New Vendor";
      const payload = {
        email,
        vendorName: finalVendorName,
        mapping,
      };

      const res = await axios.post(
        `${API_BASE_URL}/vendor/save`,
        payload,
        getAuthHeaders(),
      );

      if (res.data) {
        alert(`✅ Template saved for ${finalVendorName}!`);
        window.dispatchEvent(new Event("storage"));
      }
    } catch (error) {
      console.error(
        "❌ Mapping Save Error:",
        error.response?.data || error.message,
      );
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        alert(error.response?.data?.msg || "Failed to save mapping template");
      }
    } finally {
      setSaving(false);
    }
  };

  const columns = ["Invoice Number", "Date", "Total", "Vendor"];

  if (!fields || Object.keys(fields).length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
        <Loader2 className="animate-spin mb-2" size={24} />
        <p className="text-[10px] font-black uppercase tracking-widest">
          Loading Fields...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="px-4 py-4 sm:px-6 bg-indigo-50/50 border-b border-indigo-100 shrink-0">
        <label className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
          Confirmed Vendor Name
        </label>
        <div className="flex items-center gap-2 group">
          <input
            type="text"
            value={customVendorName}
            onChange={(e) => setCustomVendorName(e.target.value)}
            className="bg-transparent border-b border-indigo-200 focus:border-indigo-600 outline-none text-xs sm:text-sm font-bold text-slate-700 w-full pb-1 transition-colors"
            placeholder="Enter Vendor Name..."
          />
          <Edit3
            size={14}
            className="text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      {/* Scrollable Mapping Area */}
      <div className="flex-1 space-y-3 p-4 sm:p-6 overflow-y-auto scrollbar-thin bg-white">
        {Object.keys(fields).map((field) => (
          <div
            key={field}
            className="group flex flex-col gap-3 p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl hover:border-indigo-300 hover:bg-white transition-all shadow-sm"
          >
            {/* Field Labels */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ArrowRightLeft size={12} className="text-indigo-500" />
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Source Field
                </p>
              </div>
              <p className="text-[8px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                Sheet Column
              </p>
            </div>

            {/* Field Content - Grid-like on mobile, Flex on desktop */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-full sm:flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800 capitalize truncate">
                  {field.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 italic bg-slate-100 px-2 py-0.5 rounded mt-1 truncate max-w-50 sm:max-w-none">
                  {fields[field] || "N/A"}
                </p>
              </div>

              {/* Selector Container - Fixed for Mobile/Tablet */}
              <div className="w-full sm:flex-1 relative z-30">
                <select
                  value={mapping[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-2 text-[12px] sm:text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none pr-10 cursor-pointer active:scale-[0.98] transition-all shadow-sm"
                >
                  <option value="" className="text-slate-400">
                    Select Column
                  </option>
                  {columns.map((col) => (
                    <option
                      key={col}
                      value={col}
                      className="py-2 text-slate-700"
                    >
                      {col}
                    </option>
                  ))}
                </select>

                {/* Database Icon - Centered correctly */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Database size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Stays at bottom */}
      <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0">
        <button
          onClick={saveMapping}
          disabled={saving || Object.keys(mapping).length === 0}
          className={`w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 ${
            saving || Object.keys(mapping).length === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
          }`}
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Save size={18} /> Finalize & Save Template
            </>
          )}
        </button>

        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
          <Link2 size={10} className="text-indigo-400" />
          <p className="text-[8px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">
            Cloud Sync:{" "}
            <span className="text-slate-700 font-bold">
              Google Sheets API v4
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
