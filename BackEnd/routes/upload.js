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
    const safeFilePath = req.file.path.replace(/\\/g, "/");
    const senderEmail = (req.body.email || "unknown@vendor.com").trim().toLowerCase();

    const currentUser = await User.findById(targetUserId);
    if (!currentUser) throw new Error("User profile not found");

    // 2. Read & Extract
    log.step("Processing PDF...");
    const text = await readPDF(req.file.path);
    const fields = extractFields(text);

    // 3. Smart Vendor Check (Low confidence check fixed)
    const savedVendor = await Vendor.findOne({ 
      userId: targetUserId, 
      senderEmail,
      vendorName: fields.vendor 
    });

    let finalVendorName = fields.vendor;
    let needsMapping = true;

    if (savedVendor) {
      log.success(`Exact template match found for ${fields.vendor}`);
      needsMapping = false; 
    } else if (fields.confidence >= 0.70) {
      log.success(`Acceptable AI confidence for: ${fields.vendor}`);
      needsMapping = false;
    }

    const cleanTotal = parseFloat(fields.total?.toString().replace(/[^\d.-]/g, "")) || 0;

    // 4. Save to Database
    const invoice = await Invoice.create({
      userId: targetUserId,
      senderEmail,
      vendor: finalVendorName,
      invoiceNo: fields.invoiceNo || "N/A",
      date: fields.date || "N/A",
      total: cleanTotal,
      confidence: fields.confidence,
      filePath: safeFilePath,
      needsMapping
    });

    // 5. Google Sheets Sync (Isse pehle rakho email se)
    if (!needsMapping) {
      log.step("Syncing to Google Sheets...");
      try {
        const sheetToUse = currentUser.spreadsheetId || process.env.SPREADSHEET_ID;
        await appendInvoice(sheetToUse, invoice, {}); // safeMapping empty pass karo agar extracted hai
        log.success("Google Sheet updated");
      } catch (err) {
        log.error("Sheets error: " + err.message);
      }
    }

    // 🔥 FIX 1: Frontend ko turant response bhej do (Loader ruk jayega)
    res.json({ success: true, invoice });

    // 🔥 FIX 2: Email ko BACKGROUND mein bhejo (Await hata diya)
    // Response bhejne ke BAAD email try karega
    sendSuccessEmail(senderEmail, invoice).catch(err => {
      log.warn(`Background Email skip: ${err.message}`);
    });

  } catch (error) {
    log.error("Route Error: " + error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;