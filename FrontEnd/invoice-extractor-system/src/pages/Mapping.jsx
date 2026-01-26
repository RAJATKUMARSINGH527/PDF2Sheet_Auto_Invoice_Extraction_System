import PDFViewer from "../components/PDFViewer";
import FieldList from "../components/FieldList";
import ColumnMapper from "../components/ColumnMapper";

export default function Mapping() {
  const invoice = JSON.parse(localStorage.getItem("invoice"));

  if (!invoice) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-gray-600">
        No invoice loaded. Please upload a PDF.
      </div>
    );
  }

  const fields = {
    invoiceNo: invoice.invoiceNo,
    date: invoice.date,
    total: invoice.total,
    vendor: invoice.vendor
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">

      {/* Header */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">PDF2Sheet Auto</h1>
        <p className="text-gray-500">
          Vendor: <span className="font-medium">{invoice.senderEmail}</span>
        </p>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">

        {/* PDF Viewer */}
        <div className="col-span-5 bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b px-4 py-2 font-semibold text-gray-700">
            Invoice Preview
          </div>
          <PDFViewer fileUrl={`http://localhost:5000/${invoice.filePath}`} />
        </div>

        {/* Detected Fields */}
        <div className="col-span-3 bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b px-4 py-2 font-semibold text-gray-700">
            Detected Fields
          </div>
          <FieldList fields={fields} />
        </div>

        {/* Column Mapping */}
        <div className="col-span-4 bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b px-4 py-2 font-semibold text-gray-700">
            Map to Google Sheets
          </div>
          <ColumnMapper fields={fields} email={invoice.senderEmail} />
        </div>

      </div>
    </div>
  );
}
