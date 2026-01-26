const fs = require("fs");
// Use the fork which is patched for Node 22 "Class constructor" errors
const pdf = require("pdf-parse-fork");

const log = (title, data) => {
  console.log("\n================ PDF2Sheet Auto PDF Service ================\n");
  console.log(`📌 ${title}`);
  if (typeof data === "string" && data.length > 500) {
    console.log(data.substring(0, 500) + "...\n");
  } else {
    console.log(data, "\n");
  }
  console.log("============================================================\n");
};

exports.readPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    log("📁 Reading PDF from path", filePath);
    const buffer = fs.readFileSync(filePath);
    
    log("✅ File read successfully", `Size: ${buffer.length} bytes`);

    console.log("🔹 Parsing PDF text...");

    // pdf-parse-fork handles the "new" constructor internally for Node 22 compatibility
    const pdfData = await pdf(buffer);

    if (!pdfData || !pdfData.text) {
      throw new Error("PDF parsing returned no data");
    }

    const cleanText = pdfData.text.trim();
    
    if (cleanText.length === 0) {
      throw new Error("PDF contains no selectable text (it might be a scanned image)");
    }

    log("📝 Extracted PDF Text (preview)", cleanText);

    console.log("✔ PDF text extraction completed successfully");
    return cleanText;

  } catch (error) {
    console.error("\n❌ PDF reading/parsing failed!");
    console.error("Error Message:", error.message);
    // Log the stack trace to catch exactly where the constructor error happens if it persists
    if (error.message.includes('constructor')) {
        console.error("Stack Trace:", error.stack);
    }
    throw error; 
  }
};