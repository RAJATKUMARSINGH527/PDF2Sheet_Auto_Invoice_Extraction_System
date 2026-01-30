import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, getAuthHeaders } from "../config";
import { Link2, Save, ArrowRightLeft, Database, Edit3, Loader2 } from "lucide-react";

export default function ColumnMapper({ fields, email }) {
  const [mapping, setMapping] = useState({});
  const [saving, setSaving] = useState(false);
  const [customVendorName, setCustomVendorName] = useState("");

  // ✅ This is the "particular part" that ensures consistency
  useEffect(() => {
    console.log("🔄 [MAPPER] Fields changed, resetting internal state...");
    
    // Logic: If the AI extracted a vendor, use it. 
    // Otherwise, provide a generic fallback.
    if (fields && fields.vendor) {
      setCustomVendorName(fields.vendor);
    } else {
      setCustomVendorName("New Vendor");
    }

    // Reset mapping to prevent cross-invoice data contamination
    setMapping({}); 
    
  }, [fields]); // 👈 The hook re-runs every time 'fields' (the invoice) changes

  const handleChange = (field, col) => {
    setMapping((prev) => ({ ...prev, [field]: col }));
  };

  const saveMapping = async () => {
    // 1. Validation
    if (Object.keys(mapping).length === 0) {
      alert("Please map at least one field to a column.");
      return;
    }

    try {
      setSaving(true);

      
      const finalVendorName = customVendorName?.trim() || "New Vendor";

      // 2. Prepare Payload
      const payload = { 
        email, 
        vendorName: finalVendorName, 
        mapping 
      };

      console.log("📡 [MAPPER] Saving template:", payload);

     // 3. Request using Centralized API URL and Auth Headers
      const res = await axios.post(
        `${API_BASE_URL}/vendor/save`, 
        payload, 
        getAuthHeaders() // ✅ Centralized Auth & Standard Headers
      );

      if (res.data) {
        alert(`✅ Template saved for ${finalVendorName}!`);
        window.dispatchEvent(new Event("storage")); 
      }
    } catch (error) {
      // Direct correction of your error logging
      console.error("❌ Mapping Save Error:", error.response?.data || error.message);
      
      // If the error is specifically a 401, guide the user
      if (error.response?.status === 401) {
        alert("Session expired or No Token. Please log in again.");
      } else {
        alert(error.response?.data?.msg || "Failed to save mapping template");
      }
    } finally {
      setSaving(false);
    }
  };
  const columns = ["Invoice Number", "Date", "Total", "Vendor", "Notes"];

  // Safety check for empty fields
  if (!fields || Object.keys(fields).length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        <p className="text-xs font-black uppercase">Loading Fields...</p>
      </div>
    );
  }

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
            onChange={(e) => setCustomVendorName(e.target.value)}
            className="bg-transparent border-b border-indigo-200 focus:border-indigo-600 outline-none text-sm font-bold text-slate-700 w-full pb-1 transition-colors"
            placeholder="Enter Vendor Name..."
          />
          <Edit3 size={14} className="text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Scrollable Mapping Area */}
      <div className="flex-1 space-y-3 p-6 overflow-y-auto scrollbar-thin">
        {Object.keys(fields).map((field) => (
          <div
            key={field}
            className="group flex flex-col gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:bg-white transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={14} className="text-indigo-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Source Field</p>
              </div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Sheet Column</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-[11px] text-slate-500 italic bg-slate-100 px-2 py-0.5 rounded mt-1 truncate">
                  {fields[field] || "N/A"}
                </p>
              </div>

              <div className="flex-1 relative">
                <select
                  value={mapping[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 bg-white focus:ring-2 focus:ring-indigo-500 outline-none pr-8"
                >
                  <option value="">Select Column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <Database size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
          }`}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Finalize & Save Template</>}
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