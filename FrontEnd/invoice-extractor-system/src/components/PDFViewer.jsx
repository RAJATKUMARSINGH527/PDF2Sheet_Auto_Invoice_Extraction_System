import { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  AlertCircle,
  Loader2,
  Download
} from "lucide-react";

export default function PDFViewer({ fileUrl }) {
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop() || "invoice.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!fileUrl || fileUrl.includes("undefined")) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 border-2 border-dashed border-slate-200 m-4 rounded-xl">
        <AlertCircle size={40} className="mb-2 opacity-20" />
        <p className="text-sm font-medium">No valid PDF source found</p>
      </div>
    );
  }

  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    fileUrl
  )}&embedded=true`;

  return (
    <div className="h-full flex flex-col bg-slate-50 relative group">

      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 opacity-90 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
          <div className="p-1.5 bg-indigo-600 rounded-lg">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
            Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoom(z => Math.max(50, z - 10))}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            type="button"
          >
            <ZoomOut size={18} />
          </button>

          <span className="text-xs font-mono font-bold text-indigo-600 min-w-10 text-center">
            {zoom}%
          </span>

          <button
            onClick={() => setZoom(z => Math.min(200, z + 10))}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            type="button"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="pl-4 border-l border-gray-200 flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-lg transition-all"
            title="Download PDF"
            type="button"
          >
            <Download size={18} />
          </button>

          <button
            onClick={() => window.open(fileUrl, "_blank")}
            className="p-1.5 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-lg transition-all"
            title="Open Original"
            type="button"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 flex justify-center p-8 pt-20 overflow-auto scrollbar-hide bg-slate-200/50">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm ring-1 ring-black/5 overflow-hidden relative min-h-200">

          {loading && !error && (
            <div className="absolute inset-0 z-20 bg-slate-50 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Initialising Renderer...
              </p>
            </div>
          )}

          {!error ? (
            <iframe
              key={`${fileUrl}-${zoom}`} // 👈 remounts on file change
              src={viewerUrl}
              className="w-full h-full min-h-200 border-none"
              onLoad={() => {
                setLoading(false);
                setError(false);
              }}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center z-10">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-red-500 font-bold text-lg">
                Failed to render PDF
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
