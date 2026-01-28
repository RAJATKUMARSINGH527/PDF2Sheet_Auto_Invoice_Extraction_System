import { useState, useEffect } from "react";
import axios from "axios";
import { Link2, Save, ArrowRightLeft, Database, Edit3 } from "lucide-react";

export default function ColumnMapper({ fields, email }) {
  const [mapping, setMapping] = useState({});
  const [saving, setSaving] = useState(false);
  const [customVendorName, setCustomVendorName] = useState(fields.vendor || "");

  // Debug: Log incoming fields
  console.log("[DEBUG] Incoming fields:", fields);

  // SYNC: Update vendor name if fields change
  useEffect(() => {
    console.log("[DEBUG] useEffect triggered with fields.vendor:", fields.vendor);
    if (fields.vendor) {
      setCustomVendorName(fields.vendor);
      console.log("[DEBUG] customVendorName set to:", fields.vendor);
    } else {
      console.log("[DEBUG] fields.vendor missing or empty");
    }
  }, [fields.vendor]);

  const handleChange = (field, col) => {
    console.log(`[DEBUG] Mapping changed: ${field} -> ${col}`);
    setMapping({ ...mapping, [field]: col });
  };

  const saveMapping = async () => {
    if (Object.keys(mapping).length === 0) {
      alert("Please map at least one field to a column.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      // Debug: Log current vendor name before saving
      console.log("[DEBUG] Saving mapping for vendor:", customVendorName);

      const finalVendorName =
        customVendorName.trim() === "" || customVendorName === "Auto-Detected"
          ? "New Vendor"
          : customVendorName;

      // Debug: Log final vendor name used in POST
      console.log("[DEBUG] Final vendor name to send:", finalVendorName);
      console.log("[DEBUG] Mapping to save:", mapping);

      await axios.post(
        "http://localhost:5000/vendor/save",
        { email, vendorName: finalVendorName, mapping },
        { headers: { "x-auth-token": token } }
      );

      alert(`✅ Configuration saved for ${finalVendorName}!`);
      console.log("[DEBUG] Mapping saved successfully");
    } catch (error) {
      console.error("Mapping Save Error:", error);
      alert(error.response?.data?.msg || "❌ Failed to save mapping");
    } finally {
      setSaving(false);
    }
  };

  const columns = ["Invoice Number", "Date", "Total", "Vendor", "Notes"];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 bg-indigo-50/50 border-b border-indigo-100">
        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
          Confirmed Vendor Name
        </label>
        <div className="flex items-center gap-2 group">
          <input
            type="text"
            value={customVendorName}
            onChange={(e) => {
              console.log("[DEBUG] Vendor input changed:", e.target.value);
              setCustomVendorName(e.target.value);
            }}
            className="bg-transparent border-b border-indigo-200 focus:border-indigo-600 outline-none text-sm font-bold text-slate-700 w-full pb-1 transition-colors"
            placeholder="Enter Vendor Name..."
          />
          <Edit3 size={14} className="text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Scrollable Mapping Area */}
      <div className="flex-1 space-y-3 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200">
        {Object.keys(fields).map((field) => (
          <div
            key={field}
            className="group flex flex-col gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:bg-white transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={14} className="text-indigo-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Source Field
                </p>
              </div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                Sheet Column
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-[11px] text-slate-500 truncate italic bg-slate-100 px-2 py-0.5 rounded mt-1">
                  {fields[field] || "N/A"}
                </p>
              </div>

              <div className="flex-1 relative">
                <select
                  value={mapping[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer transition-all shadow-sm pr-8"
                >
                  <option value="">Select Column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <Database
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 bg-white border-t border-slate-100">
        <button
          onClick={saveMapping}
          disabled={saving || Object.keys(mapping).length === 0}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
            saving || Object.keys(mapping).length === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]"
          }`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Syncing...
            </span>
          ) : (
            <>
              <Save size={18} />
              Finalize & Save Template
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Link2 size={12} className="text-indigo-400" />
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            Cloud Sync: <span className="text-slate-700 font-bold">Google Sheets API v4</span>
          </p>
        </div>
      </div>
    </div>
  );
}
