import { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  ExternalLink,
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
      <div className="h-full min-h-75 flex flex-col items-center justify-center bg-slate-100 text-slate-400 border-2 border-dashed border-slate-200 m-4 rounded-2xl">
        <AlertCircle size={40} className="mb-2 opacity-20" />
        <p className="text-sm font-medium">No valid PDF source found</p>
      </div>
    );
  }

  // Google Docs Viewer URL
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    fileUrl,
  )}&embedded=true`;

  return (
    <div className="h-full flex flex-col bg-slate-50 relative group overflow-hidden">
      {/* --- RESPONSIVE FLOATING TOOLBAR --- */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-4 bg-white/95 backdrop-blur-md px-3 py-2 sm:px-4 rounded-xl sm:rounded-2xl shadow-xl border border-white/50 transition-all w-[92%] sm:w-auto justify-between sm:justify-start">
        {/* Brand/Label */}
        <div className="flex items-center gap-2 pr-2 sm:pr-4 border-r border-gray-200 shrink-0">
          <div className="p-1 sm:p-1.5 bg-indigo-600 rounded-lg shrink-0">
            <FileText className="w-3.5 h-3.5 sm:w-4 h-4 text-white" />
          </div>
          <span className="text-[9px] sm:text-xs font-black text-gray-700 uppercase tracking-tight">
            Preview
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 sm:p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            type="button"
          >
            <ZoomOut size={16} />
          </button>

          <span className="text-[10px] sm:text-xs font-mono font-black text-indigo-600 min-w-8 sm:min-w-10 text-center">
            {zoom}%
          </span>

          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="p-1 sm:p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            type="button"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pl-2 sm:pl-4 border-l border-gray-200 flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-all"
            title="Download PDF"
          >
            <Download size={16} />
          </button>

          <button
            onClick={() => window.open(fileUrl, "_blank")}
            className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-all"
            title="Open Original"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* --- PDF CONTAINER --- */}
      <div className="flex-1 flex justify-center p-2 sm:p-8 pt-16 sm:pt-20 overflow-auto scrollbar-hide bg-slate-200/50">
        <div
          style={{ width: `${zoom}%` }}
          className="max-w-full bg-white shadow-2xl rounded-lg ring-1 ring-black/5 overflow-hidden relative min-h-[60vh] sm:min-h-[80vh] transition-all duration-300"
        >
          {loading && !error && (
            <div className="absolute inset-0 z-20 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                Initialising Secure <br className="sm:hidden" /> PDF Renderer...
              </p>
            </div>
          )}

          {!error ? (
            <iframe
              key={`${fileUrl}-${zoom}`}
              src={viewerUrl}
              className="w-full h-full min-h-[60vh] sm:min-h-[80vh] border-none"
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
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <p className="text-red-500 font-black text-sm uppercase">
                Render Failed
              </p>
              <p className="text-slate-500 text-xs mt-2 mb-6">
                Google View service is unreachable
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
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
