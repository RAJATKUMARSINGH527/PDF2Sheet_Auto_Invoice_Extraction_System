exports.extractFields = (text) => {
  const fields = {
    invoiceNo: "N/A",
    total: "0.00",
    date: "N/A",
    vendor: "Auto-Detected Vendor",
    confidence: 0,
  };

  try {
    // 1. CLEAN TEXT: Standardize spacing and remove newlines
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // 2. COMPREHENSIVE VENDOR DETECTION
    // (Logic simplified for readability, word boundaries \b are essential)
    if (/\bAmazon\b|ASSPL|Amazon\.in/i.test(cleanText)) {
      fields.vendor = "Amazon";
    } else if (/\bFlipkart\b|Instakart/i.test(cleanText)) {
      fields.vendor = "Flipkart";
    } else if (/\bMeesho\b|Fashnear/i.test(cleanText)) {
      fields.vendor = "Meesho";
    } else if (/\bMyntra\b/i.test(cleanText)) {
      fields.vendor = "Myntra";
    } else if (/\bAjio\b|Reliance Retail/i.test(cleanText)) {
      fields.vendor = "Ajio";
    } else if (/\bBig\s?Basket\b|Supermarket Grocery/i.test(cleanText)) {
      fields.vendor = "Big Basket";
    } else if (/\bNykaa\b|FSN E-Commerce/i.test(cleanText)) {
      fields.vendor = "Nykaa";
    } else if (/\bAirtel\b|Bharti\b/i.test(cleanText)) {
      fields.vendor = "Airtel";
    } else if (/\bJio\b|Reliance Infocomm/i.test(cleanText)) {
      fields.vendor = "Jio";
    } else if (/\bVodafone\b|\bVi\b/i.test(cleanText)) {
      fields.vendor = "Vodafone Idea";
    } else if (/\bBSNL\b/i.test(cleanText)) {
      fields.vendor = "BSNL";
    } else if (/\bZomato\b/i.test(cleanText)) {
      fields.vendor = "Zomato";
    } else if (/\bSwiggy\b|Bundl Technologies/i.test(cleanText)) {
      fields.vendor = "Swiggy";
    } else if (/\bBlinkit\b|Grofers/i.test(cleanText)) {
      fields.vendor = "Blinkit";
    } else if (/\bZepto\b/i.test(cleanText)) {
      fields.vendor = "Zepto";
    } else if (/\bDominos\b|Jubilant Foodworks/i.test(cleanText)) {
      fields.vendor = "Dominos";
    } else if (/\bUber\b/i.test(cleanText)) {
      fields.vendor = "Uber";
    } else if (/\bOla\b|ANI\s?Technologies/i.test(cleanText)) {
      fields.vendor = "Ola";
    } else if (/\bIndiGo\b|InterGlobe\s?Aviation/i.test(cleanText)) {
      fields.vendor = "IndiGo";
    } else if (/\bNetflix\b|\bSpotify\b|\bGoogle\b|\bApple\b|\bMicrosoft\b/i.test(cleanText)) {
      const match = cleanText.match(/\b(Netflix|Spotify|Google|Apple|Microsoft)\b/i);
      fields.vendor = match ? match[0] : "Digital Service";
    }

    if (fields.vendor !== "Auto-Detected Vendor") {
      fields.confidence += 0.4;
    }

    // 3. INVOICE / ORDER NUMBER
    const invoicePatterns = [
      /(?:Invoice Number|Invoice No|Inv No|Order Number|Order No)[:\s]+([A-Z0-9-]+)/i,
      /Airtel\s*Black\s*ID\s*(\d+)/i,
      /(?:Inv|Bill|Ref|Statement)\s*(?:No|#|Num)?[:\s]*([A-Z0-9/-]{5,})/i
    ];

    for (let pattern of invoicePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        fields.invoiceNo = match[1].trim();
        fields.confidence += 0.3;
        break;
      }
    }

    // 4. TOTAL AMOUNT
    const totalPatterns = [
      /(?:Total\s*Payable|Grand\s*Total|Amount\s*Due|Total\s*Amount|Total)[:\s]*(?:₹|Rs\.?|USD|\$)?\s*([\d,]+\.\d{2})/gi,
      /[₹Rs]\.?\s*([\d,]+\.\d{2})/g
    ];

    let foundTotals = [];
    for (let pattern of totalPatterns) {
      const matches = [...cleanText.matchAll(pattern)];
      for (const match of matches) {
        if (match[1]) {
          const val = parseFloat(match[1].replace(/,/g, ""));
          if (!isNaN(val) && val > 0) foundTotals.push(val);
        }
      }
    }

    if (foundTotals.length > 0) {
      fields.total = Math.max(...foundTotals).toFixed(2);
      fields.confidence += 0.25;
    }

    // 5. DATE
    const datePatterns = [
      /(?:Date|Issued|Statement|Billing)[:\s]*(\d{1,2}[-\/\s](?:[a-z]{3,10}|\d{1,2})[-\/\s]\d{2,4})/i,
      /(\d{2}\.\d{2}\.\d{4})/
    ];

    for (let pattern of datePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        fields.date = match[1].trim();
        fields.confidence += 0.05;
        break;
      }
    }

    // Final Confidence Cap
    fields.confidence = Math.min(fields.confidence, 1);

  } catch (error) {
    // ✅ This closes the 'try' block correctly now
    console.error("❌ Critical Extraction Error:", error.message);
  }

  return fields;
};