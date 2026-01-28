exports.extractFields = (text) => {
  const fields = {
    invoiceNo: "N/A",
    total: "0.00",
    date: "N/A",
    vendor: "Auto-Detected Vendor", // default vendor
    confidence: 0,
  };

  // 1. INVOICE / ID PATTERNS
  const invoicePatterns = [
    /(?:Invoice|Bill|ID|Statement|No)\s*(?:No|#|Number)?[:\s\n]*([A-Z0-9-]+)/i,
    /Airtel\s*Black\s*ID\s*\n\s*(\d+)/i
  ];

  for (let pattern of invoicePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      fields.invoiceNo = match[1].trim();
      fields.confidence += 0.35;
      break;
    }
  }

  // 2. TOTAL AMOUNT PATTERNS
  const totalPatterns = [
    /(?:Total|Amount|Payable|Due|Balance|Grand\s*Total)[:\s\n]*(?:₹|Rs\.?|USD|\$)?\s*([\d,]+\.\d{2})/i,
    /₹\s*([\d,]+\.\d{1,3}(?:,\d{3})*\.\d{2})/ 
  ];

  for (let pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.total = match[1].replace(/,/g, '');
      fields.confidence += 0.35;
      break;
    }
  }

  // 3. DATE PATTERNS
  const datePatterns = [
    /(?:Date|Issued|Statement|Billing)[:\s\n]*(\d{1,2}[-\/\s](?:[a-z]{3,10}|\d{1,2})[-\/\s]\d{2,4})/i,
    /(\d{1,2}\s+[A-Z]{3,}\s+\d{4})/i
  ];

  for (let pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.date = match[1].trim();
      fields.confidence += 0.3;
      break;
    }
  }

  // 4. VENDOR DETECTION (common telecoms/utility example)
  if (/Airtel/i.test(text)) {
    fields.vendor = "Airtel";
    fields.confidence += 0.2;
  } else if (/Jio/i.test(text)) {
    fields.vendor = "Jio";
    fields.confidence += 0.2;
  } else if (/Vodafone|Vi/i.test(text)) {
    fields.vendor = "Vodafone/Vi";
    fields.confidence += 0.2;
  } else if (/BSNL/i.test(text)) {
    fields.vendor = "BSNL";
    fields.confidence += 0.2;
  }

  // Cap confidence at 1
  fields.confidence = Math.min(fields.confidence, 1);

  return fields;
};
