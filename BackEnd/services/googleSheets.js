const { google } = require("googleapis");
require("dotenv").config();

// Initialize OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const sheets = google.sheets({
  version: "v4",
  auth: oAuth2Client,
});

/**
 * Appends invoice data to a Google Sheet
 */
exports.appendInvoice = async (spreadsheetId, invoice) => {
  try {
    // 1. Clean the ID (Force it from .env to be 100% sure)
    const targetId = (process.env.SPREADSHEET_ID || spreadsheetId || "").trim();

    if (!targetId) {
      throw new Error("Spreadsheet ID is missing from .env");
    }

    console.log(`\x1b[36m[Sheets Service]:\x1b[0m Pushing to ID: ${targetId}`);

    // 2. Prepare the data row
    const row = [
      invoice.invoiceNo || "N/A",
      invoice.date || "N/A",
      invoice.total || "0.00",
      invoice.senderEmail || "N/A",
      invoice.vendor || "Airtel",
      new Date().toLocaleString()
    ];

    // 3. The Append Call
    // IMPORTANT: Make sure the tab at the bottom of your sheet is named EXACTLY 'Sheet1'
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: targetId,
      range: "Sheet1!A:F", // Points to columns A to F on tab "Sheet1"
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    console.log("✔ Row successfully added to Google Sheets");
    return response;

  } catch (err) {
    const errMsg = err.response?.data?.error?.message || err.message;
    
    console.error("❌ Google Sheets Error Details:", errMsg);

    if (errMsg.includes("Requested entity was not found")) {
      console.log("\n\x1b[41m CRITICAL CHECK \x1b[0m");
      console.log("The File ID is correct (testSheets.js proved it).");
      console.log("The problem is the TAB NAME at the bottom of your Google Sheet.");
      console.log("👉 ACTION: Rename the tab at the bottom to exactly 'Sheet1' (No spaces!)");
      console.log("\x1b[41m----------------\x1b[0m\n");
    }

    throw new Error(errMsg);
  }
};