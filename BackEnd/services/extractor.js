exports.extractFields = (text) => {
  const fields = {
    invoiceNo: "N/A",
    total: "0.00",
    date: "N/A",
    confidence: 0,
  };

  // 1. INVOICE / ID PATTERNS (Works for Bill No, Invoice #, ID, etc.)
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

  // 2. TOTAL AMOUNT PATTERNS (Works for Total, Payable, Amount Due, etc.)
  const totalPatterns = [
    /(?:Total|Amount|Payable|Due|Balance|Grand\s*Total)[:\s\n]*(?:₹|Rs\.?|USD|\$)?\s*([\d,]+\.\d{2})/i,
    /₹\s*([\d,]+\.\d{2})/ 
  ];

  for (let pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.total = match[1].replace(/,/g, '');
      fields.confidence += 0.35;
      break;
    }
  }

  // 3. DATE PATTERNS (Works for 05 Nov 2025, 05/11/2025, etc.)
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

  return fields;
};