// const { google } = require("googleapis");
// require("dotenv").config();

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// oAuth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// });

// const sheets = google.sheets({
//   version: "v4",
//   auth: oAuth2Client,
// });

// exports.appendInvoice = async (userSpreadsheetId, invoice) => {
//   try {
//     const targetId = (userSpreadsheetId || process.env.SPREADSHEET_ID || "").trim();

//     if (!targetId) {
//       throw new Error("No Google Spreadsheet ID found for this user.");
//     }

//     // DEBUG LOG: Ensure we see what is being sent to Sheets
//     console.log(`\x1b[36m[Sheets Service]:\x1b[0m Syncing ${invoice.vendor || 'Unknown'} to ID: ${targetId}`);


//     const now = new Date();
//     const dateStr = now.toLocaleDateString('en-IN'); // DD/MM/YYYY
//     const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

//     // 1. DATA EXTRACTION: 
//     // This ensures data is never "undefined" which can cause column shifts
//     const row = [
//       invoice.invoiceNo || (invoice.mapping ? invoice.mapping.invoiceNo : "N/A"),
//       invoice.date || (invoice.mapping ? invoice.mapping.date : "N/A"),
//       invoice.total || (invoice.mapping ? invoice.mapping.total : 0),
//       invoice.senderEmail || "N/A",
//       invoice.vendor || (invoice.mapping ? invoice.mapping.vendorName : "Unknown Vendor"),
//       dateStr, // Column F
//       timeStr  // Column G
//     ];

//     // 2. APPEND CALL: 
//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: targetId,
//       range: "Sheet1!A:G",
//       valueInputOption: "USER_ENTERED",
//       insertDataOption: "INSERT_ROWS",
//       requestBody: {
//         values: [row],
//       },
//     });

//     console.log(`\x1b[32m✔ Row added at ${timeStr}\x1b[0m`);
//     return response;

//   } catch (err) {
//     const errMsg = err.response?.data?.error?.message || err.message;
//     console.error("❌ Sheets Sync Failed:", errMsg);
//     throw new Error(errMsg);
//   }
// };


const { google } = require("googleapis");
require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

exports.appendInvoice = async (userSpreadsheetId, invoiceData, mapping) => {
  try {
    const targetId = (userSpreadsheetId || process.env.SPREADSHEET_ID || "").trim();
    if (!targetId) throw new Error("No Spreadsheet ID found.");

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN');

    // ✅ YAHAN DALO: Mapping agar undefined ho toh empty object ban jaye
    const safeMapping = mapping || {}; 

    const columns = ["Invoice Number", "Date", "Total", "Vendor"];
    
    const row = columns.map(colName => {
      // ✅ AB YAHAN safeMapping USE KARO
      const fieldKey = Object.keys(safeMapping).find(key => safeMapping[key] === colName);
      
      if (fieldKey && invoiceData[fieldKey]) {
        return invoiceData[fieldKey];
      }

      // Fallback logic (Amazon fix ke saath)
      if (colName === "Vendor") return invoiceData.vendor || invoiceData.vendorName || "N/A";
      if (colName === "Invoice Number") return invoiceData.invoiceNo || "N/A";
      if (colName === "Date") return invoiceData.date || "N/A";
      if (colName === "Total") return invoiceData.total || "0";

      return "N/A";
    });

    row.push(invoiceData.senderEmail || "N/A", dateStr, timeStr);

    console.log("🚀 Final Row to Sheets:", row); 

    return await sheets.spreadsheets.values.append({
      spreadsheetId: targetId,
      range: "Sheet1!A:G",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
  } catch (err) {
    console.error("❌ Sheets Service Error:", err.message);
    throw new Error(err.message);
  }
};