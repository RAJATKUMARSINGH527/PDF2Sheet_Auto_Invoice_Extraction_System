import { useState, useEffect } from "react";
import axios from "axios";
import { UploadCloud, FileText, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [history, setHistory] = useState([]);

  // 1. Fetch History from MongoDB on load
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

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const form = new FormData();
    form.append("pdf", file);
    
    // Dynamically get the logged-in user's email
    const user = JSON.parse(localStorage.getItem("user"));
    form.append("email", user?.email || "rajatkumarsingh257@gmail.com");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/upload/", form, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "x-auth-token": token // Crucial for real JWT Auth
        }
      });

      if (res.data.success) {
        localStorage.setItem("invoice", JSON.stringify(res.data.invoice));

        if (res.data.invoice.needsMapping === false) {
          alert("✅ High confidence! Invoice processed automatically.");
          window.location = "/map";
        } else {
          window.location = "/map";
        }
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.response?.data?.error || "Upload failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 to-purple-700 flex flex-col items-center py-10 px-4">
      {/* Main Upload Card */}
      <div className="bg-white rounded-xl shadow-xl p-10 w-full max-w-xl text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">PDF2Sheet Auto</h1>
        <p className="text-gray-500 mt-2">Upload an invoice PDF and extract data automatically</p>

        <label className="mt-8 flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 rounded-lg p-10 cursor-pointer hover:bg-indigo-50 transition">
          <UploadCloud className="w-10 h-10 text-indigo-600 mb-3" />
          <p className="text-gray-700 font-semibold">
            {loading ? "Uploading..." : "Click to upload invoice or drag & drop"}
          </p>
          <input type="file" accept=".pdf" onChange={upload} hidden disabled={loading} />
        </label>

        {fileName && !loading && (
          <p className="mt-4 text-sm text-gray-600">Selected: <span className="font-medium">{fileName}</span></p>
        )}

        {loading && (
          <div className="mt-6">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 animate-pulse w-full"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">AI is reading your PDF...</p>
          </div>
        )}
        {/* Footer */}
        <p className="text-xs text-gray-400 mt-8">
          Secure • Automatic • No manual entry
        </p>
      </div>

      {/* 2. Recent Activity Table (History Section) */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Recent Invoices
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Invoice No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length > 0 ? history.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{inv.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">₹{inv.total}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                      <CheckCircle className="w-3 h-3" /> Processed
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No invoices processed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}