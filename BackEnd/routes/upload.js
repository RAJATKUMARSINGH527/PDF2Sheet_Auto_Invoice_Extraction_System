const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth"); 
const Invoice = require("../models/Invoice");
const Vendor = require("../models/Vendor");
const User = require("../models/User"); // ADDED: Need this to get spreadsheetId
const { readPDF } = require("../services/pdfService");
const { extractFields } = require("../services/extractor");
const { appendInvoice } = require("../services/googleSheets");
const { sendSuccessEmail } = require("../services/email"); 

const upload = multer({ dest: "uploads/" });

const log = {
  step: (msg) => console.log(`\n🔹 ${msg}`),
  success: (msg) => console.log(`\x1b[32m✔ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m✖ ${msg}\x1b[0m`),
  data: (label, value) => console.log(`\x1b[36m${label}:\x1b[0m`, value)
};

router.post("/", auth, upload.single("pdf"), async (req, res) => {
  console.log("\n================ PDF2Sheet Auto ================");
  log.step("New invoice received");

  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const targetUserId = req.user?.id || req.user?.user?.id;
    if (!targetUserId) throw new Error("User ID not found in token");

    const safeFilePath = req.file.path.replace(/\\/g, "/");
    const senderEmail = (req.body.email || "unknown@vendor.com").trim().toLowerCase();

    const currentUser = await User.findById(targetUserId);
    if (!currentUser) throw new Error("User profile not found");

    log.data("User", currentUser.name);
    log.data("Sender Email", senderEmail);

    // 2. Read PDF & Extract
    log.step("Processing PDF...");
    const text = await readPDF(req.file.path);
    const fields = extractFields(text);
    log.data("AI Extracted Vendor", fields.vendor);

    // 3. SMART VENDOR CHECK (FIXED)
    const savedVendor = await Vendor.findOne({ 
      userId: targetUserId, 
      senderEmail,
      vendorName: fields.vendor 
    });

    let finalVendorName = fields.vendor;
    let confidence = fields.confidence;
    let needsMapping = true;

    if (savedVendor) {
      log.success(`Exact template match found for ${fields.vendor}`);
      finalVendorName = savedVendor.vendorName;
      confidence = 1.0;
      needsMapping = false; 
    } else if (fields.confidence >= 0.70) { // LOWERED THRESHOLD from 0.85 to 0.70 for better auto-sync
      log.success(`Acceptable AI confidence for: ${fields.vendor}`);
      needsMapping = false;
    } else {
      log.warn(`Low confidence (< 0.70) detected: ${fields.vendor}`);
      needsMapping = true;
    }

    // 4. DATA CLEANING (Added more robust cleaning)
    const cleanTotal = parseFloat(fields.total?.toString().replace(/[^\d.-]/g, "")) || 0;

    // 5. Save to MongoDB
    log.step("Saving to Database...");
    const invoice = await Invoice.create({
      userId: targetUserId,
      senderEmail,
      vendor: finalVendorName,
      invoiceNo: fields.invoiceNo || "N/A",
      date: fields.date || "N/A",
      total: cleanTotal,
      confidence,
      rawText: text,
      filePath: safeFilePath,
      status: needsMapping ? "pending" : "processed", // Explicit status
      needsMapping
    });

    // 6. Send Email
    try {
      await sendSuccessEmail(senderEmail, invoice);
    } catch (err) {
      log.warn(`Email skip: ${err.message}`);
    }

    // 7. Google Sheets Sync
    // This now triggers if confidence is okay OR if it was a saved vendor
    if (!needsMapping) {
      log.step("Syncing to Google Sheets...");
      try {
        const sheetToUse = currentUser.spreadsheetId || process.env.SPREADSHEET_ID;
        
        // Ensure appendInvoice handles the timestamp (as we fixed in the service file)
        await appendInvoice(sheetToUse, invoice);
        
        log.success("Personal Google Sheet updated with Timestamp");
      } catch (err) {
        log.error("Sheets error: " + err.message);
        // We don't crash the route if Sheets fails, just log it
      }
    } else {
      log.warn(`Skipping Sheets Sync: ${fields.vendor} requires manual mapping.`);
    }

    res.json({ success: true, invoice });

  } catch (error) {
    log.error("Route Error: " + error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;