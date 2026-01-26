import { useState } from "react";
import axios from "axios";

export default function ColumnMapper({ fields, email }) {
  const [mapping, setMapping] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (field, col) => {
    setMapping({ ...mapping, [field]: col });
  };

  const saveMapping = async () => {
    try {
      setSaving(true);
      await axios.post("http://localhost:5000/vendor/save", {
        email,
        vendorName: "Auto Detected Vendor",
        mapping
      });
      alert("✅ Vendor template saved! PDF2Sheet will auto-process next time.");
    } catch (error) {
  console.error(error);
  alert("❌ Failed to save mapping");
}
    setSaving(false);
  };

  const columns = ["Invoice Number", "Date", "Total", "Vendor", "Notes"];

  return (
    <div className="h-full flex flex-col">

      {/* Fields */}
      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {Object.keys(fields).map(field => (
          <div
            key={field}
            className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border transition"
          >
            <div>
              <p className="font-semibold text-gray-700 capitalize">{field}</p>
              <p className="text-sm text-gray-500 truncate max-w-37.5">
                {fields[field] || "Not detected"}
              </p>
            </div>

            <select
              onChange={(e) => handleChange(field, e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select column</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="border-t p-4 bg-white">
        <button
          onClick={saveMapping}
          disabled={saving}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            saving
              ? "bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {saving ? "Saving Template..." : "Save Vendor Template"}
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          This template will be auto-applied for future invoices from this vendor.
        </p>
      </div>
    </div>
  );
}
