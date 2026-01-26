import { useState } from "react";

export default function PDFViewer({ fileUrl }) {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="h-full flex flex-col bg-white">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <p className="font-semibold text-gray-700">Invoice Preview</p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(50, z - 10))}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
          >−</button>

          <span className="text-sm text-gray-600">{zoom}%</span>

          <button
            onClick={() => setZoom(z => Math.min(150, z + 10))}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
          >+</button>
        </div>
      </div>

      {/* PDF Frame */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <iframe
          src={`${fileUrl}#zoom=${zoom}`}
          title="PDF"
          className="w-full h-full border-none"
        />
      </div>

    </div>
  );
}
