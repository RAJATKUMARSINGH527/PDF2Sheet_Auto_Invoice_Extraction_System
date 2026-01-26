const router = require("express").Router();
const multer = require("multer");
const fs = require("fs"); // Added for file cleanup
const upload = multer({ dest: "uploads/" });

const Invoice = require("../models/Invoice");
const { readPDF } = require("../services/pdfService");
const { extractFields } = require("../services/extractor");
const { appendInvoice } = require("../services/googleSheets");
const { sendLowConfidenceMail } = require("../services/email");

// Pretty log helpers
const log = {
  step: (msg) => console.log(`\n🔹 ${msg}`),
  success: (msg) => console.log(`\x1b[32m✔ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m✖ ${msg}\x1b[0m`),
  data: (label, value) => {
    console.log(`\x1b[36m${label}:\x1b[0m`, value);
  }
};

router.post("/upload", upload.single("pdf"), async (req, res) => {
  console.log("\n================ PDF2Sheet Auto ================");
  log.step("New invoice received");

  try {
    // 1️⃣ Validate file
    if (!req.file) {
      log.error("No PDF file received");
      return res.status(400).json({ error: "No PDF uploaded" });
    }
    
    log.success("PDF file uploaded");
    log.data("Sender email", req.body.email || "No email provided");

    // 2️⃣ Read PDF
    log.step("Extracting text from PDF...");
    const text = await readPDF(req.file.path);

    if (!text || text.trim().length < 10) {
       // Optional: Trigger OCR here if text is empty
       throw new Error("PDF contains no readable text. It might be a scanned image.");
    }

    log.success("Text extracted from PDF");

    // 3️⃣ Field Extraction
    log.step("Running invoice field extraction...");
    const fields = extractFields(text);
    log.data("Extracted fields", fields);

    // 4️⃣ Save to MongoDB
    log.step("Saving invoice to MongoDB...");
    const invoice = await Invoice.create({
      senderEmail: req.body.email,
      rawText: text,
      filePath: req.file.path,
      ...fields
    });

    log.success("Invoice saved to Database");

    // 5️⃣ Confidence Evaluation & Google Sheets Integration
    log.step("Evaluating extraction confidence...");

    // IMPORTANT: Always pull SPREADSHEET_ID from process.env inside the route
    // to ensure it is updated if the .env file was changed.
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    if (fields.confidence >= 0.75) {
      log.success(`High confidence (${fields.confidence}) → Sending to Sheets`);
      
      if (!SPREADSHEET_ID) {
        throw new Error("SPREADSHEET_ID is missing in .env file");
      }

      await appendInvoice(SPREADSHEET_ID, invoice);
      log.success("Data successfully pushed to Google Sheets");
    } else {
      log.warn(`Low confidence (${fields.confidence}) → Triggering Verification Email`);
      
      // Ensure your email service uses GMAIL_USER/GMAIL_PASS from .env
      await sendLowConfidenceMail(req.body.email, invoice);
      log.success("Verification email sent to: " + req.body.email);
    }

    res.json({ success: true, invoice });

  } catch (error) {
    log.error("Invoice processing failed");
    log.error(error.message);
    
    res.status(500).json({ 
      success: false, 
      error: "Processing failed", 
      details: error.message 
    });
  }
});

module.exports = router;