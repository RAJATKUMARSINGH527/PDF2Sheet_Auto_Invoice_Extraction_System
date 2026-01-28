const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth"); 
const Invoice = require("../models/Invoice");
const Vendor = require("../models/Vendor");
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

    // 1. Identify User
    const targetUserId = req.user?.id || req.user?.user?.id;
    if (!targetUserId) throw new Error("User ID not found in token");

    // 2. Normalize Inputs
    const safeFilePath = req.file.path.replace(/\\/g, "/");
    const senderEmail = (req.body.email || "unknown@vendor.com").trim().toLowerCase();

    log.data("User ID", targetUserId);
    log.data("Sender Email", senderEmail);
    log.data("File", safeFilePath);

    // 3. Read PDF
    log.step("Extracting text from PDF...");
    const text = await readPDF(req.file.path);
    if (!text || text.trim().length < 10) throw new Error("PDF has no readable text");

    // 4. Extract fields
    log.step("Extracting fields from PDF...");
    const fields = extractFields(text);
    log.data("Extracted Fields", fields);

    // 5. Check DB for saved vendor
    log.step("Checking vendor mapping...");
    const savedVendor = await Vendor.findOne({ userId: targetUserId, senderEmail });

    let finalVendorName = "Auto-Detected Vendor";
    let confidence = fields.confidence || 0;
    let needsMapping = true;

    if (savedVendor) {
      log.success(`Vendor template found for ${senderEmail}`);
      finalVendorName = savedVendor.vendorName;
      confidence = 1;
      needsMapping = false;
    } else if (fields.vendor && !fields.vendor.toLowerCase().includes("auto-detected")) {
      // PDF parsing gives a confident vendor
      finalVendorName = fields.vendor;
      confidence = 0.8; // Medium confidence
      needsMapping = true;
      log.success(`Vendor detected from PDF: ${finalVendorName}`);
    } else {
      // PDF could not detect vendor → fallback
      finalVendorName = "Auto-Detected Vendor";
      confidence = 0;
      needsMapping = true;
      log.warn("Vendor could not be confidently detected, using Auto-Detected Vendor");
    }

    log.data("Final Vendor Name", finalVendorName);
    log.data("Confidence", confidence);
    log.data("Needs Mapping", needsMapping);

    // 6. Save invoice
    log.step("Saving invoice to MongoDB...");
    const invoice = await Invoice.create({
      userId: targetUserId,
      senderEmail,
      vendor: finalVendorName,
      invoiceNo: fields.invoiceNo || "N/A",
      date: fields.date || "N/A",
      total: fields.total || "0.00",
      confidence,
      rawText: text,
      filePath: safeFilePath,
      status: "pending",
      needsMapping
    });

    log.success("Invoice saved");

    // 7. Send confirmation email
    try {
      await sendSuccessEmail(senderEmail, invoice);
      log.success(`Confirmation email sent to ${senderEmail}`);
    } catch (err) {
      log.warn(`Failed to send email: ${err.message}`);
    }

    // 8. Sheets sync if confident
    if (!needsMapping) {
      log.step("High confidence → syncing to Google Sheets");
      try {
        await appendInvoice(process.env.SPREADSHEET_ID, invoice);
        invoice.status = "processed";
        await invoice.save();
        log.success("Google Sheets updated");
      } catch (err) {
        log.warn("Sheets sync failed: " + err.message);
      }
    }

    // 9. Respond
    res.json({ success: true, invoice: { ...invoice._doc, filePath: safeFilePath } });

  } catch (error) {
    log.error("Upload route error: " + error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
