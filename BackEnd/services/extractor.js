exports.extractFields = (text) => {
  const fields = {
    invoiceNo: "N/A",
    total: "0.00",
    date: "N/A",
    vendor: "Auto-Detected Vendor",
    confidence: 0,
  };

  // --- 1. VENDOR DETECTION ---
  if (/Amazon|ASSPL|Amazon\.in/i.test(text)) {
    fields.vendor = "Amazon";
    fields.confidence += 0.4;
  } else if (/Airtel/i.test(text)) {
    fields.vendor = "Airtel";
    fields.confidence += 0.4;
  } else if (/Zomato/i.test(text)) {
    fields.vendor = "Zomato";
    fields.confidence += 0.4;
  } else if (/Swiggy/i.test(text)) {
    fields.vendor = "Swiggy";
    fields.confidence += 0.4;
  } else if (/Vodafone|Vi/i.test(text)) {
    fields.vendor = "Vi (Vodafone Idea)";
    fields.confidence += 0.4;
  }

  // --- 2. INVOICE NUMBER ---
  const invoicePatterns = [
    /(?:Invoice Number|Invoice No)[:\s]+([A-Z0-9-]+)/i, // Amazon/Standard
    /Airtel\s*Black\s*ID\s*(\d+)/i,                     // Airtel
    /(?:Inv|Bill|Ref|Statement)\s*(?:No|#|Num)?[:\s\n]*([A-Z0-9/-]+)/i
  ];

  for (let pattern of invoicePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 4) {
      fields.invoiceNo = match[1].trim();
      fields.confidence += 0.3;
      break;
    }
  }

  // --- 3. TOTAL AMOUNT (Smart Max Logic) ---
  const totalPatterns = [
    /(?:Total\s*Payable|Grand\s*Total|Amount\s*Due|Total\s*Amount|Total)[:\s\n]*(?:₹|Rs\.?|USD|\$)?\s*([\d,]+\.\d{2})/gi,
    /₹\s*([\d,]+\.\d{2})/g 
  ];

  let foundTotals = [];
  for (let pattern of totalPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(val)) foundTotals.push(val);
      }
    }
  }

  if (foundTotals.length > 0) {
    // We pick the HIGHEST number found near keywords to avoid tax components (like 2.08)
    fields.total = Math.max(...foundTotals).toFixed(2);
    fields.confidence += 0.3;
  }

  // --- 4. DATE ---
  const datePatterns = [
    /(?:Date|Issued|Statement|Billing)[:\s\n]*(\d{1,2}[-\/\s](?:[a-z]{3,10}|\d{1,2})[-\/\s]\d{2,4})/i,
    /(\d{2}\.\d{2}\.\d{4})/
  ];

  for (let pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.date = match[1].trim();
      fields.confidence += 0.1;
      break;
    }
  }

  fields.confidence = Math.min(fields.confidence, 1);
  return fields;
};