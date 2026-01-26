import { useState } from "react";
import axios from "axios";
import { UploadCloud } from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const form = new FormData();
    form.append("pdf", file);
    form.append("email", "vendor@gmail.com");

    try {
      const res = await axios.post("http://localhost:5000/upload", form);
      localStorage.setItem("invoice", JSON.stringify(res.data));
      window.location = "/map";
    } catch (error) {
      console.error(error);
      alert("Upload failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-linear-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-10 w-112.5 text-center">

        {/* Logo / Title */}
        <h1 className="text-3xl font-bold text-gray-800">PDF2Sheet Auto</h1>
        <p className="text-gray-500 mt-2">
          Upload an invoice PDF and extract data automatically
        </p>

        {/* Upload Box */}
        <label className="mt-8 flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 rounded-lg p-10 cursor-pointer hover:bg-indigo-50 transition">
          <UploadCloud className="w-10 h-10 text-indigo-600 mb-3" />
          <p className="text-gray-700 font-medium">
            Click to upload or drag & drop
          </p>
          <p className="text-sm text-gray-400 mt-1">PDF files only</p>
          <input type="file" accept=".pdf" onChange={upload} hidden />
        </label>

        {/* File name */}
        {fileName && (
          <p className="mt-4 text-sm text-gray-600">
            Selected: <span className="font-medium">{fileName}</span>
          </p>
        )}

        {/* Loader */}
        {loading && (
          <div className="mt-6">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 animate-pulse w-full"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Processing invoice...
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-8">
          Secure • Automatic • No manual entry
        </p>
      </div>
    </div>
  );
}
