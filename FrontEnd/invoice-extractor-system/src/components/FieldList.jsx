export default function FieldList({ fields }) {
  return (
    <div className="h-full flex flex-col">

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {Object.entries(fields).map(([key, value]) => (
          <div
            key={key}
            className="bg-linear-to-r from-indigo-50 to-white border border-indigo-100 rounded-xl p-4 shadow-sm hover:shadow transition"
          >
            <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">
              {key}
            </p>

            <p className={`mt-1 text-lg font-bold ${
              value ? "text-gray-800" : "text-red-500"
            }`}>
              {value || "Not Detected"}
            </p>

            {!value && (
              <p className="text-xs text-red-400 mt-1">
                Manual mapping required
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t p-3 bg-gray-50 text-xs text-gray-500 text-center">
        AI-extracted fields from invoice PDF
      </div>

    </div>
  );
}
