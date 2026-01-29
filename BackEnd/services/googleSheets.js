const { google } = require("googleapis");
require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const sheets = google.sheets({
  version: "v4",
  auth: oAuth2Client,
});

exports.appendInvoice = async (userSpreadsheetId, invoice) => {
  try {
    const targetId = (userSpreadsheetId || process.env.SPREADSHEET_ID || "").trim();

    if (!targetId) {
      throw new Error("No Google Spreadsheet ID found for this user.");
    }

    // DEBUG LOG: Ensure we see what is being sent to Sheets
    console.log(`\x1b[36m[Sheets Service]:\x1b[0m Syncing ${invoice.vendor || 'Unknown'} to ID: ${targetId}`);

    // Create current timestamp
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN'); // DD/MM/YYYY
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. DATA EXTRACTION: Robust handling for Airtel (mapping) vs Amazon (standard)
    // This ensures data is never "undefined" which can cause column shifts
    const row = [
      invoice.invoiceNo || (invoice.mapping ? invoice.mapping.invoiceNo : "N/A"),
      invoice.date || (invoice.mapping ? invoice.mapping.date : "N/A"),
      invoice.total || (invoice.mapping ? invoice.mapping.total : 0),
      invoice.senderEmail || "N/A",
      invoice.vendor || (invoice.mapping ? invoice.mapping.vendorName : "Unknown Vendor"),
      dateStr, // Column F
      timeStr  // Column G
    ];

    // 2. APPEND CALL: Use A:G range
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: targetId,
      range: "Sheet1!A:G", // Ensure your sheet has columns up to G
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    console.log(`\x1b[32m✔ Row added at ${timeStr}\x1b[0m`);
    return response;

  } catch (err) {
    const errMsg = err.response?.data?.error?.message || err.message;
    console.error("❌ Sheets Sync Failed:", errMsg);
    throw new Error(errMsg);
  }
};